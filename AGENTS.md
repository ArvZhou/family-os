# AI Agent Conventions for Family OS

## Who This Is For

This file defines rules, constraints, and preferences for AI agents (Claude Code, custom scripts, etc.) working on this project.

Always read `AGENTS.md` before generating code.

---

## Project Summary

**Family OS** — A digital management platform for household scenarios: family members, health records, goals, IoT devices, home automation, AI assistant, and family archives.

**Architecture:** Monorepo → Frontend (GraphQL) → NestJS (GraphQL Gateway) → Spring Boot (REST) → PostgreSQL

See `.ai/architecture.md` for full details.

---

## Core Principles

1. **Modular monolith first.** Do not introduce microservices.
2. **Frontend uses GraphQL.** All frontend requests go through the NestJS GraphQL API. Never call Spring Boot REST directly.
3. **NestJS is the GraphQL Gateway.** It exposes a unified GraphQL schema and aggregates Spring Boot REST APIs.
4. **Spring is the source of truth.** Users, permissions, and core data live in Spring only.
5. **Feature-first organization.** Group by domain, not by technical layer.
6. **TypeScript strict mode is mandatory.** No `any`.
7. **PostgreSQL conventions apply everywhere.** UUID primary keys, snake_case columns.
8. **MQTT for all device communication.** No direct database writes from devices.
9. **All REST APIs must have Swagger docs.** Use `@nestjs/swagger` (NestJS) or `springdoc-openapi` (Spring Boot).
10. **All GraphQL types must have descriptions.** Every type, field, and argument needs a docstring.
11. **SSO is reserved.** Support OAuth2/OIDC for single sign-on. Do not hardcode auth provider.
12. **Keep it simple.** Maintainability > abstraction.

---

## File & Folder Rules

| Rule | Detail |
|------|--------|
| Frontend: App Router + feature-first | `src/app/[locale]/`, `src/features/health/`, `src/features/member/` |
| Frontend: components | `src/components/ui/` (shadcn), `src/components/layout/`, `src/components/shared/` |
| Frontend: stores | Zustand/Pinia for client state; GraphQL client cache for server state |
| Frontend: GraphQL | `src/graphql/queries/`, `src/graphql/mutations/`, `src/generated/` (codegen) |
| Frontend: i18n | `public/locales/{locale}.json`; next-intl via `[locale]` route segment |
| Frontend: full spec | See `.ai/frontend.md` (general) and `.ai/standards/frontend/` (framework-specific) |
| NestJS: module structure | `resolvers`, `controllers`, `services`, `dto`, `entities`, `models`, `inputs`, `dataloaders`, `*.module.ts` |
| Spring: package-by-feature | `member/`, `auth/`, `device/`, `permission/` |
| Shared types in `packages/shared-types` | Business logic does NOT go here |

---

## Naming Conventions

### NestJS

```
HealthResolver          HealthController     HealthService
CreateHealthDto         HealthEntity         CreateHealthInput
HealthRecordLoader
```

### Spring Boot

```
MemberController      MemberService       MemberRepository      MemberEntity
```

### Database

- Tables: `kebab-case` or `snake_case` → `health_record`, `family_member`
- Columns: `snake_case` → `created_at`, `member_id`
- Primary keys: `UUID`

### Events

Format: `<Entity><Action>Event`

Examples: `MemberCreatedEvent`, `HealthRecordedEvent`, `DeviceOfflineEvent`

### API

REST resource plural nouns: `/api/v1/members`, `/api/v1/health-records`

Never: `/api/getMember`, `/api/createGoal`

GraphQL: `camelCase` queries (`members`, `member(id)`), `camelCase` mutations (`createMember`, `deleteMember`)

---

## Code Style Rules

- No `console.log` or `System.out.println` in production code. Use structured logging.
- No `// TODO`, `// FIXME`, or commented-out code in committed files.
- All DTOs must have validation decorators (`class-validator`).
- All services must handle errors — no bare `try/catch` without logging.
- All public methods must have JSDoc when purpose is non-obvious.
- All REST controllers must have Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).
- All GraphQL types must have `"""description"""` docstrings.
- GraphQL resolvers must use DataLoaders to prevent N+1 queries.

---

## Architecture Guardrails

### Must Follow

- [ ] Frontend → NestJS GraphQL → Spring REST chain only. No shortcuts.
- [ ] All REST endpoints generate OpenAPI/Swagger documentation.
- [ ] GraphQL schema exported as `schema.graphql` for frontend codegen.
- [ ] Database migrations managed by Flyway in Spring Boot.
- [ ] Device communication goes through MQTT broker (EMQX preferred).
- [ ] All REST APIs versioned under `/api/v1/*`.
- [ ] Object storage uses MinIO for photos, documents, archives.
- [ ] SSO support reserved via OAuth2/OIDC — do not hardcode auth provider.

### Must Not Do

- [ ] Introduce microservices before clear need (independent deploy/scale/team boundary).
- [ ] Share databases across services. Communicate via GraphQL, REST, events, or MQTT.
- [ ] Store secrets in environment files committed to git.
- [ ] Bypass authentication on any endpoint.
- [ ] Send PII to LLM without masking names/IDs.
- [ ] Call Spring Boot REST directly from frontend — always go through NestJS GraphQL.

---

## Testing Rules

- Priority: Unit Test → Integration Test → E2E Test.
- Frontend: **Vitest** + @testing-library/react. Backend: Jest (NestJS) / JUnit + Mockito (Spring).
- Focus areas: domain logic, automation rules, health calculations.
- New feature code requires at least unit tests covering happy path and edge cases.
- All tests must pass in pre-push hook before push is accepted.

## Git Hooks (Husky)

| Hook | Action |
|------|--------|
| `pre-commit` | ESLint + Prettier on staged files (via lint-staged) |
| `commit-msg` | Enforce Conventional Commits format (via commitlint) |
| `pre-push` | Full Vitest suite + sensitive-data scan (API keys, PII, passwords) |

---

## Commit Rules

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Scope is optional but encouraged: `feat(api-nest): add health analysis`
- Co-authored-by line auto-appended by Claude Code.

---

## Memory

This project uses the `.claude/projects/-Users-arvinzhou-Workspace-Personal-family-os/memory/` directory for persistent context. Read and update memories as work progresses.
