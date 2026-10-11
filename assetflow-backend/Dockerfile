# ---- base ----
FROM node:24-alpine AS base
WORKDIR /app

COPY package*.json ./

# npm install instead of npm ci because the Windows-made lockfile
# lacks Linux-only optional dependencies
RUN npm install --no-audit --no-fund

COPY . .

# Generate Prisma Client
RUN DATABASE_URL=postgresql://x:x@localhost:5433/x \
    npx prisma generate --config prisma7.config.ts


# ---- build ----
FROM base AS build

RUN npm run build

# Remove development dependencies from the production build
RUN npm prune --omit=dev --ignore-scripts


# ---- production ----
FROM node:24-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

EXPOSE 4000

CMD ["node", "dist/main"]


# ---- seed ----
FROM base AS seed

ENV NODE_ENV=production

CMD ["npx", "prisma", "db", "seed", "--config", "prisma7.config.ts"]