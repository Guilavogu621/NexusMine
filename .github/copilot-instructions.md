<!-- .github/copilot-instructions.md: concise guidance for AI coding agents -->
# NexusMine — Copilot instructions

Purpose: give an AI coding assistant the concrete, discoverable facts needed to be productive in this repo.

## Big picture

- **Backend**: Django 4.2 + DRF + SimpleJWT in `backend/`. 6 roles: ADMIN, SITE_MANAGER, SUPERVISOR, OPERATOR, ANALYST, MMG. Server: `python manage.py runserver 0.0.0.0:8000`.
- **Frontend web**: Vite + React 19 + Tailwind CSS 4 + Zustand in `frontend/nexus-frontend/`. Used by **all roles except OPERATOR** (management, admin, analytics, reports).
- **Mobile (Flutter)**: in `mobile/nexusmine_mobile/`. Used **exclusively by OPERATOR (field engineer)**. Only 6 terrain modules: Opérations, Incidents, Équipements, Environnement, Stock, Alertes + Profile.

> **Critical rule**: the mobile app is for the field engineer only. Do NOT add management features (sites, analytics, reports, personnel, admin) to mobile. Those belong to the web app.

## Quick dev commands

```bash
# Backend
cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8000

# Frontend web
cd frontend/nexus-frontend && npm install && npm run dev

# Mobile
cd mobile/nexusmine_mobile && flutter pub get && flutter run
```

## Important files

### Backend
- `backend/nexus_backend/settings.py` — Django settings, JWT config, CORS
- `backend/nexus_backend/api_urls.py` — all API routes
- `backend/accounts/models.py` — User model with 6 roles
- `backend/accounts/permissions.py` — RBAC permission classes

### Frontend web
- `frontend/nexus-frontend/package.json` — scripts: `dev`, `build`, `lint`
- `frontend/nexus-frontend/vite.config.js` — Vite + React plugin
- `frontend/nexus-frontend/src/` — React components, stores (Zustand), pages

### Mobile
- `mobile/nexusmine_mobile/lib/core/constants/api_constants.dart` — API endpoints
- `mobile/nexusmine_mobile/lib/core/network/api_client.dart` — Dio HTTP client + JWT interceptor
- `mobile/nexusmine_mobile/lib/router/app_router.dart` — GoRouter routes (field modules only)
- `mobile/nexusmine_mobile/lib/features/` — feature folders (auth, home, operations, incidents, equipment, environment, stock, alerts, profile)
- `mobile/nexusmine_mobile/lib/shared/models/` — Dart data models

## Architecture rules

- Mobile = OPERATOR only → no role-based visibility checks needed in mobile screens
- Web = all other roles → role-based RBAC on both frontend routes and API actions
- Backend enforces RBAC via DRF permission classes regardless of client
- JWT auth: SimpleJWT (access 60min, refresh 7 days, rotate on refresh)
- CORS: `CORS_ALLOW_ALL_ORIGINS = True` in DEBUG mode

## When to ask questions
- Backend model or API changes: ask for the serializer and permission class
- New mobile feature: confirm it belongs on mobile (field engineer) vs web (management)
- API integration: check `api_constants.dart` for existing endpoints
