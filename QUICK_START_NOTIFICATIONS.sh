#!/bin/bash
# QUICK_START_NOTIFICATIONS.sh - Script de démarrage rapide du système de notifications

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend/nexus-frontend"

echo "=========================================="
echo "🚀 NexusMine Notifications - Quick Start"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============ BACKEND SETUP ============
echo -e "${BLUE}📦 Backend Setup${NC}"
echo "---"

cd "$BACKEND_DIR"

# Vérifier/créer venv
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activer venv
source .venv/bin/activate

# Installer dépendances
echo "Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Migrations
echo "Running migrations..."
python manage.py migrate alerts --noinput 2>/dev/null || echo "⚠️  Migration alerts already done"

# Créer superuser si n'existe pas
echo "Ensuring superuser exists..."
python manage.py shell << EOF
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@nexusmine.local', 'admin123')
    print('✅ Superuser created: admin/admin123')
else:
    print('✅ Superuser already exists')
EOF

echo -e "${GREEN}✅ Backend Ready${NC}"
echo ""

# ============ FRONTEND SETUP ============
echo -e "${BLUE}⚛️  Frontend Setup${NC}"
echo "---"

cd "$FRONTEND_DIR"

# Vérifier node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install -q
else
    echo "Updating npm dependencies..."
    npm install -q 2>/dev/null || true
fi

echo -e "${GREEN}✅ Frontend Ready${NC}"
echo ""

# ============ VERIFICATION ============
echo -e "${BLUE}🔍 Verification${NC}"
echo "---"

# Vérifier Python
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
echo "✅ Python: $PYTHON_VERSION"

# Vérifier Node
NODE_VERSION=$(node --version)
echo "✅ Node: $NODE_VERSION"

# Vérifier packages importants
echo "Checking Django packages..."
python -c "import channels; print('✅ Channels:', channels.__version__)" 2>/dev/null || echo "❌ Channels not installed"
python -c "import daphne; print('✅ Daphne installed')" 2>/dev/null || echo "❌ Daphne not installed"
python -c "import rest_framework; print('✅ DRF installed')" 2>/dev/null || echo "❌ DRF not installed"

echo ""

# ============ INSTRUCTIONS ============
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1️⃣  Terminal 1 - Start Backend (Daphne):"
echo "   ${GREEN}cd $BACKEND_DIR${NC}"
echo "   ${GREEN}source .venv/bin/activate${NC}"
echo "   ${GREEN}daphne -b 0.0.0.0 -p 8000 nexus_backend.asgi:application${NC}"
echo ""
echo "2️⃣  Terminal 2 - Start Frontend:"
echo "   ${GREEN}cd $FRONTEND_DIR${NC}"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3️⃣  Access:"
echo "   ${GREEN}Backend: http://localhost:8000${NC}"
echo "   ${GREEN}Frontend: http://localhost:5173 (ou affichage npm)${NC}"
echo "   ${GREEN}Admin: http://localhost:8000/admin (admin/admin123)${NC}"
echo ""
echo "4️⃣  Integration:"
echo "   - Envelopper l'app avec NotificationProvider"
echo "   - Ajouter NotificationCenter au layout"
echo "   - Voir: docs/INTEGRATION_WEBSOCKET.md"
echo ""

echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo "📖 Documentation:"
echo "   - Integration: docs/INTEGRATION_WEBSOCKET.md"
echo "   - Testing: docs/TESTING_NOTIFICATIONS.md"
echo "   - API Reference: backend/alerts/consumers.py"
echo ""
