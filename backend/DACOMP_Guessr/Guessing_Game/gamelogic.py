# game_logic.py
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Session

def run_game_loop(session_id, channel_layer, session_group):
    """
    Função independente para gerenciar o loop do jogo
    """
    session = Session.objects.get(id=session_id)
    
    # Garantir que o número do round comece do 1
    session.current_round_number = 1
    session.save()
    
    while session.current_round_number < session.total_rounds:
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
        # Aguarda o tempo do round
        while (current_time !=0):
            time.sleep(1)
            current_time -=1
            async_to_sync(channel_layer.group_send)(
            session_group,
            {
                "type": "round_time_update",
                "round_number": session.current_round_number,
                "message": f"Round {session.current_round_number} começou!"
            }
            )

        
        # Fim do round
        async_to_sync(channel_layer.group_send)(
            session_group,
            {
                "type": "round_timeout",
                "round_number": session.current_round_number,
                "message": f"Tempo do round {session.current_round_number} esgotado!"
            }
        )
        time.sleep(10) 

        # Incrementa round
        session.current_round_number += 1
        session.save()
        
        # Pequena pausa entre rounds
        time.sleep(2)
    
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