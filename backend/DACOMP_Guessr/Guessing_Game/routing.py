from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Exemplo: ws://seudominio.com/ws/lobby/ABC123/
    re_path(r'ws/lobby/(?P<session_code>\w+)/$', consumers.PlayerConsumer.as_asgi()),
]
