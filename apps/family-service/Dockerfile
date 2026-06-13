# family-service (NestJS) — Multi-stage Docker Build
# Build context: monorepo root
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Stage 1: Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/family-service/package.json apps/family-service/
COPY packages/config/package.json packages/config/ 2>/dev/null || true
COPY packages/graphql-schema/package.json packages/graphql-schema/ 2>/dev/null || true
COPY packages/shared-types/package.json packages/shared-types/ 2>/dev/null || true
COPY packages/utils/package.json packages/utils/ 2>/dev/null || true
RUN pnpm install --frozen-lockfile --filter @family-os/family-service --prod

# Stage 2: Build
COPY apps/family-service apps/family-service
COPY packages packages
RUN pnpm --filter @family-os/family-service build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/family-service/dist ./dist
COPY --from=base /app/apps/family-service/schema.graphql ./schema.graphql 2>/dev/null || true
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
