from django.urls import path, include
from rest_framework import routers
from .views import LocationViewSet, SessionViewSet, PlayerViewSet, RoundViewSet
# O Router cria as rotas padrão REST automaticamente
router = routers.DefaultRouter()
router.register(r'location', LocationViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'players', PlayerViewSet) 
router.register(r'rounds', RoundViewSet)

urlpatterns = [
    path('', include(router.urls)),
]