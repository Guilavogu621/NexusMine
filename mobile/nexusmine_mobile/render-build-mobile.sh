#!/usr/bin/env bash

# Sortir immédiatement en cas d'erreur
set -e

echo "--- 🚀 Début du Build Flutter Web pour Render ---"

# S'assurer qu'on est dans le dossier du script
cd "$(dirname "$0")"

# 1. Dossier d'installation de Flutter
FLUTTER_SDK_DIR="$HOME/flutter_sdk"
FLUTTER_VERSION="3.27.4" # Version stable recommandée

# 2. Téléchargement et installation de Flutter (si pas déjà présent)
if [ ! -d "$FLUTTER_SDK_DIR" ]; then
    echo "⬇️ Téléchargement du SDK Flutter ${FLUTTER_VERSION}..."
    curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz
    
    echo "📦 Extraction du SDK..."
    mkdir -p "$FLUTTER_SDK_DIR"
    tar xf flutter_linux_${FLUTTER_VERSION}-stable.tar.xz -C "$HOME"
    rm flutter_linux_${FLUTTER_VERSION}-stable.tar.xz
    echo "✅ SDK Flutter installé."
else
    echo "ℹ️ SDK Flutter déjà présent."
fi

# 3. Mise à jour du PATH pour la session actuelle
export PATH="$PATH:$HOME/flutter/bin"

# 4. Configuration de Flutter
echo "⚙️ Configuration de Flutter..."
flutter config --no-analytics
flutter config --enable-web

# 5. Vérification et Diagnostic
echo "📂 Dossier actuel : $(pwd)"
echo "📂 Contenu du dossier :"
ls -la
echo "📂 Vérification du dossier lib :"
ls -la lib/ || echo "❌ Dossier lib non trouvé !"

flutter --version

# 6. Installation des dépendances
echo "📥 Installation des dépendances (flutter pub get)..."
flutter pub get

# 7. Build de l'application Web
echo "🏗️ Construction de l'application Web..."
API_URL=${BASE_URL:-"https://votre-app-backend.onrender.com/api"}
WEB_SOCKET_URL=${WS_URL:-"wss://votre-app-backend.onrender.com/ws/notifications/"}

# On force l'utilisation de lib/main.dart explicitement
flutter build web --release \
  --target lib/main.dart \
  --dart-define=BASE_URL=$API_URL \
  --dart-define=WS_URL=$WEB_SOCKET_URL

echo "--- ✅ Build Terminé avec succès ! ---"
