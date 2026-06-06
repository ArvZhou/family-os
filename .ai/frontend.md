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
2. **Extract early** — if a chunk of markup appears twice or exceeds ~50 lines, extract it to a named component.
3. **Props interfaces are co-located** — define the `Props` interface in the same file, exported if reused.
4. **No inline styles** — use utility classes or CSS modules exclusively; component libraries for complex UI.
5. **Composition over configuration** — pass `children` or render props instead of boolean toggles like `isLarge`.

```tsx
// ✅ Good — extracted, typed, single purpose
interface HealthCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: "up" | "down" | "stable";
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

| Type | Convention | Example |
|------|-----------|---------|
| Components | `PascalCase.tsx` / `PascalCase.vue` | `HealthCard.tsx` |
| Hooks / Composables | `use<Name>.ts` | `useHealthData.ts` |
| Stores | `<name>.store.ts` | `auth.store.ts` |
| Utilities | `kebab-case.ts` | `format-date.ts` |
| Server Actions | `actions.ts` (per feature) | `features/health/actions.ts` |
| Types | `<name>.types.ts` | `health.types.ts` |
| API calls | `<name>.api.ts` / `<name>.service.ts` | `health.api.ts` |

---

## State Management

### Rule: Server State ≠ Client State

| Category | What goes there | Example |
|----------|-----------------|---------|
| **Server state** | API responses — members, health records, goals | TanStack Query, useFetch, SWR |
| **Client state** | UI state — sidebar open, theme, selected tab, auth token | Zustand, Pinia, Redux |
| **Form state** | Ephemeral form inputs, validation state | Form libraries, native state |
| **URL state** | Page, filters, sort order | Router params + searchParams |

### Principles

- **Avoid global client state** unless truly app-wide (theme, auth).
- **Prefer server state** — fetch once, cache with a data-fetching library, invalidate on mutation.
- **Form state is local** — keep it in the component; don't put it in a global store.
- **URL as source of truth** — pagination, filters, and sort order belong in the URL.

---

## Styling

### Principles

- Use a **utility-first CSS framework** (e.g., Tailwind CSS) for all styling.
- Extract repeated patterns to global CSS only when a utility combination is used 5+ times.
- **Responsive breakpoints**: mobile-first (`sm:` → `md:` → `lg:` → `xl:`).
- Use a **component library** (e.g., shadcn/ui, Nuxt UI, PrimeVue) for complex interactive components.
- **Never edit component library source files directly** — override via props or wrapper components.

```tsx
// ✅ Wrap instead of patching
import { Button as LibButton } from "@/components/ui/button";

export function Button(props: React.ComponentProps<typeof LibButton>) {
  return <LibButton {...props} />;
}
```

---

## Internationalization (i18n)

### General Standards

- Translation files organized by locale: `{locale}.json` or `{locale}/` directory.
- **Key naming**: use nested objects by domain: `common.*`, `health.*`, `member.*`, etc.
- Keys in `camelCase`, values in the target language.
- **No string concatenation** for dynamic content — use ICU message format:

```json
{
  "member": {
    "ageLabel": "{name}，{age} 岁"
  }
}
```

- Default language: `zh` (Chinese).
- Support at minimum: `zh`, `en`.

---

## Testing

### General Standards

- Test files: `*.test.ts` / `*.test.tsx` / `*.spec.ts` alongside the source (co-located) or in `__tests__/`.
- **Coverage target**: ≥ 80% for domain logic and hooks/composables.
- Every feature module requires at least:
  - **Happy path** test for the primary component.
  - **Edge case** test for empty / error / loading states.
  - **Hook/Composable tests** for any custom hook with side effects.
- Use the framework's recommended testing library (e.g., `@testing-library/react`, `@vue/test-utils`).
- **Test behavior, not implementation** — query by role, text, or label rather than internal state.
- Mock API calls with a mocking library (e.g., `msw`, `nock`) for integration tests.

```tsx
// ✅ Good — tests behavior, not implementation
import { render, screen } from "@testing-library/react";
import { HealthCard } from "../HealthCard";

describe("HealthCard", () => {
  it("renders value with unit", () => {
    render(<HealthCard title="Blood Pressure" value={120} unit="mmHg" />);
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("mmHg")).toBeInTheDocument();
  });
});
```

---

## Git Hooks

### Tools

| Tool | Purpose |
|------|---------|
| Husky | Git hook runner |
| lint-staged | Run linters on staged files only |
| commitlint | Enforce Conventional Commits format |
| truffleHog / detect-secrets | Scan for credentials and sensitive data |

### Commit Hook (`pre-commit`)

```bash
# .husky/pre-commit
pnpm lint-staged
```

`lint-staged` configuration:

```json
{
  "lint-staged": {
    "*.{ts,tsx,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### Commit Hook (`commit-msg`)

```bash
# .husky/commit-msg
pnpm commitlint --edit "$1"
```

Enforced format: [Conventional Commits](https://www.conventionalcommits.org/)

```
feat(web): add health dashboard chart
fix(web): correct blood pressure unit conversion
refactor(web): extract HealthCard to shared components
chore(web): update dependencies
```

### Push Hook (`pre-push`)

```bash
# .husky/pre-push
pnpm vitest run          # Full unit test suite
pnpm run scan:secrets    # Sensitive data scan
```

- **All tests must pass** before push is accepted.
- **Sensitive word scan** checks for: hardcoded API keys / tokens / passwords, PII patterns, private keys or certificates.

---

## Environment Configuration

### Multi-Environment Setup

Each environment gets its own config and can point to a different backend:

| Environment | Purpose |
|-------------|---------|
| Development | Local dev, feature branches |
| Staging | Pre-release QA, integration testing |
| Production | Live user-facing environment |

### Principles

- Use a **schema validation library** (e.g., Zod) to validate environment variables at startup.
- Never commit real secrets to `.env` files — use `.env.example` as a template.
- Public-facing env vars must be explicitly prefixed (framework-specific prefix convention).
- Secrets must only be accessed server-side.

---

## Feature-First Organization

Organize code by domain/feature, not by technical layer:

```
src/features/
├── health/
│   ├── components/      # Feature-specific UI
│   ├── hooks/           # Feature-specific hooks/composables
│   ├── api.ts           # Feature-specific API calls
│   └── types.ts         # Feature-specific types
├── member/
├── goal/
├── device/
├── automation/
└── archive/
```

Shared code (used across features) belongs in:

```
src/components/          # Shared UI components
src/hooks/               # Shared hooks/composables
src/lib/                 # Utilities, API client, config
```

---

## Framework-Specific Standards

- [Next.js Standards](./standards/frontend/nextjs.md) — App Router, Server Components, next-intl, standalone builds
- [Nuxt.js Standards](./standards/frontend/nuxtjs.md) — Auto-imports, Composables, @nuxtjs/i18n, Nitro builds
