FROM python:3.11

ENV PYTHONUNBUFFERED True
# Instala dependências do sistema (necessárias para o driver do Postgres)
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    libpq-dev 

WORKDIR ./

# Copia e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY . .


EXPOSE 8000

# Comando padrão
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
