# Configuration de l'environnement (Linux)

Ce document décrit les étapes minimales pour préparer une machine de développement pour ce dépôt (frontend Vite + React, backend prévu Django).

Prérequis
- Node.js LTS (>=18) et `npm` — recommandé d'installer via NodeSource ou `nvm`.
- Python 3.10+ et `pip`.
- Optionnel : Docker & Docker Compose si vous préférez exécuter Postgres en conteneur.

Frontend (vite + react)

1. Installer les dépendances et démarrer le serveur de dev :

```bash
cd frontend/nexus-frontend
npm install
npm run dev
```

2. Linting :

```bash
npm run lint
```

Backend (préparations)

Le dossier `backend/` est actuellement vide. Si tu veux développer le backend en Django, voici des étapes minimales pour préparer l'environnement Python :

1. Créer et activer un environnement virtuel :

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Installer les dépendances (fichier fourni `backend/requirements.txt`) :

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

3. Configuration des variables d'environnement : copie les exemples et remplis-les :

```bash
cp .env.example .env
cp frontend/nexus-frontend/.env.example frontend/nexus-frontend/.env
```

4. Base de données : `TECH_STACK.md` indique PostgreSQL. Tu peux lancer un conteneur Postgres localement :

```bash
docker run --name nexus-postgres -e POSTGRES_USER=nexus -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=nexus_db -p 5432:5432 -d postgres:15
```

Exemple `DATABASE_URL` pour `.env` :

```
postgres://nexus:secret@localhost:5432/nexus_db
```

Scaffold Django (si souhaité)

Si tu veux que je crée un projet Django initial, dis-le et je le bootstrappe. Commandes typiques pour démarrer :

```bash
django-admin startproject core backend
cd backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Notes et bonnes pratiques spécifiques à ce dépôt
- Le frontend est une application statique/demo (aucun appel réseau détecté). Avant d'ajouter des appels à une API, demander un contrat d'API (endpoints, auth).
- `TECH_STACK.md` mentionne Tailwind mais `package.json` ne l'inclut pas — ne pas supposer sa présence.

Support
- Dis-moi si tu veux que je :
  - scaffolde un projet Django minimal dans `backend/`,
  - ajoute un `docker-compose.yml` pour Postgres + app, ou
  - configure des scripts `Makefile`/`tasks` pour automatiser ces étapes.
