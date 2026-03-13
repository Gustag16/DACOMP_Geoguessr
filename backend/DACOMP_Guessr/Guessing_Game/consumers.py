import json
from asgiref.sync import async_to_sync
import threading
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from django.utils import timezone
from .models import Session, Player, Round, Location, Guess
import math


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)

    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c  # distância em metros

def distance_score(distance_m):
    score = 1000 * math.exp(-distance_m / 600)
    return min(1000, score)

def time_multiplier(remaining_time, time_limit):
    return remaining_time / time_limit

def calculate_score(guess_lat, guess_lon, real_lat, real_lon, remaining_time, time_limit):

    distance = haversine(guess_lat, guess_lon, real_lat, real_lon)

    dist_score = distance_score(distance)
    print(dist_score)

    time_bonus = time_multiplier(remaining_time, time_limit)

    final_score = dist_score * (0.75 + 0.25 * time_bonus)

    return max(0, min(1000, round(final_score)))

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
        elif action == 'reconnect':
            self.handle_reconnect(data)
        elif action == 'update_avatar':
            self.handle_avatar_update(data)
        elif action == 'list_players':
            self.handle_list_players()
        elif action == 'start_round_manual':
            self.start_round_manual()
        elif action == 'submit_guess':
            print("*** PROCESSANDO GUESS ***")
            self.process_guess(data)

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
        new = False

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
            new = True

        self.id = player.id
        self.player = player

        # Retorna o ID do jogador para o frontend armazenar
        self.send(text_data=json.dumps({
            'type': 'join_success',
            'id': str(player.id),
            'avatar_config': player.avatar_config,
            'message': f'Bem-vindo, {player.nickname}!',
            'new': new,
            'nickname': player.nickname,
        }))

        self.notify_players_update()
    
    def handle_reconnect(self, data):
        """Método específico para reconexão"""
        player_id = data.get('player_id')
        
        try:
            player = Player.objects.get(id=player_id, session=self.session)
            
            # Atualiza status de conexão
            player.is_connected = True
            player.save()
            
            self.id = player.id
            self.player = player
            print(f"self.player setado: {self.player.nickname}") 
            
            self.send(text_data=json.dumps({
                'type': 'reconnect_success',
                'id': str(player.id),
                'nickname': player.nickname,
                'avatar_config': player.avatar_config,
                'session_status': self.session.status,
                'current_round': self.session.current_round_number,
                'total_rounds': self.session.total_rounds,
                'player_score': player.score
            }))
            
            
            
        except Player.DoesNotExist:
            self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Jogador não encontrado para reconexão'
            }))


    def players_list(self, event):
        """Método chamado quando o grupo recebe uma mensagem do tipo 'players_list'"""
        self.send(text_data=json.dumps({
            'type': 'players_list',
            'players': event['players']
        }))
        
    '''
    def run_game_loop(self, session_id, channel_layer, session_group):
        import time
        session = Session.objects.get(id=session_id)

        while session.current_round_number <= session.total_rounds:

            async_to_sync(channel_layer.group_send)(
                session_group,
                {
                    "type": "round_start",
                    "message": "Round começou!"
                }
            )

            time.sleep(session.round_time)

            async_to_sync(channel_layer.group_send)(
                session_group,
                {
                    "type": "round_timeout",
                    "message": "Tempo esgotado!"
                }
            )

            session.current_round_number += 1
            session.save()

        async_to_sync(channel_layer.group_send)(
            session_group,
            {
                "type": "session_status_update",
                "status": "FINISHED"
            }
        )
    '''
        
    def round_start(self, event):
        self.send(text_data=json.dumps({
            "type": "round_start",
            "message": event["message"]
        }))

    def time_update(self, event):
        self.send(text_data=json.dumps({
            "type": "time_update",
            "round_time": event["round_time"]
        }))
        
    def round_timeout(self, event):
        self.send(text_data=json.dumps({
            "type": "round_timeout",
            "message":event["message"],
            "round_number": event["round_number"],
            "correct_lon": event["correct_lon"],
            "correct_lat": event["correct_lat"],
            "players": event["players"],
            "guesses": event["guesses"]
        }))

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
        time.sleep(90) 
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
        player_nickname = player_data.get('nickname')
        
        try:
            player = Player.objects.get(id=player_id, session=self.session)
            player.avatar_config = avatar_config
            player.nickname = player_nickname
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
                'status':status,
                'message': f'Sessão alterada para: {status}',
                'current_round': self.session.current_round_number,
                'total_rounds': self.session.total_rounds
            }
    )
    
    def session_status_update(self, event):
        """Método chamado quando o grupo recebe uma atualização de status"""
        self.send(text_data=json.dumps({
            'type': 'session_status_update',
            'status': event['status'],
            'message': event['message'],
            'players': event.get('players', [])
        }))

        import time
        time.sleep(2)

    '''
    def start_round_manual(session_code):
        session = Session.objects.get(code=session_code)
        channel_layer = get_channel_layer()
        session_group = f"session_{session_code}"

        thread = threading.Thread(
            target=run_game_loop,
            args=(session.id, channel_layer, session_group),
            daemon=True
        )
        thread.start()
    '''

    def session_round_update(self, event):
        """Envia o número da rodada atualizada para todos os jogadores"""
        self.send(text_data=json.dumps({
            'type': 'session_round_update',
            'current_round': event['current_round'],
            'total_rounds': event['total_rounds']
        }))

    def process_guess(self, data):
        print(f"\n=== PROCESSANDO GUESS ===")
        self.session.refresh_from_db()
        print(f"Player: {self.player.nickname if hasattr(self, 'player') else 'None'}")
        print(f"Dados recebidos: {data}")
        
        # Verifica se o player existe
        if not hasattr(self, 'player') or not self.player:
            print("ERRO: self.player não está definido!")
            return
        
        try:
            guess_lat = data["guess"]["latitude"]
            guess_lon = data["guess"]["longitude"]
            print(f"Coordenadas do palpite: {guess_lat}, {guess_lon}")
        except KeyError as e:
            print(f"ERRO: Dados do guess incompletos: {e}")
            return

        guess_time = timezone.now()
        print(f"round_started_at: {self.session.round_started_at}")
        print(f"guess_time: {guess_time}")
        
        if not self.session.round_started_at:
            print("ERRO: round_started_at é None")
            return

        elapsed = (guess_time - self.session.round_started_at).total_seconds()
        print(f"Tempo decorrido: {elapsed}s")
        print(f"Time limit: {self.session.time_limit}s")
        
        remaining_time = self.session.time_limit - elapsed
        print(f"Tempo restante: {remaining_time}s")
        
        if remaining_time < 0:
            print("ERRO: Tempo esgotado!")
            return

        try:
            round_obj = Round.objects.select_related("location").get(
                session=self.session,
                round_number=self.session.current_round_number
            )
            print(f"Rodada encontrada: {round_obj.round_number}")
            print(f"Localização real: {round_obj.location.latitude}, {round_obj.location.longitude}")
        except Round.DoesNotExist:
            print(f"ERRO: Rodada não encontrada para session {self.session.id}, round {self.session.current_round_number}")
            return

        # Calcula distância para debug
        distance = haversine(guess_lat, guess_lon, round_obj.location.latitude, round_obj.location.longitude)
        print(f"Distância calculada: {distance}m")
        
        score = calculate_score(
            guess_lat,
            guess_lon,
            round_obj.location.latitude,
            round_obj.location.longitude,
            remaining_time,
            self.session.time_limit
        )
        
        print(f"Score calculado: {score}")
        print(f"Score atual do jogador antes: {self.player.score}")
        
        # Atualiza o score
        self.player.score += score
        self.player.last_round_score = score
        self.player.save()
        
        print(f"Score atual do jogador depois: {self.player.score}")
        print(f"last_round_score: {self.player.last_round_score}")
        
        # Busca o player novamente do banco para confirmar
        # id, latitude_guess, longitude_guess, distance_in_meters,
        # points_awarded, timestamp, player_id, round-id
        player_verification = Player.objects.get(id=self.player.id)
        print(f"VERIFICAÇÃO - Score no banco: {player_verification.score}")

        Guess.objects.create(
            latitude_guess =guess_lat,
            longitude_guess = guess_lon,
            distance_in_meters = distance,
            points_awarded = score,
            timestamp = guess_time,
            player_id = self.player.id,
            round_id = round_obj.id,
            session_id = self.session.id
        )
        
        self.send(text_data=json.dumps({
            'type': 'guess_received',
            'message': 'Palpite Recebido.',
            'score': score,
            'total_score': self.player.score
        }))
        
        print("=== FIM PROCESSAMENTO ===\n")
