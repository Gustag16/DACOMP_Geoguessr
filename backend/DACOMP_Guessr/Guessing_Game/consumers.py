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
        # Quando desconectar, marca como desconectado e notifica todos
        if hasattr(self, 'id') and self.id:
            try:

                player = Player.objects.get(id=self.id)
                
                player.is_connected = False
                player.save()
                
                print(f"Jogador {player.nickname} desconectado")
                
                self.notify_players_update()
                
                thread = threading.Thread(target=self.delete_player_on_delayed_disconnection, args=(self.id,))
                thread.start()
                
            except Player.DoesNotExist:
                pass  # Jogador não existe mais
        
        async_to_sync(self.channel_layer.group_discard)(
            self.session_group,
            self.channel_name
        )
    
    def notify_players_update(self):
        """Envia a lista atualizada de jogadores para todos na sala"""
        # Busca todos os jogadores da sessão (incluindo desconectados)
        all_players = Player.objects.filter(session=self.session)
        
        player_list = [{
            'id': str(p.id),
            'nickname': p.nickname,
            'avatar_config': p.avatar_config,
            'is_connected': p.is_connected
        } for p in all_players]
        
        # Envia para todos no grupo
        async_to_sync(self.channel_layer.group_send)(
            self.session_group,
            {
                'type': 'players_list',
                'players': player_list
            }
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

    def handle_join(self, data):
        if (self.session.status == "PLAYING") or (self.session.status == "FINISHED"):
             self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'A sessão já começou. Não é possível entrar.'
            }))
             return
             
        player_data = data['player']
        nickname = player_data['nickname']
        id = player_data.get('id') 
        avatar_config = player_data['avatar_config']

        existing_player = None
        if id:
            try:
                existing_player = Player.objects.get(id=id, session=self.session)
            except Player.DoesNotExist:
                existing_player = None
        
        if existing_player:
            # Reativa
            existing_player.is_connected = True
            existing_player.save()
            player = existing_player
        else:
            # Cria novo
            player = Player.objects.create(
                session=self.session,
                nickname=nickname,
                avatar_config={
                    'head': 'redonda',
                    'face': 'feliz',
                    'acc': 'chapeu',
                    'color': 'azul'
                },
                is_connected=True
            )

        self.id = player.id

        # Retorna o ID do jogador para o frontend armazenar
        self.send(text_data=json.dumps({
            'type': 'join_success',
            'id': str(player.id),
            'avatar_config': player.avatar_config,
            'message': f'Bem-vindo, {player.nickname}!'
        }))

        self.notify_players_update()
    
    def players_list(self, event):
        """Método chamado quando o grupo recebe uma mensagem do tipo 'players_list'"""
        self.send(text_data=json.dumps({
            'type': 'players_list',
            'players': event['players']
        }))
        
    def start_round_timer(self):
        """Inicia uma thread para o timer (já que é síncrono)"""
        def timer_thread():
            import time
            time.sleep(5)  #Delay pra iniciar round
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

        if self.session.current_round_number > self.session.total_rounds:
            self.session.status = Session.Status.FINISHED
            self.session.save()
            self.broadcast_session_status(Session.Status.FINISHED)
        else:
            self.session.current_round_number += 1
            self.session.save()
            self.broadcast_session_status(Session.Status.PLAYING)

    def handle_list_players(self):
        players = Player.objects.filter(session=self.session, is_connected=True)
        player_list = [{
            'id': str(player.id),
            'nickname': player.nickname,
            'avatar_config': player.avatar_config,
            'is_connected': player.is_connected,
            'session': str(player.session.id),
        } for player in players]

        self.send(text_data=json.dumps({
            'type': 'players_list',
            'players': player_list
        }))

    def delete_player_on_delayed_disconnection(self, player_id):
        # Espera um tempo para garantir que a desconexão foi intencional
        import time
        time.sleep(30) 
        try:
            player = Player.objects.get(id=player_id)
            if not player.is_connected:
                player.delete()
                print(f"Jogador {player.nickname} deletado após desconexão prolongada.")
                
        except Player.DoesNotExist:
            pass  # Já foi deletado ou não existe

    def handle_avatar_update(self, data):
        """Atualiza o avatar de um jogador existente"""
        player_data = data['player']
        player_id = player_data.get('id')
        avatar_config = player_data['avatar_config']
        
        try:
            player = Player.objects.get(id=player_id, session=self.session)
            player.avatar_config = avatar_config
            player.save()
            
            # Notifica todos os jogadores sobre a atualização
            async_to_sync(self.channel_layer.group_send)(
                self.session_group,
                {
                    'type': 'player_updated',
                    'player': {
                        'id': str(player.id),
                        'nickname': player.nickname,
                        'avatar_config': player.avatar_config,
                        'is_connected': player.is_connected
                    }
                }
            )
        except Player.DoesNotExist:
            self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Jogador não encontrado'
            }))

    def player_updated(self, event):
        """Envia atualização de jogador para todos na sala"""
        self.send(text_data=json.dumps({
            'type': 'player_update',
            'player': event['player']
        }))
    
    def broadcast_session_status(self, status):
        """Envia o novo status da sessão para todos os jogadores"""
        async_to_sync(self.channel_layer.group_send)(
            self.session_group,
            {
                'type': 'session_status_update',
                'status': status,
                'message': f'Sessão alterada para: {status}'
            }
    )
    
    def session_status_update(self, event):
        """Método chamado quando o grupo recebe uma atualização de status"""
        self.send(text_data=json.dumps({
            'type': 'session_status_update',
            'status': event['status'],
            'message': event['message']
        }))

    def session_round_update(self, event):
        """Envia o número da rodada atualizada para todos os jogadores"""
        self.send(text_data=json.dumps({
            'type': 'session_round_update',
            'current_round': event['current_round'],
            'total_rounds': event['total_rounds']
        }))
    


class SessionConsumer(WebsocketConsumer):
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


