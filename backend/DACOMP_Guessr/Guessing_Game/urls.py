from django.urls import path, include
from rest_framework import routers
from .views import LocationViewSet
# O Router cria as rotas padrão REST automaticamente
router = routers.DefaultRouter()
router.register(r'location', LocationViewSet) 


urlpatterns = [
    path('', include(router.urls)),
]