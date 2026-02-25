#!/usr/bin/env bash
# exit on error
set -o errexit

python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

python3 manage.py collectstatic --no-input
python3 manage.py migrate
# Création automatique de l'admin avec le rôle ADMIN explicite
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='admin@nexusmine.com').exists() or User.objects.create_superuser(email='admin@nexusmine.com', password='MR.Robot', first_name='Lux', last_name='Guilavogui', role='ADMIN')"
