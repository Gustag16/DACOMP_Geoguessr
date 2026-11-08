# API REST

> Base URL em desenvolvimento: `http://localhost:8000/api`
> Em produção o frontend usa `/api` como base derivada automaticamente de `window.location.origin` (mesmo host, servido pelo Nginx).

A API é construída com [Django REST Framework](https://www.django-rest-framework.org/).
Os ViewSets ficam em `Guessing_Game/views.py` e as rotas em `Guessing_Game/urls.py`.

## CSRF

O frontend usa cookies de sessão com proteção CSRF. Antes das chamadas de escrita
(POST/PATCH/DELETE), é preciso obter o token:

- `GET /api/set-csrf-token/` — define o cookie `csrf_token` e responde `{"message": "CSRF cookie set"}`.
- O comportamento do cookie se adapta dinamicamente conforme a variável `DEBUG` no `.env`:
  - `DEBUG=True` (desenvolvimento local HTTP): `SameSite='Lax'` e `Secure=False`.
  - `DEBUG=False` (produção HTTPS / Cloudflare Tunnel): `SameSite='None'` e `Secure=True`.

## Endpoints

### `GET /api/set-csrf-token/`, `GET /api/get-csrf-token/`
Define/retorna o token CSRF.

### `GET /proxy/?id={file_id}`
Proxy de download do Google Drive (streaming). Usado para baixar as imagens das
localizações sem expor o link direto.

### `GET /admin/`
Painel administrativo do Django (superusuário criado via
`manage.py create_default_admin` — credenciais vindas de `DJANGO_SUPERUSER_*` no `.env`).

### `/api/location/`
`LocationViewSet` (CRUD completo):
- `GET /api/location/` — lista localizações.
- `POST /api/location/` — cria uma localização (converte automaticamente a imagem para `.webp`).
- `GET /api/location/{id}/` — detalhe.
- `PATCH /api/location/{id}/` — edita.
- `DELETE /api/location/{id}/` — remove.

### `/api/sessions/`
`SessionViewSet` (CRUD completo, `lookup_field = 'code'`). **Atenção:** o lookup é
pelo `code` (ex.: `abcd`), não pelo id numérico.

- `GET /api/sessions/` — lista sessões (o frontend da página Host usa isso).
- `POST /api/sessions/` — cria uma sessão (o `code` de 4 dígitos é gerado automaticamente).
- `GET /api/sessions/{code}/` — detalhe de uma sessão.
- `POST /api/sessions/{code}/update_status/`

  Body:
  ```json
  { "status": "PLAYING" }   // ou LOBBY | INACTIVE | FINISHED
  ```
  Atualiza apenas o campo `status` (`update_fields=["status"]`) e, quando vira `PLAYING`, notifica todos do grupo via WebSocket
  (`session_status_update`). **Não inicia o jogo sozinho.**

- `POST /api/sessions/{code}/initialize_rounds/`

  Body:
  ```json
  { "nickname": "ULTRAHOST" }
  ```
  Autorização simples: exige o nickname `ULTRAHOST` (sem login real).
  Seta `PLAYING`, `current_round_number = 1`, atualiza `round_started_at` e dispara a thread do `run_game_loop`.

### `/api/players/`
`PlayerViewSet` (CRUD completo). Na prática os jogadores são criados/gerenciados
pelo WebSocket (`join`), e não por aqui.

### `/api/rounds/`
`RoundViewSet` (CRUD completo).

- `GET /api/rounds/current-image/?session_code={code}&round_number={n}`

  Garante que a imagem da localização da rodada esteja convertida em WebP (`ensure_webp_url()`) em
  `media/locations/` e retorna:
  ```json
  {
    "image_url": "/media/locations/location_1.webp",
    "round_number": "1",
    "session_code": "abcd"
  }
  ```
  > Nota: durante o fluxo normal de jogo, o frontend não precisa chamar este endpoint a cada rodada, pois já recebe `current_image_url` e `preload_urls` diretamente via WebSocket nos eventos `round_start` e `sync_state`.

## Exemplo de fluxo (host)

```bash
# 1. Marcar a sessão como jogando
curl -X POST http://localhost:8000/api/sessions/abcd/update_status/ \
  -H "Content-Type: application/json" \
  -d '{"status": "PLAYING"}'

# 2. Iniciar o jogo (dispara o loop das rodadas)
curl -X POST http://localhost:8000/api/sessions/abcd/initialize_rounds/ \
  -H "Content-Type: application/json" \
  -d '{"nickname": "ULTRAHOST"}'

# 3. Buscar a imagem da rodada atual (opcional, já enviada via WebSocket)
curl "http://localhost:8000/api/rounds/current-image/?session_code=abcd&round_number=1"
```

> Nota: para `POST` com DRF, além do cookie `csrf_token`, o frontend envia também o header
> `X-CSRFToken` (o axios já faz isso automaticamente via `withCredentials` + `xsrfCookieName: 'csrf_token'`).