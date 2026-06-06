# AI Agent Conventions for Family OS

## Who This Is For

This file defines rules, constraints, and preferences for AI agents (Claude Code, custom scripts, etc.) working on this project.

Always read `AGENTS.md` before generating code.

---

## Project Summary

**Family OS** — A digital management platform for household scenarios: family members, health records, goals, IoT devices, home automation, AI assistant, and family archives.

**Architecture:** Monorepo → React + NestJS + Spring Boot + PostgreSQL

See `.ai/architecture.md` for full details.

---

## Core Principles

1. **Modular monolith first.** Do not introduce microservices.
2. **NestJS is the application layer.** Frontend must never call Spring directly.
3. **Spring is the source of truth.** Users, permissions, and core data live in Spring only.
4. **Feature-first organization.** Group by domain, not by technical layer.
5. **TypeScript strict mode is mandatory.** No `any`.
6. **PostgreSQL conventions apply everywhere.** UUID primary keys, snake_case columns.
7. **MQTT for all device communication.** No direct database writes from devices.
8. **Keep it simple.** Maintainability > abstraction.
9. **Frontend conventions apply to web.** Follow [general frontend standards](.ai/frontend.md) and the relevant framework-specific standard ([Next.js](.ai/standards/frontend/nextjs.md) or [Nuxt.js](.ai/standards/frontend/nuxtjs.md)).

---

## File & Folder Rules

| Rule | Detail |
|------|--------|
| Frontend: App Router + feature-first | `src/app/[locale]/`, `src/features/health/`, `src/features/member/` |
| Frontend: components | `src/components/ui/` (shadcn), `src/components/layout/`, `src/components/shared/` |
| Frontend: stores | Zustand in `src/stores/`; TanStack Query for server state |
| Frontend: i18n | `public/locales/{locale}.json`; next-intl via `[locale]` route segment |
| Frontend: full spec | See `.ai/frontend.md` (general) and `.ai/standards/frontend/` (framework-specific) |
| NestJS: module structure | `controllers`, `services`, `dto`, `entities`, `events`, `*.module.ts` |
| Spring: package-by-feature | `member/`, `auth/`, `device/`, `permission/` |
| Shared types in `packages/shared-types` | Business logic does NOT go here |

---

## Naming Conventions

### NestJS

```
HealthController      HealthService       CreateHealthDto       HealthEntity
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

Resource plural nouns: `/api/v1/members`, `/api/v1/health-records`

Never: `/api/getMember`, `/api/createGoal`

---

## Code Style Rules

- No `console.log` or `System.out.println` in production code. Use structured logging.
- No `// TODO`, `// FIXME`, or commented-out code in committed files.
- All DTOs must have validation decorators (`class-validator`).
- All services must handle errors — no bare `try/catch` without logging.
- All public methods must have JSDoc when purpose is non-obvious.

---

## Architecture Guardrails

### Must Follow

- [ ] Frontend → NestJS → Spring chain only. No shortcuts.
- [ ] Database migrations managed by Flyway in Spring Boot.
- [ ] Device communication goes through MQTT broker (EMQX preferred).
- [ ] All APIs versioned under `/api/v1/*`.
- [ ] Object storage uses MinIO for photos, documents, archives.

### Must Not Do

- [ ] Introduce microservices before clear need (independent deploy/scale/team boundary).
- [ ] Share databases across services. Communicate via HTTP, events, or MQTT.
- [ ] Store secrets in environment files committed to git.
- [ ] Bypass authentication on any endpoint.
- [ ] Send PII to LLM without masking names/IDs.

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
