# Frontend Standards

## Purpose

This document defines framework-agnostic frontend engineering standards. For framework-specific conventions, see:

- [Next.js Standards](./standards/frontend/nextjs.md)
- [Nuxt.js Standards](./standards/frontend/nuxtjs.md)

---

## Coding Conventions

### TypeScript

- **Strict mode is mandatory** — no `any`.
- Use `interface` for object shapes, `type` for unions / intersections.
- All public functions must have explicit return types.
- Server-side rendering code must not import client-only modules without proper guards.
- Prefer explicit imports over ambient types for clarity.

### Component Principles

1. **Single responsibility** — one component = one clear purpose.
2. **Extract early** — if a chunk of markup appears twice or exceeds ~50 lines, extract it.
3. **Props interfaces are co-located** — define the `Props` interface in the same file.
4. **No inline styles** — use utility classes or CSS modules exclusively.
5. **Composition over configuration** — pass `children` or render props instead of boolean toggles.

```tsx
// ✅ Good — extracted, typed, single purpose
interface HealthCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  children?: React.ReactNode;
}

export function HealthCard({ title, value, unit, trend, children }: HealthCardProps) {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
        {trend && <TrendIcon direction={trend} />}
      </CardContent>
      {children}
    </Card>
  );
}
```

### File Naming

| Type                | Convention                               | Example                      |
| ------------------- | ---------------------------------------- | ---------------------------- |
| Components          | `PascalCase.tsx` / `PascalCase.vue`      | `HealthCard.tsx`             |
| Hooks / Composables | `use<Name>.ts`                           | `useHealthData.ts`           |
| Stores              | `<name>.store.ts`                        | `auth.store.ts`              |
| Utilities           | `kebab-case.ts`                          | `format-date.ts`             |
| Server Actions      | `actions.ts` (per feature)               | `features/health/actions.ts` |
| Types               | `<name>.types.ts`                        | `health.types.ts`            |
| GraphQL queries     | `<name>.queries.ts` / `<name>.graphql`   | `member.queries.ts`          |
| GraphQL mutations   | `<name>.mutations.ts` / `<name>.graphql` | `member.mutations.ts`        |

---

## API Integration — GraphQL

### Principles

- **Frontend communicates with the backend via GraphQL** — this is the primary API channel.
- Use a **GraphQL client** (Apollo Client, urql, or framework-specific equivalent).
- **Generate TypeScript types** from the GraphQL schema using `graphql-codegen`.
- Organize operations by domain (queries, mutations, fragments per feature).

### GraphQL Client Setup

| Framework       | Recommended Client                                |
| --------------- | ------------------------------------------------- |
| React / Next.js | Apollo Client (`@apollo/client`) or urql          |
| Vue / Nuxt.js   | `@vue/apollo-composable` or `nuxt-graphql-client` |

### Code Generation

Use `graphql-codegen` to generate TypeScript types from the backend schema:

```ts
// codegen.ts — 本仓库实际使用环境变量优先，回退到本地开发地址
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  documents: 'src/graphql/**/*.ts',
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          Date: 'string',
        },
      },
    },
  },
};

export default config;
```

> **Note:** This example matches the actual `apps/family-portal/codegen.ts`. The schema URL uses `NEXT_PUBLIC_GRAPHQL_URL` environment variable with a localhost fallback — not a hardcoded URL.

### Query Organization

```text
src/
├── graphql/                       # GraphQL operations
│   ├── queries/
│   │   ├── member.queries.ts      # or member.queries.graphql
│   │   ├── health.queries.ts
│   │   ├── goal.queries.ts
│   │   └── device.queries.ts
│   ├── mutations/
│   │   ├── member.mutations.ts
│   │   ├── health.mutations.ts
│   │   └── goal.mutations.ts
│   ├── fragments/
│   │   ├── member.fragment.ts
│   │   └── health-record.fragment.ts
│   └── subscriptions/
│       └── device.subscriptions.ts
└── generated/
    └── graphql.ts                 # Auto-generated types (do not edit)
```

### Example — React with Apollo Client

```tsx
// src/graphql/queries/member.queries.ts
import { gql } from '@apollo/client';

export const GET_MEMBERS = gql`
  query GetMembers {
    members {
      id
      name
      birthday
      relation
      avatarUrl
    }
  }
`;

export const GET_MEMBER = gql`
  query GetMember($id: ID!) {
    member(id: $id) {
      id
      name
      birthday
      relation
      avatarUrl
      healthRecords(first: 10) {
        edges {
          node {
            id
            type
            values
            recordedAt
          }
        }
      }
    }
  }
`;
```

```tsx
// Usage in component
import { useQuery } from '@apollo/client';
import { GET_MEMBERS } from '@/graphql/queries/member.queries';
import type { GetMembersQuery } from '@/generated/graphql';

function MemberList() {
  const { data, loading, error } = useQuery<GetMembersQuery>(GET_MEMBERS);

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <ul>
      {data?.members.map((member) => (
        <li key={member.id}>{member.name}</li>
      ))}
    </ul>
  );
}
```

### Example — Vue with Apollo Composable

```ts
// src/graphql/queries/member.queries.ts
import { gql } from 'graphql-tag';

export const GET_MEMBERS = gql`
  query GetMembers {
    members {
      id
      name
      birthday
      relation
    }
  }
`;
```

```vue
<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable';
import { GET_MEMBERS } from '@/graphql/queries/member.queries';

const { result, loading, error } = useQuery(GET_MEMBERS);
const members = computed(() => result.value?.members ?? []);
</script>
```

### Error Handling

- Check `error` from the GraphQL client for network and GraphQL errors.
- Display user-friendly messages for `extensions.code` values (NOT_FOUND, VALIDATION_ERROR, etc.).
- Log unexpected errors to monitoring.

---

## State Management

### Rule: Server State ≠ Client State

| Category         | What goes there                          | Example                      |
| ---------------- | ---------------------------------------- | ---------------------------- |
| **Server state** | GraphQL query results (cached by client) | Apollo cache, urql cache     |
| **Client state** | UI state — sidebar, theme, auth token    | Zustand, Pinia               |
| **Form state**   | Ephemeral form inputs, validation        | Form libraries, native state |
| **URL state**    | Page, filters, sort order                | Router params + searchParams |

### Principles

- **GraphQL client handles server state** — caching, refetching, and invalidation are built-in.
- **Avoid global client state** unless truly app-wide (theme, auth).
- **Form state is local** — keep it in the component.
- **URL as source of truth** — pagination, filters, and sort order belong in the URL.

---

## Styling

### Principles

- Use a **utility-first CSS framework** (e.g., Tailwind CSS) for all styling.
- Extract repeated patterns to global CSS only when used 5+ times.
- **Responsive breakpoints**: mobile-first.
- Use a **component library** for complex interactive components.
- **Never edit component library source files** — override via props or wrappers.

---

## Internationalization (i18n)

### General Standards

- Translation files organized by locale.
- **Key naming**: nested objects by domain: `common.*`, `health.*`, `member.*`.
- Keys in `camelCase`, values in the target language.
- **No string concatenation** — use ICU message format for dynamic content.
- Default language: `zh`. Support at minimum: `zh`, `en`.

---

## Authentication & SSO

### JWT Token Management

- Store access token in memory (preferred) or `httpOnly` cookie.
- Store refresh token in `httpOnly` cookie or secure storage.
- Attach `Authorization: Bearer <token>` to all GraphQL requests via client middleware.
- Auto-refresh on 401 / token expiry.

### SSO Flow (OAuth2/OIDC)

```text
1. User clicks "Login with SSO"
2. Redirect to /api/v1/auth/sso/login (NestJS)
3. NestJS redirects to SSO provider
4. User authenticates with SSO provider
5. SSO provider redirects to /api/v1/auth/sso/callback
6. NestJS exchanges code, issues JWT
7. Frontend stores JWT, redirects to dashboard
```

### Frontend SSO Routes

- `/login` — login page with local + SSO options.
- `/auth/sso/callback` — handles redirect from SSO provider.
- `/logout` — clears local session, optionally calls SSO logout.

---

## Testing

### General Standards

- Test files co-located with source or in `__tests__/`.
- **Coverage target**: ≥ 80% for domain logic and hooks/composables.
- Every feature module requires:
  - **Happy path** test for the primary component.
  - **Edge case** test for empty / error / loading states.
  - **Hook/Composable tests** for custom hooks with side effects.
- **Test behavior, not implementation.**
- Mock GraphQL queries in component tests.

```tsx
// ✅ Mock GraphQL query in test
import { MockedProvider } from '@apollo/client/testing';

const mocks = [
  {
    request: { query: GET_MEMBERS },
    result: { data: { members: [{ id: '1', name: 'Alice' }] } },
  },
];

render(
  <MockedProvider mocks={mocks}>
    <MemberList />
  </MockedProvider>,
);
```

---

## Git Hooks

### Tools

| Tool                        | Purpose                      |
| --------------------------- | ---------------------------- |
| Husky                       | Git hook runner              |
| lint-staged                 | Run linters on staged files  |
| commitlint                  | Enforce Conventional Commits |
| truffleHog / detect-secrets | Scan for credentials         |

### Hooks

| Hook         | Action                                |
| ------------ | ------------------------------------- |
| `pre-commit` | ESLint + Prettier on staged files     |
| `commit-msg` | Conventional Commits validation       |
| `pre-push`   | Full test suite + sensitive-data scan |

---

## Environment Configuration

### Multi-Environment Setup

| Environment | Purpose                             |
| ----------- | ----------------------------------- |
| Development | Local dev, feature branches         |
| Staging     | Pre-release QA, integration testing |
| Production  | Live user-facing environment        |

### Principles

- Use a **schema validation library** (e.g., Zod) to validate env vars at startup.
- Never commit real secrets — use `.env.example`.
- Public-facing env vars must be explicitly prefixed.
- Secrets must only be accessed server-side.

---

## Feature-First Organization

```text
src/features/
├── health/
│   ├── components/      # Feature-specific UI
│   ├── hooks/           # Feature-specific hooks/composables
│   ├── queries.ts       # GraphQL queries for health
│   ├── mutations.ts     # GraphQL mutations for health
│   └── types.ts         # Feature-specific types
├── member/
├── goal/
├── device/
├── automation/
└── archive/
```

Shared code in:

```text
src/components/          # Shared UI components
src/hooks/               # Shared hooks/composables
src/lib/                 # Utilities, API client, config
src/graphql/             # Shared GraphQL operations
src/generated/           # Auto-generated types (codegen)
```

---

## Framework-Specific Standards

- [Next.js Standards](./standards/frontend/nextjs.md) — App Router, Server Components, next-intl, standalone builds
- [Nuxt.js Standards](./standards/frontend/nuxtjs.md) — Auto-imports, Composables, @nuxtjs/i18n, Nitro builds
