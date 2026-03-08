from django.http import HttpResponse
from django.shortcuts import render
from django.http import StreamingHttpResponse
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response 
from .models import *
from .serializers import *
import json
import requests
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from DACOMP_Guessr.settings import CSRF_COOKIE_AGE
from DACOMP_Guessr import settings
# https://drive.usercontent.google.com/download?id=FILE ID


@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    response = JsonResponse({'csrf_token': token})
    return response


@ensure_csrf_cookie
def set_csrf_token(request):
    response = JsonResponse({"message": "CSRF cookie set"})
    response.set_cookie(
        'csrf_token',
        get_token(request),
        max_age=CSRF_COOKIE_AGE,
        httponly=False,
        samesite='None',
        secure=settings.CSRF_COOKIE_SECURE  # Usa a configuração do settings
    )

    return response


def set_csrf_cookie_view(request):
    """View alternativa que dá mais controle sobre o cookie"""
    from django.conf import settings

    response = JsonResponse({"status": "ok"})

    # Gera o token
    token = get_token(request)

    # Configura o cookie manualmente
    cookie_kwargs = {
        'key': settings.CSRF_COOKIE_NAME,
        'value': token,
        'max_age': settings.CSRF_COOKIE_AGE,
        'httponly': settings.CSRF_COOKIE_HTTPONLY,
        'samesite': settings.CSRF_COOKIE_SAMESITE,
    }

    # Apenas adiciona secure se True
    if settings.CSRF_COOKIE_SECURE:
        cookie_kwargs['secure'] = True

    response.set_cookie(**cookie_kwargs)

    # Também envia no header para o frontend pegar
    response['X-CSRFToken'] = token

    return response

# @csrf_exempt

# === LOCATION ====


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


# ===================

# === PROXY ====


def proxy_drive(request):
    file_id = request.GET.get("id")

    url = f"https://drive.google.com/uc?export=download&id={file_id}"

    r = requests.get(url, stream=True)

    # Extract filename from Content-Disposition header
    content_disposition = r.headers.get("Content-Disposition", "")
    filename = "download"
    if "filename=" in content_disposition:
        filename = content_disposition.split("filename=")[-1].strip('"\'')

    response = StreamingHttpResponse(
        r.iter_content(chunk_size=8192),
        content_type=r.headers.get("Content-Type", "application/octet-stream")
    )
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    return response

# ==================

# === Session ====

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    lookup_field = 'code' 

    @action(detail=True, methods=['post'])
    def update_status(self, request, code=None):
        try:
            session = self.get_object()
            data = request.data
            new_status = data.get("status")
            if new_status in dict(Session.Status.choices):
                session.status = new_status
                session.save()

                if(new_status == Session.Status.PLAYING):
                    # Notifica todos os jogadores via WebSocket
                    channel_layer = get_channel_layer()
                    group_name = f'session_{session.code}'
                    
                    async_to_sync(channel_layer.group_send)(
                        group_name,
                        {
                            'type': 'session_status_update', 
                            'status': ' PLAYING',
                            'message': 'O jogo vai começar!'
                        }
                    )
                return Response({"message": "Status updated"})
            else:
                return Response({"error": "Invalid status"}, status=400)
        except Session.DoesNotExist:
            return Response({"error": "Session not found"}, status=404)
    


# ==================

# ==== Player ====

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

# ==== Round ====

class RoundViewSet(viewsets.ModelViewSet):
    queryset = Round.objects.all()
    serializer_class = RoundSerializer

    @action(detail=False, methods=['get'], url_path='current-image')
    def get_current_round_image(self, request):
        """
        Obtém a imagem do round atual baseado no session_code e round_number
        Uso: /api/rounds/current-image/?session_code=ABC123&round_number=1
        """
        round_number = request.query_params.get('round_number')
        session_code = request.query_params.get('session_code')
        
        if not session_code or not round_number:
            return JsonResponse(
                {"error": "session_code and round_number are required"}, 
                status=400
            )
        
        try:
            # Primeiro, encontra a Session pelo code
            from .models import Session  # Importe no topo do arquivo
            session = Session.objects.get(code=session_code)
            
            # Depois, busca o round específico usando o session_id encontrado
            round = Round.objects.get(
                session_id=session.id, 
                round_number=round_number
            )
            
            # Acessa a imagem através do relacionamento
            image_url = round.location.image_url
            
            return JsonResponse({
                "round_number": round.round_number,
                "image_url": image_url,
                "session_code": session.code,
                "session_id": session.id  # Opcional, pode ser útil
            })
            
        except Session.DoesNotExist:
            return JsonResponse(
                {"error": f"Session with code '{session_code}' not found"}, 
                status=404
            )
        except Round.DoesNotExist:
            return JsonResponse(
                {"error": f"Round {round_number} not found for session {session_code}"}, 
                status=404
            )