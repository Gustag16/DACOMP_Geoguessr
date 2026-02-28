import json
import asyncio
from asgiref.sync import async_to_sync
import threading
from channels.generic.websocket import WebsocketConsumer
from .models import Session, Player


class PlayerConsumer(WebsocketConsumer):
    def connect(self):
        self.session_code = self.scope['url_route']['kwargs']['session_code']
        self.session_group = f'session_{self.session_code}'

        try:
            self.session = Session.objects.get(code=self.session_code)

            async_to_sync(self.channel_layer.group_add)(
                self.session_group,
                self.channel_name
            )
            self.accept()

        except Session.DoesNotExist:
            self.close()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.session_group,
            self.channel_name
        )

    def receive(self, text_data):

        data = json.loads(text_data)
        action = data.get('action')

        if action == 'start_round':
            self.start_round_time()
        if action == 'join':
            self.handle_join(data)
        elif action == 'update_avatar':
            self.handle_avatar_update(data)

    def handle_join(self, data):

        player_data = data['player']

        player = Player.objects.create(
            session=self.session,
            nickname=player_data['nickname'],
            # face=player_data['avatar_config']['face'],
            # hat=player_data['avatar_config'].get('hat', ''),
            # accessory=player_data['avatar_config'].get('accessory', ''),
            # color=player_data['avatar_config']['color'],
            avatar_config=player_data['avatar_config'],
            is_connected=True
        )

        # Guardar o ID do jogador para uso futuro
        self.player_id = player.id

        # Confirmar para o cliente
        self.send(text_data=json.dumps({
            'type': 'join_success',
            'player_id': str(player.id),
            'message': f'Bem-vindo, {player.nickname}!'
        }))

    def start_round_timer(self):
        """Inicia uma thread para o timer (já que é síncrono)"""
        def timer_thread():
            import time
            time.sleep(self.session.time_limit)  # Espera o tempo limite

            async_to_sync(self.channel_layer.group_send)(
                self.session_group,
                {
                    'type': 'round_timeout',
                    'message': 'Tempo esgotado!'
                }
            )

        thread = threading.Thread(target=timer_thread)
        thread.start()

    def round_timeout(self, event):
        self.send(text_data=json.dumps({
            'type': 'timeout',
            'message': event['message']
        }))

    def player_joined(self, event):
        self.send(text_data=json.dumps({
            'type': 'player_update',
            'player': event['player']
        }))
