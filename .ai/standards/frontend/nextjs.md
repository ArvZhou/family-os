# Next.js Standards

> Framework-specific conventions for Next.js projects.
> For general frontend standards, see [../../frontend.md](../../frontend.md).

---

## Tech Stack

| Category | Choice | Version (target) |
|----------|--------|-------------------|
| Framework | Next.js (SSR + App Router) | 15+ |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | shadcn/ui | latest |
| State Management | Zustand (client) + TanStack Query (server) | latest |
| Hooks | react-use (preferred) | latest |
| Testing | Vitest + @testing-library/react | latest |
| Linting | ESLint + Prettier | latest |
| i18n | next-intl | latest |
| Package Manager | pnpm | 9+ |

---

## Directory Structure

```
apps/web/
├── public/                          # Static assets
│   ├── locales/                     # i18n translation files
│   │   ├── zh.json
│   │   └── en.json
│   └── images/
├── src/
│   ├── app/                         # App Router
│   │   ├── [locale]/                # i18n route group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (dashboard)/         # Route group — authenticated pages
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── health/
│   │   │   │   ├── member/
│   │   │   │   ├── goal/
│   │   │   │   ├── device/
│   │   │   │   ├── automation/
│   │   │   │   └── archive/
│   │   │   └── (auth)/              # Route group — login / register
│   │   │       ├── login/
│   │   │       └── register/
│   │   ├── api/                     # API routes (proxy to backend)
│   │   └── globals.css
│   ├── components/                  # Shared UI components
│   │   ├── ui/                      # shadcn/ui primitives (auto-generated)
│   │   ├── layout/                  # Shell, Sidebar, Header, Footer
│   │   └── shared/                  # Domain-agnostic reusable components
│   ├── features/                    # Feature-first domain modules
│   │   ├── health/
│   │   │   ├── components/          # Health-specific UI
│   │   │   ├── hooks/               # Health-specific hooks
│   │   │   └── actions.ts           # Server Actions for health
│   │   ├── member/
│   │   ├── goal/
│   │   ├── device/
│   │   ├── automation/
│   │   └── archive/
│   ├── hooks/                       # Shared custom hooks
│   ├── stores/                      # Zustand stores
│   ├── lib/                         # Utility functions, API client, config
│   │   ├── api.ts                   # API client
│   │   ├── env.ts                   # Environment config loader
│   │   └── utils.ts
│   ├── i18n/                        # next-intl configuration
│   │   ├── request.ts
│   │   └── routing.ts
│   └── middleware.ts                # Next.js middleware (auth + locale)
├── Dockerfile                       # Multi-stage production build
├── .env.development                 # Dev environment variables
├── .env.staging                     # Staging environment variables
├── .env.production                  # Production environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Server vs Client Components

- **Server-first** — default to Server Component; only add `"use client"` when you need interactivity / browser APIs.
- Server Components and Server Actions must not import client-only modules.
- Prefer Server Actions for mutations over API routes when possible.

---

## Hooks — react-use First

Before writing a custom hook, check if `react-use` already provides it:

| Use case | react-use hook |
|----------|---------------|
| Debounce | `useDebounce` |
| LocalStorage | `useLocalStorage` |
| Previous value | `usePrevious` |
| Click outside | `useClickAway` |
| Media query | `useMedia` |
| Toggle | `useToggle` |
| Interval | `useInterval` |
| Window size | `useWindowSize` |
| Async operation | `useAsync` / `useAsyncFn` |
| Lifecycle | `useMount` / `useUnmount` |

Custom hooks belong in `features/<feature>/hooks/` (feature-specific) or `src/hooks/` (shared).

---

## State Management (Next.js Specific)

| Category | Tool | What goes there |
|----------|------|-----------------|
| Server state | TanStack Query (React Query) | API responses — members, health records, goals |
| Client state | Zustand | UI state — sidebar open, theme, selected tab, auth token |
| Form state | react-use + native | Ephemeral form inputs, validation state |
| URL state | App Router params + searchParams | Page, filters, sort order |

```tsx
// ✅ Zustand — client-only state
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
```

Avoid Redux unless complexity clearly demands it (rare).

---

## Styling (Next.js Specific)

### Tailwind CSS

- Use Tailwind utility classes for all styling.
- Extract repeated patterns with `@apply` in `globals.css` only when a utility combination is used 5+ times.

### shadcn/ui

- All shadcn components live under `src/components/ui/`.
- Use the shadcn CLI to add components (`npx shadcn@latest add <component>`).
- Customize via the global CSS variables defined in `globals.css`.
- Never edit shadcn source files directly — override via props or wrapper components.

---

## i18n — next-intl

- Uses App Router's `[locale]` dynamic segment for routing.
- Translation files in `public/locales/{locale}.json`.
- Server Components use `getTranslations()`; Client Components use `useTranslations()`.

### Translation File Structure

```json
// public/locales/zh.json
{
  "common": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除"
  },
  "health": {
    "bloodPressure": "血压",
    "bloodSugar": "血糖",
    "weight": "体重"
  }
}
```

### Middleware

`middleware.ts` handles locale detection (cookie → header → default `zh`) and redirects.

---

## Environment Configuration

### Multi-Environment Setup

| Environment | Config File | Backend URL |
|-------------|------------|-------------|
| Development | `.env.development` | `http://localhost:4000/api/v1` |
| Staging | `.env.staging` | `https://staging-api.familyos.dev/api/v1` |
| Production | `.env.production` | `https://api.familyos.com/api/v1` |

### Environment Variables

```bash
# .env.development
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_MQTT_BROKER=ws://localhost:8083
```

- `NEXT_PUBLIC_*` — exposed to the client bundle; safe for non-secret config only.
- Secrets (API keys, tokens) must NOT use `NEXT_PUBLIC_*` prefix — access them only in Server Components / Server Actions / API routes.

### Runtime Config Loader

```ts
// src/lib/env.ts — validates env vars at startup
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]),
  NEXT_PUBLIC_MQTT_BROKER: z.string().url().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_MQTT_BROKER: process.env.NEXT_PUBLIC_MQTT_BROKER,
});
```

---

## Docker Build

### Multi-Stage Dockerfile

```dockerfile
# apps/web/Dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

- Stage 1: installs deps (cached layer).
- Stage 2: builds the Next.js app with `output: "standalone"`.
- Stage 3: minimal production image — only `standalone` output + static files.

---

## Kubernetes Deployment (Helm)

### Helm Chart Structure

```
infra/k8s/charts/web/
├── Chart.yaml
├── values.yaml              # Default values
├── values-dev.yaml          # Dev overrides
├── values-staging.yaml      # Staging overrides
├── values-prod.yaml         # Production overrides
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── configmap.yaml
    ├── ingress.yaml
    └── _helpers.tpl
```

### Per-Environment Values

```yaml
# values-dev.yaml
replicaCount: 1
image:
  repository: registry.familyos.dev/family-os-web
  tag: dev
env:
  NEXT_PUBLIC_API_BASE_URL: "https://dev-api.familyos.dev/api/v1"
  NEXT_PUBLIC_APP_ENV: "development"
  NEXT_PUBLIC_MQTT_BROKER: "wss://dev-mqtt.familyos.dev:8083"
ingress:
  host: dev.familyos.dev
  tls: false
```

```yaml
# values-prod.yaml
replicaCount: 3
image:
  repository: registry.familyos.com/family-os-web
  tag: prod
env:
  NEXT_PUBLIC_API_BASE_URL: "https://api.familyos.com/api/v1"
  NEXT_PUBLIC_APP_ENV: "production"
ingress:
  host: familyos.com
  tls: true
  tlsSecretName: familyos-tls
```

### Deploy

```bash
# Dev
helm upgrade --install family-os-web ./infra/k8s/charts/web \
  -f ./infra/k8s/charts/web/values-dev.yaml

# Production
helm upgrade --install family-os-web ./infra/k8s/charts/web \
  -f ./infra/k8s/charts/web/values-prod.yaml
```
