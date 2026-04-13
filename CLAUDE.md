# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GatorCommunities is a campus club discovery platform that recommends student organizations based on interests and behavior. It has three services:

- **web-platform/** — Next.js 16 App Router (React 19, TypeScript, Prisma 7, Tailwind, Radix UI)
- **ml-engine/** — Python FastAPI service for ML recommendations (NumPy, SciPy, SQLAlchemy)
- **PostgreSQL** — shared database; Next.js has read/write via Prisma, Python has read-only via SQLAlchemy

Next.js owns all schema migrations. The ML engine reads the same database to compute recommendation scores (hybrid of Jaccard similarity + EASE collaborative filtering).

## Common Commands

### Docker (full stack)
```bash
docker compose up                              # start all services
curl -X POST http://localhost:8001/recommend/all  # generate ML recommendations
```

### Web Platform (from `web-platform/`)
```bash
npm install
npm run dev                    # Next.js dev server on :3000
npm run build                  # production build
npm run lint                   # ESLint
npm run test:smoke             # smoke tests (npx tsx tests/smoke.test.ts)
npm run test:security          # security integration tests (node --import tsx --test tests/security.integration.test.ts)
npx prisma generate            # regenerate Prisma client
npx prisma db push             # sync schema to DB (no migration file)
npx prisma migrate dev         # create/apply migration
npx prisma db seed             # seed test data (uses ts-node prisma/seed.ts)
```

### ML Engine (from `ml-engine/`)
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001    # FastAPI dev server
pytest                                    # run ML tests
```

### Full Local Stack (from repo root)
```bash
./start.sh   # starts PostgreSQL, ML engine (:8000), Next.js (:3000), runs smoke tests
```

## Architecture

### Web Platform Structure
- **Route groups:** `(marketing)`, `(auth)`, `(onboard)`, `(app)` under `src/app/`
- **API routes:** `src/app/api/{admin,clubs,community,tags,user}/**/route.ts`
- **Services layer:** `src/services/` — business/data logic (communityService, userService)
- **Auth:** `src/context/AuthContext.tsx` (client state) + `src/lib/auth-guards.ts` (server-side RBAC/ABAC)
- **RBAC:** `src/lib/rbac.ts` + `src/lib/access-enums.ts`
- **API client:** `src/lib/api.ts` — frontend fetch helper; must stay in sync with API routes
- **Prisma:** schema at `prisma/schema.prisma`, generated client output at `src/generated/prisma/` (never hand-edit)
- **DB connection:** `src/lib/prisma.ts`

### ML Engine Structure
- **`main.py`** — FastAPI endpoints (`/health`, `/recommend/all`, `/recommend/{user_id}`)
- **`recommender/`** — `content_based.py` (Jaccard), `ease.py` (EASE collaborative), `hybrid.py` (score combiner), `popularity.py` (fallback), `training.py` (orchestrator)
- **`db.py`** — SQLAlchemy read-only connection

### Key Data Flow
1. Users select interests → saved as User-Tag relations
2. User actions (view/click/RSVP/join) → written to Interaction table with weights (0.5/1.0/2.0/3.0)
3. `POST /recommend/all` triggers batch ML training → results stored in Recommendation table
4. `/recommended` page: Next.js calls ML engine → gets pre-computed scores → fetches full club data from Prisma

### Database Schema (Prisma)
Core models: `User`, `Community`, `Tag`, `Membership`, `Interaction`, `Recommendation`. See `web-platform/prisma/schema.prisma`.

## Key Conventions

- API handlers validate inputs; business logic goes in `src/services/`
- When changing API route method/path/payload/response, update `src/lib/api.ts` in the same change
- Changes to `AuthContext.tsx` or app layouts require verifying login/onboarding redirects still work
- Reuse existing `src/components/ui/` primitives before adding new UI components
- Container startup uses `web-platform/start.sh` which gates destructive schema changes behind `PRISMA_ACCEPT_DATA_LOSS=true`

## Environment

`DATABASE_URL` must point to PostgreSQL. Default local: `postgresql://gatorcommunities:gatorcommunities@localhost:5432/gatorcommunities`. `PYTHON_BACKEND_URL` points to the ML engine (default `http://localhost:8001`, or `http://ml-engine:8000` in Docker).
