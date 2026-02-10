Tech Stack
 - Frontend
    React, Typescript, Tailwind
    Paginas:
        - Host ("escondido" de todo mundo, e tem que ter alguma credencial)
        - Lobby
        - Round
        - Pontuação
        - Sessão não iniciada/não encontrada -> redirect
    Descobrir como integrar a API do Open Street Map.
    Um esboço seria bom...

- Backend
    Python, Django (CHANNEL BOYS, Django Channels)
    Websocket ( Django Channels)
    Payloads

    Tem muita coisa desconfigurada ainda, então grandes chances de não 
    startar corretamente

- Banco de dados
    PostgresSQL
    Precisa criar a seed.

 - API de mapa;
    Open Street Map


Pra rodar esse projeto, você vai precisar do npm pro frontend, e do docker pra
rodar o backend + database


Frontend

'npm i'

'npm run dev'

Backend

Na pasta raiz do projeto, rode

'docker compose up'


É Importante criar arquivos .env nas pastas indicadas para funcionar corretamente também.

A Secret_KEY do Django deve ser obtida diretamente comigo

**DEPLOY**

Para o deploy, a ideia inicial é:
  frontend: Vercel
  backend e bd: Algum pc com tunelamento do cloudfare

Importante verificar a viabilidade de usar uma cloud, como a magalu (contanto que seja gratuito k)
