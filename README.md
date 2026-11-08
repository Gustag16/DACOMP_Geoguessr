# DACOMP GeoGuessr

Jogo estilo [GeoGuessr](https://www.geoguessr.com) pra comunidade acadêmica da
computação da UFSCAR, pelo **DACOMP**: o
jogador vê a foto de um local dentro da UFSCar São Carlos e precisa marcar no mapa
onde acha que ela foi tirada. Quanto mais próximo e rápido o palpite, mais pontos —
e o host acompanha tudo em tempo real.

## Autor(es)

| Autor                           | Curso                    | GitHub                                  |
| ------------------------------- | ------------------------ | --------------------------------------- |
| Maykon dos Santos Gonçalves     | Engenharia de Computação | [sgmaykon](https://github.com/sgmaykon) |
| Gustavo Amadeu Mancuzo de Sylos | Ciência da Computação    | [Gustag16](https://github.com/Gustag16) |

## Tech Stack

| Camada         | Tecnologia                                                            |
| -------------- | --------------------------------------------------------------------- |
| Frontend       | React + TypeScript + Vite + Tailwind CSS + Leaflet                    |
| Backend        | Python + Django + Django REST Framework + Django Channels (WebSocket) |
| Banco de dados | PostgreSQL                                                            |
| Tempo real     | WebSockets (Django Channels / Daphne)                                 |
| Deploy         | Nginx + Cloudflare Tunnel (Por conta das limitações do eduroam)       |

## Documentação

| Documento                                    | Conteúdo                                              |
| -------------------------------------------- | ----------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Visão geral, comunicação, fluxo da partida, pontuação |
| [docs/API.md](docs/API.md)                   | Endpoints REST                                        |
| [docs/WEBSOCKET.md](docs/WEBSOCKET.md)       | Protocolo WebSocket (ações e eventos)                 |
| [docs/DATABASE.md](docs/DATABASE.md)         | Schema do banco e seed                                |
| [deploy/README.md](deploy/README.md)         | Setup de produção (Nginx + Tunnel)                    |

## Estrutura do repositório

```
.
├── backend/
│   └── DACOMP_Guessr/            # Projeto Django (app + API + WebSocket)
├── frontend/
│   └── Guessing_game_frontend/   # Aplicação React (Vite)
├── deploy/
│   └── nginx/                    # Config template do Nginx para produção
├── docs/                         # Documentação técnica
├── docker-compose.yaml           # Backend + PostgreSQL
└── .env.example                  # Modelo unificado das variáveis de ambiente (Backend + Frontend)
```

## Pré-requisitos

- **Frontend:** Node.js 24+ e npm (via [nvm](https://github.com/nvm-sh/nvm)).

- **Backend + banco:** [Docker](https://www.docker.com/) e Docker Compose.

```bash
# Instalar Node/npm via nvm
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh) | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 24
node -v   # v24.x
npm -v
```

## Rodando localmente

### 1. Backend + banco (Docker)

Na raiz do repositório:

```bash
cp .env.example .env      # preencha os valores (ver "Variáveis de ambiente")
docker compose up -d --build
```

Isso sobe o **PostgreSQL** (`:5432`) e o **backend Django** (`:8000`). O
`entrypoint.sh` do container roda automaticamente:

1. `makemigrations` + `migrate`
2. cria o superusuário do admin (lendo `DJANGO_SUPERUSER_*` do `.env`)
3. roda o `seeder` (localizações convertidas para WebP + sessões iniciais)
4. `runserver 0.0.0.0:8000`

Caso precise rodar as migrações e o seeder manualmente:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seeder
```

Login do admin (Django Admin em `http://localhost:8000/admin`):
definido via `DJANGO_SUPERUSER_USERNAME` e `DJANGO_SUPERUSER_PASSWORD` no `.env` (fallback padrão: `admin` / `admin123`).

### 2. Frontend

O Vite já lê automaticamente o arquivo `.env` da raiz do repositório (`envDir: '../../'`).

```bash
cd frontend/Guessing_game_frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

**Sessões de teste** criadas pelo seed (use o código para entrar na sala): `abcd`,
`SUL1`, `NORT`, `RAND`, `200c`.

### 3. Jogar

1. Abra `http://localhost:5173`, entre na sala com um código acima.
2. Na página de **Host** (`/host`), escolha a sessão e clique para iniciar.
3. Os jogadores palpitam no mapa; a rodada avança automaticamente caso todos os jogadores conectados confirmem o palpite antes do tempo acabar. Ao fim, todos veem o ranking.

> Detalhes do fluxo completo e da pontuação em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Variáveis de ambiente

O projeto utiliza um **único arquivo `.env` na raiz do repositório**, compartilhado entre o Docker Compose, o Django e o Vite.

### Raiz — `.env` (Backend, Banco de Dados e Frontend)

| Variável                    | Obrigatório | Descrição                                                                                  |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `SECRET_KEY`                | sim         | Chave secreta do Django                                                                    |
| `DEBUG`                     | não         | Modo de desenvolvimento (default `True`; define cookies CSRF `Lax` local vs `None` remoto) |
| `PUBLIC_TUNNEL_URL`         | não         | URL pública fixa do túnel, se houver (opcional)                                            |
| `EXTRA_ALLOWED_HOSTS`       | não         | Domínios extras permitidos separados por vírgula (opcional)                                |
| `POSTGRES_DB`               | sim         | Nome do banco (default `guessing_game_db`)                                                 |
| `POSTGRES_USER`             | sim         | Usuário do banco                                                                           |
| `POSTGRES_PASSWORD`         | sim         | Senha do banco                                                                             |
| `POSTGRES_PORT`             | não         | Porta (default `5432`)                                                                     |
| `POSTGRES_HOST`             | sim         | Host (`db` dentro do compose)                                                              |
| `DJANGO_SUPERUSER_USERNAME` | não         | Usuário inicial do Django Admin (default `admin`)                                          |
| `DJANGO_SUPERUSER_EMAIL`    | não         | Email inicial do Django Admin (default `admin@example.com`)                                |
| `DJANGO_SUPERUSER_PASSWORD` | não         | Senha inicial do Django Admin (default `admin123`)                                         |
| `VITE_PUBLIC_URL`           | não         | Deixe vazio em produção sob Nginx para derivar automaticamente de `window.location.origin` |
| `VITE_API_URL`              | não         | Base da API REST em dev (default `http://localhost:8000/api`)                              |
| `VITE_WS_URL`               | não         | Base do WebSocket em dev, incluindo `/ws` (default `ws://localhost:8000/ws`)               |
| `VITE_BACKEND_URL`          | não         | URL base do backend em dev para mídia (default `http://localhost:8000`)                    |

> **Atenção:** as credenciais do banco precisam bater com o serviço `db` do
> `docker-compose.yaml` (que usa `Postgres 15-alpine`). Se alterar `POSTGRES_USER` ou `POSTGRES_PASSWORD` após já ter criado o banco, recrie o volume com `docker compose down -v`.

> A `SECRET_KEY` pode ser gerada direto no terminal com:
> ```bash
> python3 -c "import secrets; print(secrets.token_urlsafe(50))"
> ```

## Deploy

O deploy usa **Nginx** expondo o frontend buildado e os arquivos de mídia + **Cloudflare Tunnel** pra expor
pra internet, com o backend/banco em Docker.

Instruções passo a passo: [deploy/README.md](deploy/README.md).

Resumo:

```bash
# Backend na mesma máquina
docker compose up -d

# Frontend
cd frontend/Guessing_game_frontend && npm run build
sudo rm -rf /var/www/dacomp_guessr/*
sudo cp -r dist/* /var/www/dacomp_guessr/
sudo systemctl reload nginx

# Túnel
cloudflared tunnel --url http://localhost:80
```

> Em sistemas com **SELinux** ativo (como Fedora), aplique os contextos e permissões na primeira configuração:
> ```bash
> sudo setsebool -P httpd_can_network_connect 1
> sudo setsebool -P httpd_enable_homedirs 1
> sudo chcon -Rt httpd_sys_content_t /var/www/dacomp_guessr
> sudo chmod -R a+rX backend/DACOMP_Guessr/media
> sudo chcon -Rt httpd_sys_content_t backend/DACOMP_Guessr/media/
> ```

> Não é necessário editar `settings.py` nem recompilar o frontend a cada novo link do túnel: o backend aceita subdomínios `*.trycloudflare.com` nativamente e o frontend resolve a URL da API e do WebSocket de forma dinâmica via `window.location.origin`.

## Comandos úteis (backend)

```bash
docker compose exec backend python manage.py seeder                      # re-seed e conversão WebP
docker compose exec backend python manage.py create_default_admin        # (re)cria admin
docker compose exec backend python manage.py changepassword <usuario>    # altera senha de um admin existente
docker compose exec backend python manage.py makemigrations              # migrações
docker compose exec backend python manage.py migrate
```

## Seed de localizações

As localizações são populadas pelo **Seeder do Django** (`Guessing_Game/management/seeders/seeder_location.py`), que lê o arquivo `Location_satellite.csv` da pasta de seeders, baixa as imagens originais, redimensiona (máx. `1920x1080`) e converte automaticamente para `.webp` em `backend/DACOMP_Guessr/media/locations/`.

Para adicionar localizações novas, basta acrescentar linhas no `Location_satellite.csv` e rodar `docker compose exec backend python manage.py seeder` (ou recriar o volume do banco com `docker compose down -v && docker compose up -d --build` caso queira limpar os registros anteriores).
