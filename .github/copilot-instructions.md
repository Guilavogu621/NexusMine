<!-- .github/copilot-instructions.md: concise guidance for AI coding agents -->

# NexusMine — Copilot Instructions

Purpose: Enable AI coding agents to be immediately productive by surfacing key architecture, workflows, and conventions unique to this repo.

## Big Picture Architecture

- **Backend**: Django 4.2, DRF, SimpleJWT. Located in `backend/`. Implements 6 roles (ADMIN, SITE_MANAGER, SUPERVISOR, OPERATOR, ANALYST, MMG). RBAC enforced via DRF permission classes. All API routes in `nexus_backend/api_urls.py`.
- **Frontend Web**: Vite + React 19 + Tailwind CSS 4 + Zustand in `frontend/nexus-frontend/`. Used by all roles except OPERATOR. Management, analytics, reporting features.
- **Mobile (Flutter)**: `mobile/nexusmine_mobile/` for OPERATOR (field engineer) only. Modules: Opérations, Incidents, Équipements, Environnement, Stock, Alertes, Profile. No management/admin features on mobile.

> **Critical Rule:** Mobile app is strictly for OPERATOR (field engineer). Management, analytics, personnel, admin, and reporting features belong to web only.

## Developer Workflows

- **Backend**: Activate venv, run server:
	```bash
	cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8000
	```
- **Frontend**: Install deps, start dev server:
	```bash
	cd frontend/nexus-frontend && npm install && npm run dev
	```
- **Mobile**: Flutter setup and run:
	```bash
	cd mobile/nexusmine_mobile && flutter pub get && flutter run
	```

## Key Files & Patterns

- **Backend**:
	- `nexus_backend/settings.py`: Django config, JWT, CORS
	- `nexus_backend/api_urls.py`: API route registry
	- `accounts/models.py`: User model, roles
	- `accounts/permissions.py`: RBAC permission classes
- **Frontend**:
	- `package.json`: scripts (`dev`, `build`, `lint`)
	- `vite.config.js`: Vite + React config
	- `src/`: React components, Zustand stores, pages
- **Mobile**:
	- `lib/core/constants/api_constants.dart`: API endpoints
	- `lib/core/network/api_client.dart`: Dio HTTP client, JWT interceptor
	- `lib/router/app_router.dart`: GoRouter routes (field modules only)
	- `lib/features/`: Feature folders (auth, home, operations, etc.)
	- `lib/shared/models/`: Dart data models

## Project-Specific Conventions

- **RBAC**: Backend always enforces role checks. Web frontend implements RBAC on routes and API actions. Mobile does not check roles (OPERATOR only).
- **JWT Auth**: SimpleJWT, access token 60min, refresh 7 days, rotates on refresh.
- **CORS**: `CORS_ALLOW_ALL_ORIGINS = True` in DEBUG mode.
- **API Integration**: Always check `api_constants.dart` for endpoint definitions before adding new mobile API calls.
- **Feature Boundaries**: Management/admin/reporting features are web-only. Mobile features are strictly field modules.

## Integration & Communication

- **Backend ↔ Frontend/Mobile**: All communication via REST API endpoints defined in `api_urls.py` and surfaced in mobile via `api_constants.dart`.
- **JWT**: Used for authentication across all clients. Mobile and web both use JWT, but only web implements role-based UI.

## When to Ask for Clarification

- Backend model/API changes: Request serializer and permission class details.
- New mobile feature: Confirm it belongs on mobile (field engineer) vs web (management/admin).
- API integration: Check for existing endpoint in `api_constants.dart` before creating new.

---
Feedback: If any section is unclear or missing, please specify so it can be iterated for completeness.
