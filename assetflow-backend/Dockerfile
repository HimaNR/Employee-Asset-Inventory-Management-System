# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
# postinstall runs "prisma generate", which needs the schema, so skip scripts here
# npm install (not ci): the Windows-made lockfile lacks Linux-only optional deps
RUN npm install --ignore-scripts --no-audit --no-fund
COPY . .
# Generate the Prisma client into src/generated. The dummy URL only lets the config load.
RUN DATABASE_URL=postgresql://x:x@localhost:5433/x npx prisma generate --config prisma7.config.ts
RUN npm run build
RUN npm prune --omit=dev --ignore-scripts

# ---- run ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
EXPOSE 4000
CMD ["node", "dist/main"]
