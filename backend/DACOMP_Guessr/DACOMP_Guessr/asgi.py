"""
ASGI config for DACOMP_Guessr project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
#from channels.auth import AuthMiddlewareStack
#from channels.security.websocket import AllowedHostsOriginValidator
import Guessing_Game.routing
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DACOMP_Guessr.settings')

django_asgi_app = get_asgi_application()

'''
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                Guessing_Game.routing.websocket_urlpatterns
            )
        )
    ),
})
'''

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(
        Guessing_Game.routing.websocket_urlpatterns
    ),
})
