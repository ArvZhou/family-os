# Nuxt.js Standards

> Framework-specific conventions for Nuxt.js projects.
> For general frontend standards, see [../../frontend.md](../../frontend.md).

---

## Tech Stack

| Category | Choice | Version (target) |
|----------|--------|-------------------|
| Framework | Nuxt (SSR + Nitro) | 3.x |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Component Library | Nuxt UI / PrimeVue | latest |
| State Management | Pinia (client) + useFetch/useAsyncData (server) | latest |
| Composables | VueUse (preferred) | latest |
| Testing | Vitest + @vue/test-utils | latest |
| Linting | ESLint + Prettier | latest |
| i18n | @nuxtjs/i18n | latest |
| Package Manager | pnpm | 9+ |

---

## Directory Structure

```
apps/web/
├── public/                          # Static assets
│   └── images/
├── assets/                          # Uncompiled assets (processed by Vite)
│   └── css/
│       └── main.css                 # Global styles + Tailwind directives
├── components/                      # Auto-imported Vue components
│   ├── ui/                          # Base UI primitives (Nuxt UI / custom)
│   ├── layout/                      # Shell, Sidebar, Header, Footer
│   └── shared/                      # Domain-agnostic reusable components
├── composables/                     # Auto-imported composables (hooks)
│   ├── useApi.ts                    # API client composable
│   ├── useAuth.ts                   # Auth composable
│   └── useHealthData.ts
├── features/                        # Feature-first domain modules
│   ├── health/
│   │   ├── components/              # Health-specific UI
│   │   ├── composables/             # Health-specific composables
│   │   └── types.ts
│   ├── member/
│   ├── goal/
│   ├── device/
│   ├── automation/
│   └── archive/
├── layouts/                         # Nuxt layouts
│   ├── default.vue                  # Main layout (sidebar + header)
│   └── auth.vue                     # Auth layout (login / register)
├── middleware/                       # Route middleware
│   ├── auth.ts                      # Authentication guard
│   └── locale.ts                    # Locale detection
├── pages/                           # File-based routing
│   ├── index.vue                    # Home page
│   ├── health/
│   │   ├── index.vue                # Health dashboard
│   │   └── [id].vue                 # Health record detail
│   ├── member/
│   ├── goal/
│   ├── device/
│   ├── automation/
│   └── archive/
├── plugins/                         # Nuxt plugins
│   ├── pinia.ts                     # Pinia store setup
│   └── api.ts                       # API client plugin
├── stores/                          # Pinia stores
│   ├── auth.store.ts
│   └── ui.store.ts
├── server/                          # Nitro server routes
│   ├── api/                         # Server API endpoints
│   └── middleware/                   # Server middleware
├── locales/                         # i18n translation files
│   ├── zh.json
│   └── en.json
├── utils/                           # Auto-imported utility functions
├── types/                           # Shared TypeScript types
├── Dockerfile                       # Multi-stage production build
├── .env.development                 # Dev environment variables
├── .env.staging                     # Staging environment variables
├── .env.production                  # Production environment variables
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## Auto-imports Convention

Nuxt auto-imports from specific directories. Follow these rules:

- **`composables/`** — all composables are auto-imported; no manual `import` needed.
- **`components/`** — all components are auto-imported; use directly in templates.
- **`utils/`** — all utility functions are auto-imported.
- **`stores/`** — Pinia stores require explicit import or use `@pinia/nuxt` auto-import.

### Naming Conventions for Auto-imports

```
composables/useHealthData.ts   → useHealthData()
components/HealthCard.vue      → <HealthCard />
utils/formatDate.ts            → formatDate()
```

- Composable files **must** start with `use`.
- Component files use `PascalCase.vue`.
- Utility files use `camelCase.ts`.

---

## Vue Component Convention

### `<script setup>` + Composition API

All components must use `<script setup lang="ts">` with the Composition API:

```vue
<script setup lang="ts">
interface Props {
  title: string
  value: number
  unit: string
  trend?: 'up' | 'down' | 'stable'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const formattedValue = computed(() => {
  return props.value.toFixed(1)
})
</script>

<template>
  <UCard>
    <template #header>{{ title }}</template>
    <span class="text-2xl font-bold">{{ formattedValue }}</span>
    <span class="text-sm text-muted">{{ unit }}</span>
    <TrendIcon v-if="trend" :direction="trend" />
  </UCard>
</template>
```

### Rules

- Prefer `defineProps` with TypeScript interface over runtime declarations.
- Use `defineEmits` with TypeScript type for type-safe events.
- Use `computed` for derived state, `watch` / `watchEffect` for side effects.
- Keep component logic minimal — extract complex logic to composables.

---

## Composables — VueUse First

Before writing a custom composable, check if `VueUse` already provides it:

| Use case | VueUse composable |
|----------|-------------------|
| Debounce | `useDebounceFn` |
| LocalStorage | `useLocalStorage` |
| Previous value | `usePrevious` |
| Click outside | `onClickOutside` |
| Media query | `useMediaQuery` |
| Toggle | `useToggle` |
| Interval | `useIntervalFn` |
| Window size | `useWindowSize` |
| Async operation | `useAsyncState` |
| Lifecycle | `onMounted` / `onUnmounted` (Vue built-in) |

Custom composables belong in `features/<feature>/composables/` (feature-specific) or `composables/` (shared, auto-imported).

---

## State Management (Nuxt Specific)

| Category | Tool | What goes there |
|----------|------|-----------------|
| Server state | `useFetch` / `useAsyncData` | API responses — members, health records, goals |
| Client state | Pinia | UI state — sidebar open, theme, auth token |
| Form state | `reactive` / `ref` + vee-validate | Ephemeral form inputs, validation state |
| URL state | `useRoute()` params + query | Page, filters, sort order |

```ts
// ✅ Pinia — client-only state
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const theme = ref<'light' | 'dark'>('light')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }

  return { sidebarOpen, theme, toggleSidebar, setTheme }
})
```

### Data Fetching

```ts
// ✅ useFetch — auto-deduplication, SSR-friendly
const { data: members, refresh } = await useFetch('/api/v1/members')

// ✅ useAsyncData — for custom async logic
const { data: healthRecords } = await useAsyncData(
  'health-records',
  () => $fetch(`/api/v1/health-records?memberId=${memberId}`)
)
```

- `useFetch` for simple GET requests.
- `useAsyncData` when you need custom logic before/after the fetch.
- Both auto-handle SSR hydration and deduplication.

---

## Styling (Nuxt Specific)

### Tailwind CSS

- Install via `@nuxtjs/tailwindcss` module.
- Use Tailwind utility classes for all styling.

### Nuxt UI (or PrimeVue)

- Install via `@nuxt/ui` module — auto-imports all components.
- Customize via `app.config.ts` for theming.
- Never edit Nuxt UI source — override via `app.config.ts` or wrapper components.

---

## i18n — @nuxtjs/i18n

- Uses Nuxt's built-in i18n module with file-based routing.
- Translation files in `locales/{locale}.json`.
- Use `$t()` in templates and `useI18n()` in `<script setup>`.

### Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'zh', name: '中文', file: 'zh.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh',
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
  },
})
```

### Usage

```vue
<template>
  <p>{{ $t('common.save') }}</p>
  <p>{{ $t('member.ageLabel', { name: member.name, age: member.age }) }}</p>
</template>

<script setup lang="ts">
const { t, locale, setLocale } = useI18n()

function switchToEnglish() {
  setLocale('en')
}
</script>
```

---

## Environment Configuration

### Multi-Environment Setup

| Environment | Config File | Backend URL |
|-------------|------------|-------------|
| Development | `.env.development` | `http://localhost:4000/api/v1` |
| Staging | `.env.staging` | `https://staging-api.familyos.dev/api/v1` |
| Production | `.env.production` | `https://api.familyos.com/api/v1` |

### Runtime Config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only secrets (not exposed to client)
    apiSecret: '',
    // Public config (exposed to client via useRuntimeConfig)
    public: {
      apiBaseUrl: '',
      appEnv: 'development',
      mqttBroker: '',
    },
  },
})
```

```bash
# .env.development
NUXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
NUXT_PUBLIC_APP_ENV=development
NUXT_PUBLIC_MQTT_BROKER=ws://localhost:8083
```

- `runtimeConfig.public.*` — exposed to the client; safe for non-secret config only.
- `runtimeConfig.*` (without `public`) — server-only secrets.

### Runtime Config Loader

```ts
// composables/useEnv.ts
import { z } from 'zod'

const envSchema = z.object({
  apiBaseUrl: z.string().url(),
  appEnv: z.enum(['development', 'staging', 'production']),
  mqttBroker: z.string().url().optional(),
})

export function useEnv() {
  const config = useRuntimeConfig()
  return envSchema.parse(config.public)
}
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

# Stage 3: Production runtime (Nitro)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
```

- Stage 1: installs deps (cached layer).
- Stage 2: builds the Nuxt app via `nuxt build` (Nitro output in `.output/`).
- Stage 3: minimal production image — only the Nitro `.output` directory.

### Nitro Presets

Configure the output preset in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  nitro: {
    preset: 'node-server',  // Default for Node.js deployment
    // Other options: 'vercel', 'cloudflare-pages', 'netlify', etc.
  },
})
```

---

## Kubernetes Deployment (Helm)

### Helm Chart Structure

Same structure as Next.js — see [Next.js Standards](./nextjs.md#kubernetes-deployment-helm) for the full Helm chart layout.

### Per-Environment Values

```yaml
# values-dev.yaml
replicaCount: 1
image:
  repository: registry.familyos.dev/family-os-web
  tag: dev
env:
  NUXT_PUBLIC_API_BASE_URL: "https://dev-api.familyos.dev/api/v1"
  NUXT_PUBLIC_APP_ENV: "development"
  NUXT_PUBLIC_MQTT_BROKER: "wss://dev-mqtt.familyos.dev:8083"
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
  NUXT_PUBLIC_API_BASE_URL: "https://api.familyos.com/api/v1"
  NUXT_PUBLIC_APP_ENV: "production"
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
