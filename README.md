# AssetFlow – Employee Asset & Inventory Management System

Internal admin system to track company assets through registration, assignment, return, repair and retirement.

## Tech Stack
- **Frontend:** Next.js (TypeScript)
- **Backend:** NestJS (modular monolith)
- **Database:** PostgreSQL + Prisma
- **Infra:** Docker Compose (local database)

## Repository Structure
```
assetflow-backend/    NestJS REST API
assetflow-frontend/   Next.js admin UI
docker/               Docker helper files
docker-compose.yml    Local PostgreSQL + pgAdmin
```

## Quick Start
1. `cp .env.example .env`
2. `docker compose up -d`
3. Backend and frontend setup: see each app's README.

> 🚧 Work in progress