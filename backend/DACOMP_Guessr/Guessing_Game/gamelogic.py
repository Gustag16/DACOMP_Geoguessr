# game_logic.py
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from .models import Session, Round, Player

def run_game_loop(session_id, channel_layer, session_group):
    """
    Função independente para gerenciar o loop do jogo
    """
    session = Session.objects.get(id=session_id)
    
    # Garantir que o número do round comece do 1
    session.current_round_number = 1
    session.save()
    
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

        # Aguarda o tempo do round
        while (current_time !=0):
            time.sleep(1)
            current_time -=1

        players = Player.objects.filter(session=session).order_by("-score")
        players_data = [
        {
            "id": str(p.id),
            "nickname": p.nickname,
            "score": p.score,
            "last_round_score": p.last_round_score
        }
        for p in players
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
                "players": players_data
            }
        )

        # Incrementa round
        session.current_round_number += 1
        session.save()
        
        # Pequena pausa entre rounds
        time.sleep(4)
    
    # Jogo finalizado
    async_to_sync(channel_layer.group_send)(
        session_group,
        {
            "type": "session_status_update",
            "status": "FINISHED",
            "message": "Jogo finalizado!"
        }
    )
    
    # Atualiza status da sessão
    session.status = Session.Status.FINISHED
    session.save()