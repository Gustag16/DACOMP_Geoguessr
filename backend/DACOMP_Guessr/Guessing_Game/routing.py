from django.urls import re_path
from . import consumers # Import your consumers

websocket_urlpatterns = [
    # Example 1: Static path
    re_path(r'ws/status/$', consumers.StatusConsumer.as_asgi()),

    # Example 2: Path with a dynamic argument
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    
    # You can also use Django's standard path
    # path("ws/presence", consumers.PresenceConsumer.as_asgi()),
]
