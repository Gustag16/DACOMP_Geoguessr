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
        # Quando desconectar, inicie a exclusão automática se o jogador tiver um ID
        if hasattr(self, 'player_id') and self.player_id:
            # Inicia uma thread para deletar após delay
            thread = threading.Thread(target=self.delete_player_on_delayed_disconnection, args=(self.player_id,))
            thread.start()
        
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
        elif action == 'list_players':
            self.handle_list_players()
    
    def player_joined(self, event):
        self.send(text_data=json.dumps({
            'type': 'player_update',
            'player': event['player']
        }))

    def handle_join(self, data):
        player_data = data['player']
        nickname = player_data['nickname']
        avatar_config = player_data['avatar_config']

        # Verifica se o jogador já existe na sessão (reconexão)
        existing_player = Player.objects.filter(session=self.session, nickname=nickname).first()
        if existing_player:
            # Reativa o jogador existente
            existing_player.is_connected = True
            existing_player.avatar_config = avatar_config  # Atualiza avatar se necessário
            existing_player.save()
            player = existing_player
        else:
            # Cria um novo jogador
            player = Player.objects.create(
                session=self.session,
                nickname=nickname,
                avatar_config=avatar_config,
                is_connected=True
            )

        # Guarda o ID do jogador na instância do consumer
        self.player_id = player.id

        # Confirma para o cliente
        self.send(text_data=json.dumps({
            'type': 'join_success',
            'player_id': str(player.id),
            'message': f'Bem-vindo, {player.nickname}!'
        }))

        # Notifica outros jogadores (só se for novo ou reativado)
        async_to_sync(self.channel_layer.group_send)(
            self.session_group,
            {
                'type': 'player_joined',
                'player': {
                    'id': str(player.id),
                    'nickname': player.nickname,
                    'avatar_config': player.avatar_config
                }
            }
        )
        
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


    def list_players(self):
        players = Player.objects.filter(session=self.session, is_connected=True)
        player_list = [{
            'id': str(player.id),
            'nickname': player.nickname,
            'avatar_config': player.avatar_config
        } for player in players]

        self.send(text_data=json.dumps({
            'type': 'player_list',
            'players': player_list
        }))

    def handle_list_players(self):
        players = Player.objects.filter(session=self.session, is_connected=True)
        player_list = [{
            'id': str(player.id),
            'nickname': player.nickname,
            'avatar_config': player.avatar_config
        } for player in players]

        self.send(text_data=json.dumps({
            'type': 'player_list',
            'players': player_list
    }))

    def delete_player_on_delayed_disconnection(self, player_id):
        # Espera um tempo para garantir que a desconexão foi intencional
        import time
        time.sleep(15)  # Ajuste o tempo conforme necessário
        try:
            player = Player.objects.get(id=player_id)
            # Só deleta se ainda estiver desconectado
            if not player.is_connected:
                player.delete()
                print(f"Jogador {player.nickname} deletado após desconexão prolongada.")
        except Player.DoesNotExist:
            pass  # Já foi deletado ou não existe
