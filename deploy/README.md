Primeiro, instale o Nginx e o Cloudfare tunnels;

```
sudo apt-get update
sudo apt-get install nginx -y
```

```
sudo rm /var/www/html/index.nginx-debian.html
sudo rm /etc/nginx/sites-enabled/default
sudo rm /etc/nginx/sites-available/default
sudo nginx -t
```

```
cd nginx
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo mkdir /etc/nginx/conf.d
sudo mkdir -p /var/www/dacomp_guessr
sudo cp simple_website.conf  /etc/nginx/conf.d/simple_website.conf
```
sudo nginx -s reload

Vá até a pasta do frontend, e builde o projeto, e copie para a pasta
/vat/www/dacomp_guessr

```
npm run build
cd dist
sudo cp -rf ./* /var/www/dacomp_guessr
sudo nginx -s reload
```

Agora, o nginx deve estar rodando na sua máquina na porta 80. Rode:

cloudflared tunnel --url http://localhost:80

Isso vai te dar um link do cloudfare que é acessível por outras pessoas.
Por fim, você deve adicionar esse host no ALLOWED_HOSTS no settings.py do back

Se abrir o arquivo, vai ver que já tem um antigo lá. Substitua pelo link novo
toda vez que rodar o cloudfare tunnel


