#!/usr/bin/env bash
# exit on error
set -o errexit

python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

python3 manage.py collectstatic --no-input
python3 manage.py migrate
# Mise à jour ou création forcée de l'admin avec le rôle ADMIN
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u, created = User.objects.update_or_create(email='admin@nexusmine.com', defaults={'first_name': 'Lux', 'last_name': 'Guilavogui', 'is_staff': True, 'is_superuser': True, 'role': 'ADMIN'}); u.set_password('MR.Robot'); u.save()"
