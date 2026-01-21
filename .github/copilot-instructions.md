<!-- .github/copilot-instructions.md: concise guidance for AI coding agents -->
# NexusMine — Copilot instructions

Purpose: give an AI coding assistant the concrete, discoverable facts needed to be productive in this repo.

Big picture
- Frontend: a Vite + React app located in `frontend/nexus-frontend`. Uses React 19 and Vite plugin for React. The current frontend is a starter template (see `src/App.jsx`).
- Backend: a `backend/` directory exists but is empty in the repository. `TECH_STACK.md` claims Django + PostgreSQL, however no Django project files (e.g., `manage.py`, `settings.py`) are present. If you need to change backend behavior, ask a human or wait for the backend to be added.

<!-- .github/copilot-instructions.md: concise guidance for AI coding agents -->
# NexusMine — Copilot instructions (concise)

Purpose: Give an AI coding assistant the concrete, discoverable facts needed to be productive in this repo.

Big picture
- Frontend: a Vite + React app in `frontend/nexus-frontend`. It's a small starter/demo React 19 app (see `frontend/nexus-frontend/src/App.jsx`).
- Backend: the `backend/` folder exists but contains no Django project files. `TECH_STACK.md` names Django + PostgreSQL, but there is no `manage.py`, `settings.py`, or migrations. Treat the backend as not present until the maintainer provides the project or API contract.

Quick dev commands (copy-paste)

```bash
cd frontend/nexus-frontend
npm install
npm run dev    # starts Vite dev server (HMR)
npm run build  # production build
npm run preview # preview build locally
```

Important files (where to look first)
- `frontend/nexus-frontend/package.json` — scripts: `dev`, `build`, `preview`, `lint`.
- `frontend/nexus-frontend/vite.config.js` — uses `@vitejs/plugin-react` (dev server defaults to 5173).
- `frontend/nexus-frontend/src/main.jsx` — app entry.
- `frontend/nexus-frontend/src/App.jsx` — example UI; imports `/vite.svg` from public root and uses `src/assets`.
- `frontend/nexus-frontend/public/` — static public assets served at `/`.
- `frontend/nexus-frontend/eslint.config.js` — use `npm run lint` before large edits.
- `TECH_STACK.md` — intended stack (validate against repo contents before acting).

Repository patterns & constraints
- No network layer found: there are currently no `fetch`/`axios` calls in the frontend. Do not add backend integration code without an API specification or maintainer confirmation.
- Assets: images sometimes imported from `src/assets` or referenced as `/filename` (public root). Prefer existing patterns in `App.jsx`.
- Styling: plain CSS files (`src/index.css`, `App.css`) are used. Tailwind is mentioned in docs but not present in `package.json` — do not assume Tailwind is configured.
- Tests: none discovered. Do not add test scaffolds without asking where tests should live and which framework to use.

Developer workflow guidance for agents
- Use the exact npm scripts in `frontend/nexus-frontend/package.json` for running and building.
- Run lint locally before proposing large code changes: `cd frontend/nexus-frontend && npm run lint`.
- Keep changes focused and minimal: prefer small diffs that are easy to review.
- When adding dependencies, update `package.json` and run `npm install` locally (or in CI) and confirm the dev server still starts.

When to ask questions (must-ask)
- Backend or DB work: ask for the Django project, sample `requirements.txt`/`Pipfile`, and the API contract.
- API integration: request an OpenAPI/Swagger spec or example endpoints and auth details.
- New CI / build changes: confirm which scripts should run in CI and whether `npm run lint` is required.

Examples to copy into PRs or commits
- Start dev server: `cd frontend/nexus-frontend && npm install && npm run dev`
- Lint check: `cd frontend/nexus-frontend && npm run lint`

If you scaffold backend code or add cross-cutting infra, update `TECH_STACK.md` and include a short developer runbook (how to create venv, install, run migrations).

If anything in this guidance is unclear or you need missing artifacts (Django app, API spec), ask for them before proceeding.
