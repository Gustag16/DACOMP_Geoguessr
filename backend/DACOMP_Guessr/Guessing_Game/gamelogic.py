# game_logic.py
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from .models import Session, Round, Player, Guess

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
    
    while session.current_round_number < (session.total_rounds + 1):
        session.refresh_from_db()
        # Início do round
        async_to_sync(channel_layer.group_send)(
            session_group,
            {
                "type": "round_start",
                "round_number": session.current_round_number,
                "message": f"Round {session.current_round_number} começou!"
            }
        )
        current_time = session.time_limit
        round_obj = Round.objects.select_related("location").get(
        session=session,
        round_number=session.current_round_number
        )
        session.round_started_at = timezone.now()
        session.save(update_fields=["round_started_at"])

        # zera os pontos da ultima rodada de todo mundo
        Player.objects.filter(session=session).update(last_round_score=0)

        # Aguarda o tempo do round
        while (current_time !=-1):
            time.sleep(1)
            current_time -=1
            async_to_sync(channel_layer.group_send)(
            session_group,
                {
                    "type": "time_update",
                    "round_time": current_time,
                }
            )
            
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

        # Incrementa round
        session.current_round_number += 1
        session.save()
        
        # Pequena pausa entre rounds
        time.sleep(5)
    

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
    session.status = Session.Status.FINISHED
    session.save()