import json
from asgiref.sync import async_to_sync
import threading
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from django.utils import timezone
from .models import Session, Player, Round, Location, Guess
from .gamelogic import GRACE_PERIOD_SECONDS, run_game_loop, trigger_round_skip
import math

STARTING_SESSIONS = set()
STARTING_SESSIONS_LOCK = threading.Lock()


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
                player.is_ready = False
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
            'is_connected': p.is_connected,
            'is_ready': p.is_ready
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
        action = data.get('action') or data.get('type')

        if action == 'ping':
            self.send(text_data=json.dumps({
                'type': 'pong',
                'server_now': int(timezone.now().timestamp() * 1000)
            }))
            return

        if action == 'sync_request':
            self.handle_sync_request(data)
            return

        if action == 'start_round':
            self.start_round_time()
        if action == 'join':
            self.handle_join(data)
        elif action == 'reconnect':
            self.handle_reconnect(data)
        elif action == 'update_avatar':
            self.handle_avatar_update(data)
        elif action == 'set_ready':
            self.handle_set_ready(data)
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

        existing_player = getattr(self, 'player', None)
        if id:
            try:
                existing_player = Player.objects.get(id=id, session=self.session)
            except Player.DoesNotExist:
                existing_player = None
        
        if existing_player:
            # Reativa
            existing_player.is_connected = True
            existing_player.is_ready = False
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
        self.session.refresh_from_db()

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

        # Envia sempre o estado completo da partida (imagem, round e timer) para o cliente
        self.handle_sync_request(data)

    def handle_sync_request(self, data=None):
        """Retorna o estado completo atual da sala para reidratação do cliente"""
        self.session.refresh_from_db()

        player_id = (data or {}).get('player_id') or getattr(self, 'id', None)
        if player_id:
            try:
                self.player = Player.objects.get(id=player_id, session=self.session)
                self.id = self.player.id
                if not self.player.is_connected:
                    self.player.is_connected = True
                    self.player.save(update_fields=['is_connected'])
            except Player.DoesNotExist:
                pass

        now = timezone.now()
        round_started_ms = (
            int(self.session.round_started_at.timestamp() * 1000)
            if self.session.round_started_at else None
        )

        remaining_time = 0
        if self.session.status == Session.Status.PLAYING and self.session.round_started_at:
            elapsed = (now - self.session.round_started_at).total_seconds()
            remaining_time = max(0, int(round(self.session.time_limit - elapsed)))

        image_url = ""
        preload_urls = []
        guessed_player_ids = []
        already_guessed = False

        if self.session.current_round_number > 0:
            try:
                round_obj = Round.objects.select_related("location").get(
                    session=self.session,
                    round_number=self.session.current_round_number
                )
                image_url = round_obj.location.ensure_webp_url()
                future_rounds = (
                    Round.objects.select_related("location")
                    .filter(
                        session=self.session,
                        round_number__in=[
                            self.session.current_round_number + 1,
                            self.session.current_round_number + 2,
                        ],
                    )
                    .order_by("round_number")
                )
                preload_urls = [r.location.ensure_webp_url() for r in future_rounds]
                guessed_player_ids = [
                    str(pid) for pid in Guess.objects.filter(
                        session=self.session,
                        round=round_obj
                    ).values_list('player_id', flat=True)
                ]
                if player_id:
                    already_guessed = str(player_id) in guessed_player_ids
            except Round.DoesNotExist:
                pass

        player_score = self.player.score if hasattr(self, 'player') and self.player else 0

        self.send(text_data=json.dumps({
            'type': 'sync_state',
            'session_status': self.session.status,
            'current_round': self.session.current_round_number,
            'total_rounds': self.session.total_rounds,
            'time_limit': self.session.time_limit,
            'round_started_at': round_started_ms,
            'server_now': int(now.timestamp() * 1000),
            'remaining_time': remaining_time,
            'image_url': image_url,
            'preload_urls': preload_urls,
            'already_guessed': already_guessed,
            'guessed_player_ids': guessed_player_ids,
            'player_score': player_score,
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
            "round_number": event["round_number"],
            "message": event["message"],
            "round_started_at": event["round_started_at"],
            "server_now": event["server_now"],
            "time_limit": event["time_limit"],
            "current_image_url": event.get("current_image_url", ""),
            "preload_urls": event.get("preload_urls", []),
        }))

    def time_update(self, event):
        self.send(text_data=json.dumps({
            "type": "time_update",
            "round_time": event["round_time"],
            "round_started_at": event.get("round_started_at"),
            "server_now": event.get("server_now"),
            "time_limit": event.get("time_limit"),
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
            'is_ready': player.is_ready,
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
            player.is_ready = False
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
                        'is_connected': player.is_connected,
                        'is_ready': player.is_ready
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

    def handle_set_ready(self, data):
        if not hasattr(self, 'player'):
            self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Jogador ainda não entrou na sessão'
            }))
            return

        self.player.refresh_from_db()
        self.player.is_ready = bool(data.get('ready', False))
        self.player.save(update_fields=['is_ready'])
        self.notify_players_update()

        connected_players = Player.objects.filter(
            session=self.session, is_connected=True
        )
        if (
            self.player.is_ready
            and connected_players.exists()
            and not connected_players.filter(is_ready=False).exists()
        ):
            self.start_game_when_ready()

    def start_game_when_ready(self):
        with STARTING_SESSIONS_LOCK:
            if self.session_code in STARTING_SESSIONS:
                return
            STARTING_SESSIONS.add(self.session_code)

        def delayed_start():
            try:
                import time
                time.sleep(3)
                session = Session.objects.get(code=self.session_code)
                players = Player.objects.filter(session=session, is_connected=True)
                if (
                    session.status != Session.Status.LOBBY
                    or not players.exists()
                    or players.filter(is_ready=False).exists()
                ):
                    return

                session.status = Session.Status.PLAYING
                session.current_round_number = 1
                session.save(update_fields=['status', 'current_round_number'])
                async_to_sync(self.channel_layer.group_send)(
                    self.session_group,
                    {
                        'type': 'session_status_update',
                        'status': 'PLAYING',
                        'message': 'O jogo vai começar!'
                    }
                )
                threading.Thread(
                    target=run_game_loop,
                    args=(session.id, self.channel_layer, self.session_group),
                    daemon=True
                ).start()
            finally:
                with STARTING_SESSIONS_LOCK:
                    STARTING_SESSIONS.discard(self.session_code)

        threading.Thread(target=delayed_start, daemon=True).start()
    
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
        
        # Recupera o player pelo ID enviado no palpite caso o socket tenha reconectado
        if not hasattr(self, 'player') or not self.player:
            fallback_id = data.get("player_id") or data.get("guess", {}).get("player_id")
            if fallback_id:
                try:
                    self.player = Player.objects.get(id=fallback_id, session=self.session)
                    self.id = self.player.id
                except Player.DoesNotExist:
                    pass

        if not hasattr(self, 'player') or not self.player:
            print("ERRO: self.player não está definido!")
            return

        if not self.player.is_connected:
            self.player.is_connected = True
            self.player.save(update_fields=['is_connected'])
        
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
        print(f"Time limit: {self.session.time_limit}s (+ {GRACE_PERIOD_SECONDS}s de tolerância)")

        # Verifica se ultrapassou o tempo limite somado à janela de tolerância
        if elapsed > (self.session.time_limit + GRACE_PERIOD_SECONDS):
            print("ERRO: Tempo esgotado (fora da janela de tolerância)!")
            return

        # Se entrou na janela de tolerância, fixa o tempo gasto em time_limit (remaining_time = 0)
        effective_elapsed = min(elapsed, float(self.session.time_limit))
        remaining_time = max(0.0, self.session.time_limit - effective_elapsed)
        print(f"Tempo restante considerado para pontuação: {remaining_time}s")

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
            latitude_guess=guess_lat,
            longitude_guess=guess_lon,
            distance_in_meters=distance,
            points_awarded=score,
            timestamp=guess_time,
            player_id=self.player.id,
            round_id=round_obj.id,
            session_id=self.session.id
        )

        self.send(text_data=json.dumps({
            'type': 'guess_received',
            'message': 'Palpite Recebido.',
            'score': score,
            'total_score': self.player.score
        }))

        # Verifica se todos os jogadores conectados na sessão já registaram palpite nesta rodada
        total_players = (
            self.session.players.filter(is_connected=True).count()
            or self.session.players.count()
        )
        total_guesses = (
            Guess.objects.filter(session=self.session, round=round_obj)
            .values('player_id')
            .distinct()
            .count()
        )
        print(f"Palpites registados na rodada {round_obj.round_number}: {total_guesses}/{total_players}")

        if total_players > 0 and total_guesses >= total_players:
            trigger_round_skip(self.session.id)

        print("=== FIM PROCESSAMENTO ===\n")
