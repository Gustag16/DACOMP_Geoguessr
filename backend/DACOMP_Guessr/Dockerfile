FROM python:3.11

ENV PYTHONUNBUFFERED True
# Instala dependências do sistema (necessárias para o driver do Postgres)
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libpq-dev 

WORKDIR /app

# Copia e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . .

EXPOSE 8000

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
