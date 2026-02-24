# 🚀 Guide de Déploiement Gratuit - NexusMine

Ce guide explique comment déployer l'application NexusMine gratuitement en utilisant des services cloud modernes.

## 🏗️ Architecture de Production
*   **Base de données** : [Neon.tech](https://neon.tech/) (PostgreSQL)
*   **Backend** : [Render.com](https://render.com/) (Django + Daphne)
*   **Frontend** : [Vercel.com](https://vercel.com/) (React + Vite)
*   **Notifications (WS)** : [Upstash.com](https://upstash.com/) (Redis)

---

## 1️⃣ Étape 1 : Base de données (Neon)
1.  Créez un compte sur [Neon.tech](https://neon.tech/).
2.  Créez un nouveau projet nommé `NexusMine`.
3.  Récupérez votre **Connection String** (elle ressemble à `postgresql://user:password@endpoint/dbname`).
4.  Gardez cette URL précieusement.

---

## 2️⃣ Étape 2 : Notifications WebSockets (Upstash)
1.  Créez un compte sur [Upstash.com](https://upstash.com/).
2.  Créez une instance **Redis**.
3.  Récupérez l'URL Redis (ex: `redis://default:password@endpoint:port`).
4.  C'est indispensable pour que les notifications fonctionnent en production.

---

## 3️⃣ Étape 3 : Backend (Render)
1.  Connectez votre GitHub à [Render.com](https://render.com/).
2.  Créez un **New Web Service**.
3.  Sélectionnez votre dépôt `NexusMine`.
4.  Configuration :
    *   **Root Directory** : `backend`
    *   **Runtime** : `Python`
    *   **Build Command** : `pip install -r requirements.txt`
    *   **Start Command** : `daphne -b 0.0.0.0 -p $PORT nexus_backend.asgi:application`
5.  Ajoutez les **Environment Variables** :
    *   `DATABASE_URL` : (L'URL Neon récupérée à l'étape 1)
    *   `REDIS_URL` : (L'URL Upstash récupérée à l'étape 2)
    *   `SECRET_KEY` : (Une clé aléatoire forte)
    *   `DEBUG` : `False`
    *   `ALLOWED_HOSTS` : `votre-app-backend.onrender.com`
    *   `FRONTEND_URL` : `https://votre-app-frontend.vercel.app`

---

## 4️⃣ Étape 4 : Frontend (Vercel)
1.  Connectez votre GitHub à [Vercel.com](https://vercel.com/).
2.  Importez votre dépôt `NexusMine`.
3.  Configuration :
    *   **Root Directory** : `frontend/nexus-frontend`
    *   **Framework Preset** : `Vite`
4.  Ajoutez les **Environment Variables** :
    *   `VITE_API_BASE_URL` : `https://votre-app-backend.onrender.com/api`
    *   `VITE_WS_BASE_URL` : `wss://votre-app-backend.onrender.com/ws/notifications/`
5.  Cliquez sur **Deploy**.

---

## ✅ Points de vérification après déploiement
1.  Vérifiez que vous pouvez vous connecter.
2.  Vérifiez que les cartes s'affichent correctement.
3.  Vérifiez que le petit indicateur WebSocket est vert (en bas à gauche du dashboard).

## 5️⃣ Étape 5 : Mobile / Flutter (Web & Android)

### Option A : Déployer Flutter Web (Vercel)
1. Créez un nouveau projet sur Vercel.
2. **Root Directory** : `mobile/nexusmine_mobile`.
3. **Build Command** : `flutter build web --release --dart-define=BASE_URL=https://votre-app-backend.onrender.com/api --dart-define=WS_URL=wss://votre-app-backend.onrender.com/ws/notifications/`
4. **Output Directory** : `build/web`.

### Option B : Build APK (Android local)
Pour générer une application installable sur téléphone :
```bash
cd mobile/nexusmine_mobile
flutter build apk --release \
  --dart-define=BASE_URL=https://votre-app-backend.onrender.com/api \
  --dart-define=WS_URL=wss://votre-app-backend.onrender.com/ws/notifications/
```
Le fichier sera dans `build/app/outputs/flutter-apk/app-release.apk`.

---

## ⚠️ Limitations du mode gratuit (Render)
*   **Spin down** : Après 15 minutes d'inactivité, le backend s'endort. La première requête après réveil peut prendre ~30 secondes.
*   **Migrations** : Pour lancer les migrations, vous pouvez ajouter `python manage.py migrate` avant la commande de start ou utiliser l'onglet "Shell" sur Render une fois l'app lancée.
