# Protocolo WebSocket

O backend usa [Django Channels](https://channels.readthedocs.io/). Todo o protocolo
do jogo (entrada na sala, palpites, rodadas, sincronização) passa por aqui — as funcionalidades
ficam em `Guessing_Game/consumers.py` (`PlayerConsumer`).

## URL de conexão

```
ws://localhost:8000/ws/lobby/{session_code}/
```

- `session_code` — código de 4 caracteres da sala (ex.: `abcd`).
- Produção: mesmo host do frontend (`window.location.origin`), prefixo `/ws/lobby/{code}/` (servido pelo Nginx).
- Desenvolvimento: `ws://localhost:8000/ws/lobby/{code}/` — no frontend isso é
  controlado por `VITE_WS_URL` (veja o arquivo `.env` na raiz do repositório).

O servidor aceita a conexão se a sessão existir; caso contrário fecha o socket.

## Formato

Todas as mensagens são JSON (`text_data`). As mensagens **client → server** têm um
campo `action` (ou `type` em mensagens de controle como `ping` e `sync_request`); as mensagens **server → client** têm um campo `type`.

## Ações do cliente

### `join`
Entrar na sala (ou reativar um jogador que já existe).

```json
{
  "action": "join",
  "player": {
    "id": null,
    "nickname": "Maykon",
    "avatar_config": { "head": "redonda", "face": "feliz", "acc": "chapeu", "color": "azul" }
  }
}
```

- `id`: se `null`, cria um novo jogador; se passado e existir na sessão, apenas
  reativa (`is_connected = true`).
- Se a sessão estiver `PLAYING` ou `FINISHED`, entra com `type: error`.
- Resposta: `type: join_success` + broadcast `players_list` para a sala.

### `reconnect`
Reconexão usando o id salvo no `localStorage` do navegador.

```json
{ "action": "reconnect", "player_id": "uuid-do-jogador" }
```

- Resposta: `type: reconnect_success` com os dados da sessão, seguido automaticamente de um `type: sync_state` com o estado completo da partida (imagem atual, round e cronômetro).

### `sync_request`
Solicita o estado completo atual da sala para reidratação imediata do cliente (usado ao abrir a tela de jogo ou caso não haja `playerId` prévio).

```json
{ "type": "sync_request", "action": "sync_request", "player_id": "uuid-do-jogador" }
```

- Se `player_id` for enviado e pertencer à sessão, garante que o jogador seja marcado como conectado (`is_connected = true`).
- Resposta: `type: sync_state`.

### `ping`
Heartbeat enviado a cada 25 segundos pelo cliente para manter a conexão ativa no Cloudflare Tunnel e sincronizar o relógio.

```json
{ "type": "ping", "action": "ping" }
```

- Resposta: `type: pong` contendo o `server_now` em milissegundos.

### `list_players`
Pede a lista atual de jogadores conectados da sala.

```json
{ "action": "list_players" }
```

- Resposta: `type: players_list`.

### `update_avatar`
Altera nickname/avatar de um jogador e avisa a sala.

```json
{
  "action": "update_avatar",
  "player": { "id": "uuid", "nickname": "NovoNome", "avatar_config": { "..." : "..." } }
}
```

- Broadcast: `type: player_update`.

### `set_ready`
Salva o estado de pronto do jogador. O frontend envia esta ação ao clicar no
botão **Pronto**, depois de salvar o nickname e o avatar atuais.

```json
{ "action": "set_ready", "ready": true }
```

Quando todos os jogadores conectados estiverem prontos, o servidor aguarda
alguns segundos, inicia a sessão automaticamente e envia
`session_status_update` com `status: "PLAYING"`. Alterar o avatar ou nickname
desmarca o jogador como pronto.

### `submit_guess`
Envia o palpite do jogador na rodada atual.

```json
{
  "action": "submit_guess",
  "player_id": "uuid",
  "guess": {
    "latitude": -21.9799,
    "longitude": -47.8833,
    "guess_timestamp": 0,
    "player_id": "uuid"
  }
}
```

- O backend calcula distância/pontuação (ver `docs/ARCHITECTURE.md`), acumula o
  score no `Player` e salva um `Guess`.
- `player_id` também é enviado no payload como fallback caso o WebSocket tenha reconectado momentos antes do envio.
- `guess_timestamp` é aceito mas **não é usado** na pontuação (o backend usa
  `session.round_started_at`).
- **Grace Period (tolerância de latência):** palpites recebidos até `2.0s` (`GRACE_PERIOD_SECONDS`) após o fim do `time_limit` ainda são aceitos com `remaining_time = 0`. Acima desse limite, o palpite é ignorado.
- **Skip automático:** se todos os jogadores conectados (`is_connected = true`) já tiverem registrado palpite na rodada, o servidor aciona `trigger_round_skip` e encerra a rodada imediatamente.
- Resposta (só para quem enviou): `type: guess_received`.

### `start_round_manual`
Enviada pelo frontend, porém **não existe handler correspondente no consumer**
(fica apenas uma função comentada em `consumers.py`) — não usar. O início do jogo é
feito por REST: `POST /api/sessions/{code}/initialize_rounds/`.

## Eventos do servidor

### `join_success`
```json
{ "type": "join_success", "id": "uuid", "avatar_config": { "..." },
  "message": "Bem-vindo, {nickname}!", "new": true, "nickname": "Maykon" }
```
`new` indica se o jogador foi criado agora (`true`) ou apenas reativado (`false`).

### `reconnect_success`
```json
{ "type": "reconnect_success", "id": "uuid", "nickname": "Maykon",
  "avatar_config": { "..." }, "session_status": "LOBBY",
  "current_round": 0, "total_rounds": 5, "player_score": 0 }
```

### `sync_state`
Estado completo da partida para reidratação imediata do cliente.
```json
{
  "type": "sync_state",
  "session_status": "PLAYING",
  "current_round": 1,
  "total_rounds": 5,
  "time_limit": 60,
  "round_started_at": 1761872800000,
  "server_now": 1761872815000,
  "remaining_time": 45,
  "image_url": "/media/locations/location_1.webp",
  "preload_urls": [
    "/media/locations/location_2.webp",
    "/media/locations/location_3.webp"
  ],
  "already_guessed": false,
  "guessed_player_ids": [],
  "player_score": 0
}
```

### `pong`
Resposta ao heartbeat (`ping`).
```json
{ "type": "pong", "server_now": 1761872824000 }
```

### `players_list`
Lista de todos os jogadores da sessão (inclui desconectados, com `is_connected: false`).
```json
{ "type": "players_list",
  "players": [ { "id": "uuid", "nickname": "Maykon",
                 "avatar_config": { "..." }, "is_connected": true } ] }
```

### `player_update`
Um jogador mudou nickname/avatar.
```json
{ "type": "player_update",
  "player": { "id": "uuid", "nickname": "Novo", "avatar_config": { "..." }, "is_connected": true } }
```

### `round_start`
Nova rodada começou. Envia os timestamps absolutos para o cronômetro local, a imagem WebP da rodada atual (`N`) e as URLs das rodadas `N+1` e `N+2` para preload em segundo plano.
```json
{
  "type": "round_start",
  "round_number": 1,
  "message": "Round 1 começou!",
  "round_started_at": 1761872800000,
  "server_now": 1761872800000,
  "time_limit": 60,
  "current_image_url": "/media/locations/location_1.webp",
  "preload_urls": [
    "/media/locations/location_2.webp",
    "/media/locations/location_3.webp"
  ]
}
```

### `time_update`
Confirmação periódica de sincronia da rodada (enviada a cada 5 segundos com os timestamps do servidor).
```json
{
  "type": "time_update",
  "round_time": 55,
  "round_started_at": 1761872800000,
  "server_now": 1761872805000,
  "time_limit": 60
}
```

### `round_timeout`
Fim da rodada (por tempo esgotado ou por skip automático quando todos palpitam). Envia a localização correta, o ranking atual e os palpites.
```json
{ "type": "round_timeout",
  "round_number": 1,
  "message": "Tempo do round 1 esgotado!",
  "correct_lon": -47.88330161948902,
  "correct_lat": -21.979919052176466,
  "players":   [ { "id": "uuid", "nickname": "Maykon", "score": 842,
                    "last_round_score": 842, "avatar_config": { "..." } } ],
  "guesses":   [ { "id": "uuid", "latitude_guess": -22.0, "longitude_guess": -47.9,
                    "distance_in_meters": 2450.5, "points_awarded": 88,
                    "timestamp": "2026-09-11T21:00:00+00:00",
                    "player_id": "uuid", "round_id": 1, "session_id": 1 } ] }
```

### `guess_received`
Confirmação do palpite (só para quem palpitou).
```json
{ "type": "guess_received", "message": "Palpite Recebido.", "score": 88, "total_score": 842 }
```

### `session_status_update`
Mudança de status da sessão. Enviado pelo `update_status` REST e pelo fim do loop
do jogo.
```json
{ "type": "session_status_update", "status": "PLAYING", "message": "O jogo vai começar!", "players": [] }
```
No `FINISHED`, `players` vem preenchido com o ranking final (ordenado por score).

### `error`
```json
{ "type": "error", "message": "A sessão já começou. Não é possível entrar." }
```

## Reconexão e Heartbeat

No frontend (`src/api/ws.ts`):
1. Ao abrir o socket, se existe `playerId` no `localStorage`, envia `reconnect` (que devolve `reconnect_success` + `sync_state`); caso contrário, envia `sync_request`.
2. `shouldReconnect: true` tenta reconectar até 10 vezes com **backoff exponencial** (`1s, 2s, 4s, 8s...` limitado a `30s`).
3. Um heartbeat (`ping`) é enviado a cada `25s` enquanto o socket está aberto para evitar desconexão por inatividade no Cloudflare Tunnel.
4. Ao `connect` o backend adiciona o canal ao grupo; `disconnect` marca o jogador
   como `is_connected = false` e agenda a exclusão em 90s (se não reconectar).