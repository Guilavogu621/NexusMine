#!/bin/bash
# Script pour lancer l'application Flutter NexusMine Mobile

cd /home/guilavogui/django_home/NexusMine/mobile/nexusmine_mobile

echo "=== NexusMine Mobile ==="
echo ""
echo "Options de lancement :"
echo "  1) flutter run -d chrome      # Web (Chrome)"
echo "  2) flutter run -d linux       # Linux desktop"
echo "  3) flutter run                # Appareil connecté"
echo "  4) flutter build apk          # Build APK Android"
echo ""

# Vérifier les dépendances
flutter pub get

# Lancer sur Chrome par défaut
flutter run -d chrome
