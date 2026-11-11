# game_logic.py
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from .models import Session, Round, Player, Guess

import threading

GRACE_PERIOD_SECONDS = 2.0
ROUND_SKIP_EVENTS = {}


def get_round_skip_event(session_id):
    """Obtém ou cria o evento de encerramento antecipado para a sessão."""
    sid = str(session_id)
    if sid not in ROUND_SKIP_EVENTS:
        ROUND_SKIP_EVENTS[sid] = threading.Event()
    return ROUND_SKIP_EVENTS[sid]


def trigger_round_skip(session_id):
    """Sinaliza que todos os jogadores da sessão já registaram palpite."""
    sid = str(session_id)
    if sid in ROUND_SKIP_EVENTS:
        ROUND_SKIP_EVENTS[sid].set()


def run_game_loop(session_id, channel_layer, session_group):
    """
    Função independente para gerenciar o loop do jogo
    """
    session = Session.objects.get(id=session_id)
    
    # Garantir que o número do round comece do 1
    session.current_round_number = 1
    session.save()

    # zera os pontos de todo mundo antes do jogo iniciar
    Player.objects.filter(session=session).update(score=0, last_round_score=0)

    # Aguarda os clientes navegarem do Lobby para a tela de GameSession
    time.sleep(1.5)

    for round_num in range(1, session.total_rounds + 1):
        session.refresh_from_db()
        session.current_round_number = round_num
        session.save(update_fields=["current_round_number"])

        round_obj = Round.objects.select_related("location").get(
            session=session,
            round_number=round_num
        )
        current_image_url = round_obj.location.ensure_webp_url()

        # Busca as URLs das rodadas N+1 e N+2 para Look-Ahead Cache (Preload)
        future_rounds = (
            Round.objects.select_related("location")
            .filter(
                session=session,
                round_number__in=[
                    session.current_round_number + 1,
                    session.current_round_number + 2,
                ],
            )
            .order_by("round_number")
        )
        preload_urls = [r.location.ensure_webp_url() for r in future_rounds]

        # Zera os pontos da última rodada antes de iniciar a nova
        Player.objects.filter(session=session).update(last_round_score=0)

        # Salva o horário exato de início da rodada no banco
        now = timezone.now()
        session.round_started_at = now
        session.save(update_fields=["round_started_at"])

        round_started_ms = int(now.timestamp() * 1000)

        # Início do round com timestamps absolutos, imagem atual e preload das próximas
        async_to_sync(channel_layer.group_send)(
            session_group,
            {
                "type": "round_start",
                "round_number": session.current_round_number,
                "message": f"Round {session.current_round_number} começou!",
                "round_started_at": round_started_ms,
                "server_now": int(timezone.now().timestamp() * 1000),
                "time_limit": session.time_limit,
                "current_image_url": current_image_url,
                "preload_urls": preload_urls,
            }
        )

        skip_event = get_round_skip_event(session.id)
        skip_event.clear()
        all_guessed = False
        last_sync_second = 0

        # Loop de duração da rodada em fatias de 0.2s com verificação de palpites
        while True:
            elapsed = (timezone.now() - session.round_started_at).total_seconds()
            if elapsed >= session.time_limit:
                break

            current_second = int(elapsed)
            # Envia confirmação de sincronia uma única vez a cada 5 segundos
            if current_second > 0 and current_second % 5 == 0 and current_second != last_sync_second:
                last_sync_second = current_second
                async_to_sync(channel_layer.group_send)(
                    session_group,
                    {
                        "type": "time_update",
                        "round_time": max(0, int(session.time_limit - elapsed)),
                        "round_started_at": round_started_ms,
                        "server_now": int(timezone.now().timestamp() * 1000),
                        "time_limit": session.time_limit,
                    }
                )

            # 5 verificações de 0.2 segundos (perfazendo 1s) ou interrupção imediata via evento
            for _ in range(5):
                if skip_event.wait(timeout=0.2):
                    all_guessed = True
                    break

                total_players = (
                    session.players.filter(is_connected=True).count()
                    or session.players.count()
                )
                total_guesses = (
                    Guess.objects.filter(session=session, round=round_obj)
                    .values("player_id")
                    .distinct()
                    .count()
                )
                if total_players > 0 and total_guesses >= total_players:
                    all_guessed = True
                    break

            if all_guessed:
                print(f"Todos os jogadores palpitaram no round {session.current_round_number}. Encerrando antecipadamente!")
                break

        # Só aguarda a janela de tolerância de rede se o tempo tiver esgotado sem todos jogarem
        if not all_guessed:
            time.sleep(GRACE_PERIOD_SECONDS)

            
        players = Player.objects.filter(session=session).order_by("-score")
        players_data = [
        {
            "id": str(p.id),
            "nickname": p.nickname,
            "score": p.score,
            "last_round_score": p.last_round_score,
            "avatar_config": p.avatar_config
        }
        for p in players
        ]

        guesses = Guess.objects.filter(session=session, round=round_obj)
        guesses_data = [
            {
                "id": str(g.id),
                "latitude_guess": g.latitude_guess,
                "longitude_guess": g.longitude_guess,
                "distance_in_meters": g.distance_in_meters,
                "points_awarded": g.points_awarded,
                "timestamp": g.timestamp.isoformat(),
                "player_id":str(g.player_id),
                "round_id": g.round_id,
                "session_id": g.session_id
            }
            for g in guesses
        ]
        # Fim do round
        async_to_sync(channel_layer.group_send)(
            session_group,
            {
                "type": "round_timeout",
                "round_number": session.current_round_number,
                "message": f"Tempo do round {session.current_round_number} esgotado!",
                "correct_lon": round_obj.location.longitude,
                "correct_lat": round_obj.location.latitude,
                "players": players_data,
                "guesses": guesses_data
            }
        )

        # Pequena pausa entre rounds
        time.sleep(7)
    

    # prepara o ranking final definitivo para a tela de pódio
    final_players = Player.objects.filter(session=session).order_by("-score")
    final_players_data = [
        {
            "id": str(p.id),
            "nickname": p.nickname,
            "score": p.score,
            "avatar_config": p.avatar_config
        }
        for p in final_players
    ]

    session.current_round_number = 0
    session.status = Session.Status.LOBBY
    session.save(update_fields=["current_round_number", "status"])

    async_to_sync(channel_layer.group_send)(
        session_group,
        {
            "type": "session_status_update",
            "status": "FINISHED",
            "message": "Jogo finalizado!",
            "players": final_players_data  # envia pro front o vencedor
        }
    )
    
    # Atualiza status da sessão
    Guess.objects.filter(session=session).delete()

    ROUND_SKIP_EVENTS.pop(str(session.id), None)

    Player.objects.filter(session=session).update(
        last_round_score=0,
        score=0,
        is_ready=False,
    )