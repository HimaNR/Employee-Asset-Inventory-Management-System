FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
# npm install (not ci): the Windows-made lockfile lacks Linux-only optional deps
RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY . .
# NEXT_PUBLIC_* values are baked in at build time and must be reachable from the browser
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
EXPOSE 3000
CMD ["npm", "start"]
