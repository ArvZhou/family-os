# family-portal (Next.js) — Multi-stage Docker Build
# Build context: monorepo root
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Stage 1: Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/family-portal/package.json apps/family-portal/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile --filter @family-os/family-portal --ignore-scripts

# Stage 2: Build
COPY apps/family-portal apps/family-portal
RUN HUSKY=0 pnpm --filter @family-os/family-portal build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=base /app/apps/family-portal/public ./public
COPY --from=base --chown=nextjs:nodejs /app/apps/family-portal/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/apps/family-portal/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
