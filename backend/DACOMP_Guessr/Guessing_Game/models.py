import uuid
import random
import string
from django.db import models
from django.utils import timezone
import os
from io import BytesIO
import requests
from PIL import Image
from django.conf import settings

class Session(models.Model):
    # Opções para o campo status (Enum)
    class Status(models.TextChoices):
        INACTIVE = 'INACTIVE', 'Inativa'
        LOBBY = 'LOBBY', 'Aguardando'
        PLAYING = 'PLAYING', 'Jogando'
        FINISHED = 'FINISHED', 'Finalizado'

    # ID curto para entrar na sala (ex: X7B2)
    code = models.CharField(max_length=4, unique=True, db_index=True)
    name = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        if not self.code:  # Gera código apenas se não existir
            self.code = self.generate_unique_code()
        super().save(*args, **kwargs)

    def generate_unique_code(self):
        while True:
            code = ''.join(random.choices(
                string.ascii_uppercase + string.digits, k=4))
            if not Session.objects.filter(code=code).exists():
                return code

    total_rounds = models.IntegerField(default=5)  # Quantas rodadas vai ter
    time_limit = models.IntegerField(default=60)   # Segundos por rodada
    player_limit = models.IntegerField(default=10)

    # Estado atual
    # 0 = lobby, 1 = round 1...
    current_round_number = models.IntegerField(default=0)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.LOBBY
    )

    created_at = models.DateTimeField(auto_now_add=True)
    round_started_at = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return f"{self.name} ({self.code})"

class Location(models.Model):
    image_url = models.URLField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()
    place_name = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=50, default="Norte")

    def convert_to_webp(self):
        """Baixa ou abre a imagem original, redimensiona (máx 1920x1080) e salva em WebP (quality=80)."""
        if not self.image_url:
            return

        media_subdir = os.path.join(settings.MEDIA_ROOT, "locations")
        os.makedirs(media_subdir, exist_ok=True)

        identifier = self.id if self.id else uuid.uuid4().hex[:8]
        filename = f"location_{identifier}.webp"
        file_path = os.path.join(media_subdir, filename)
        expected_url = f"{settings.MEDIA_URL}locations/{filename}"

        # Se já está convertido e o arquivo existe no disco, apenas garante a URL correta
        if self.image_url == expected_url and os.path.exists(file_path):
            return

        try:
            if self.image_url.startswith(("http://", "https://")):
                response = requests.get(self.image_url, timeout=15)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
            else:
                local_src = os.path.join(
                    settings.MEDIA_ROOT,
                    self.image_url.replace(settings.MEDIA_URL, "").lstrip("/")
                )
                if not os.path.exists(local_src):
                    return
                img = Image.open(local_src)

            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            img.thumbnail((1920, 1080), Image.LANCZOS)
            img.save(file_path, format="WEBP", quality=80)
            self.image_url = expected_url
        except Exception as e:
            print(f"Erro ao converter imagem da Location {self.id} para WebP: {e}")

    def ensure_webp_url(self):
        """Garante que a Location tenha o arquivo WebP gerado e atualiza o banco se necessário."""
        old_url = self.image_url
        self.convert_to_webp()
        if self.image_url != old_url and self.pk:
            Location.objects.filter(pk=self.pk).update(image_url=self.image_url)
        return self.image_url

    def save(self, *args, **kwargs):
        if not self.pk:
            super().save(*args, **kwargs)
            old_url = self.image_url
            self.convert_to_webp()
            if self.image_url != old_url:
                super().save(update_fields=["image_url"])
        else:
            self.convert_to_webp()
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.place_name} ({self.id})"


class Round(models.Model):
    session = models.ForeignKey(
        Session, related_name='rounds', on_delete=models.CASCADE)
    location = models.ForeignKey(
        Location, related_name='used_in_rounds', on_delete=models.CASCADE)

    # Qual o número dessa rodada nessa sessão específica?
    round_number = models.IntegerField()

    class Meta:
        # Garante que na Sessão X não tenha duas rodadas número 1
        unique_together = ('session', 'round_number')
        # Garante que venha na ordem certa (1, 2, 3...)
        ordering = ['round_number']


class Player(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relacionamento: Player pertence a uma Session
    session = models.ForeignKey(
        Session, related_name='players', on_delete=models.CASCADE)

    nickname = models.CharField(max_length=30)
    is_connected = models.BooleanField(default=True)
    is_ready = models.BooleanField(default=False)

    avatar_config = models.JSONField(default=dict)

    score = models.FloatField(default=0.0)
    last_round_score = models.FloatField(default=0.0)

    def __str__(self):
        return self.nickname


class Guess(models.Model):
    player = models.ForeignKey(
        Player, related_name='guesses', on_delete=models.CASCADE)
    round = models.ForeignKey(
        Round, related_name='guesses', on_delete=models.CASCADE)
    session = models.ForeignKey(
        Session, related_name='guesses', on_delete=models.CASCADE, null=True,
        blank=True  # Permite que o Django aceite formulários sem esse campo
        )

    # Onde o jogador clicou
    latitude_guess = models.FloatField()
    longitude_guess = models.FloatField()
    distance_in_meters = models.FloatField()
    points_awarded = models.IntegerField()

    # Desempate
    timestamp = models.DateTimeField(auto_now_add=True)
