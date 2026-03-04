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
