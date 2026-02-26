#!/usr/bin/env bash

# Sortir en cas d'erreur et afficher chaque commande
set -ex

echo "--- 🚀 DÉMARRAGE DU BUILD MOBILE (RACINE) ---"

# 1. On se déplace dans le dossier mobile
cd mobile/nexusmine_mobile
echo "📍 Dossier de travail : $(pwd)"

# 2. Installation de Flutter
FLUTTER_SDK_DIR="$HOME/flutter_sdk"
FLUTTER_VERSION="3.27.4"

if [ ! -d "$FLUTTER_SDK_DIR" ]; then
    echo "⬇️ Installation Flutter..."
    curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz
    mkdir -p "$FLUTTER_SDK_DIR"
    tar xf flutter_linux_${FLUTTER_VERSION}-stable.tar.xz -C "$HOME"
    rm flutter_linux_${FLUTTER_VERSION}-stable.tar.xz
fi

export PATH="$PATH:$HOME/flutter/bin"
flutter config --no-analytics
flutter config --enable-web

# 3. Diagnostic Fichiers
echo "🔍 Liste des fichiers dans $(pwd) :"
ls -R lib/

# 4. Build
echo "🏗️ Build en cours..."
flutter pub get

API_URL=${BASE_URL:-"https://votre-app-backend.onrender.com/api"}
WS_URL=${WS_URL:-"wss://votre-app-backend.onrender.com/ws/notifications/"}

flutter build web --release \
  --dart-define=BASE_URL=$API_URL \
  --dart-define=WS_URL=$WEB_SOCKET_URL

echo "✅ Terminé."
