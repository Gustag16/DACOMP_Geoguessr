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

    Tem muita coisa desconfigurada ainda, mas os models tão prontos
  

- Banco de dados
    PostgresSQL
    Precisa adicionar sessões e rounds na seed.

 - API de mapa;
    Open Street Map


Pra rodar esse projeto, você vai precisar do npm pro frontend, e do docker pra
rodar o backend + database


*Frontend*

Install Node and npm

    # Download and install nvm:
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

    # in lieu of restarting the shell
    \. "$HOME/.nvm/nvm.sh"

    # Download and install Node.js:
    nvm install 24

    # Verify the Node.js version:
    node -v # Should print "v24.13.1".

    # Verify npm version:
    npm -v # Should print "11.8.0". `

Vá para a pasta do front end, `frontend/Guessing_game_frontend/`

`npm i`

`npm run dev`


*Backend e Banco de Dados*

Instale o Docker, e então na pasta raiz:

`docker compose up --build`

Caso queira mudar a seed ou adicionar alguma na inicialização do backend, a imagem docker
do postgres tem uma pasta chamada docker-entrypoint-initdb.d, que executa qualquer .sh que esteja nela.

*========================================================*

É Importante criar arquivos .env nas pastas indicadas para funcionar corretamente também.

A Secret_KEY do Django deve ser obtida diretamente comigo

**DEPLOY**

Para o deploy, a ideia inicial é:
  frontend: Vercel
  backend e bd: Algum pc com tunelamento do cloudfare

Importante verificar a viabilidade de usar uma cloud, como a magalu (contanto que seja gratuito k)
