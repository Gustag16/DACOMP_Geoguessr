# *Tech Stack*

 - Frontend
    React, Typescript, Tailwind
   
    Páginas:

        - Host (Escondida dos outros players)
        - Home
        - Lobby
          - Sessão não iniciada/encontrada -> redirect
        - Game Session
        - Ranking

- Backend

    Python, Django (CHANNEL BOYS, Django Channels), Websocket (Django Channels)  

- Banco de dados
  
    PostgresSQL

 - API de mapa
   
    Open Street Map, Biblioteca Leaflet


Pra rodar esse projeto, faz-se necessário o uso do npm pro frontend, e do docker para rodar o backend + database

# *Frontend*

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


# *Backend e Banco de Dados*

Instale o Docker, e então na pasta raiz:

`docker compose up --build`

Caso queira mudar a seed ou adicionar alguma na inicialização do backend, a imagem docker
do postgres tem uma pasta chamada `docker-entrypoint-initdb.d`, que executa qualquer `.sh` que esteja nela.


É Importante criar arquivos .env nas pastas indicadas para funcionar corretamente também.

Para isso, copie os arquivos `.env.exemple` para um arquivo `.env`, e preencha os campos

`cp .env.example .env`

A Secret_KEY do Django deve ser obtida diretamente comigo

# *Deploy*

Para o deploy, a ideia é:

  - Frontend:
    
    Nginx expondo uma porta local
    ```
    cd frontend
    cd Guessing_game_frontend
    cd dist
    sudo cp -rf ./* /var/www/dacomp_guessr/
    sudo nginx -s reload
    cloudflared tunnel --url http://localhost:80
    ```
  - Backend e BD:
    
    PC do Nginx com tunelamento do cloudfare

    `docker compose up`
  
