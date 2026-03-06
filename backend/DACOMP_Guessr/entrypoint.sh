#!/bin/sh
echo "Waiting for postgres..."

  sleep 4

echo "PostgreSQL started"

python manage.py makemigrations
python manage.py migrate

python manage.py create_default_admin
python manage.py seeder
python manage.py runserver 0.0.0.0:8000