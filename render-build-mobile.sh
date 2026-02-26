#!/usr/bin/env bash

# Sortir en cas d'erreur et afficher chaque commande
set -ex

echo "--- 🚀 DÉMARRAGE DU BUILD MOBILE ---"

# 1. Diagnostic de la structure du repo
echo "📍 Emplacement racine : $(pwd)"
echo "📂 Contenu de la racine :"
ls -F

# 2. On entre dans le dossier mobile
if [ -d "mobile/nexusmine_mobile" ]; then
    cd mobile/nexusmine_mobile
    echo "📍 Dossier mobile trouvé : $(pwd)"
else
    echo "❌ ERREUR : Le dossier mobile/nexusmine_mobile est introuvable !"
    exit 1
fi

echo "📂 Contenu du dossier mobile :"
ls -F

# 3. Installation de Flutter
FLUTTER_SDK_DIR="/opt/render/flutter_sdk"
FLUTTER_VERSION="3.27.4"

if [ ! -d "$FLUTTER_SDK_DIR" ]; then
    echo "⬇️ Installation Flutter..."
    curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz
    mkdir -p "$FLUTTER_SDK_DIR"
    tar xf flutter_linux_${FLUTTER_VERSION}-stable.tar.xz -C /opt/render
    rm flutter_linux_${FLUTTER_VERSION}-stable.tar.xz
fi

export PATH="$PATH:/opt/render/flutter/bin"
flutter config --no-analytics
flutter config --enable-web

# 4. Vérification vitale avant build
echo "🔍 Recherche de lib/main.dart..."
if [ -f "lib/main.dart" ]; then
    echo "✅ Fichier main.dart trouvé."
else
    echo "❌ Fichier lib/main.dart MANQUANT !"
    echo "Contenu récursif du dossier actuel :"
    find . -maxdepth 2 -not -path '*/.*'
    exit 1
fi

# 5. Build
echo "🏗️ Build en cours..."
flutter pub get

# On utilise les variables Render ou des valeurs par défaut
API_URL=${BASE_URL:-"https://nexus-backend-n9be.onrender.com/api"}
WEB_SOCKET_URL=${WS_URL:-"wss://nexus-backend-n9be.onrender.com/ws/notifications/"}

flutter build web --release \
  --dart-define=BASE_URL=$API_URL \
  --dart-define=WS_URL=$WEB_SOCKET_URL

echo "✅ Build terminé avec succès."
