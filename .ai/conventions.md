# Engineering Conventions

## Purpose

This document defines general engineering conventions for all contributors (human + AI agents). Framework-specific conventions are in separate files:

- [Frontend Standards](./frontend.md) — General frontend conventions
- [API Design Standards](./api.md) — GraphQL & REST API conventions
- [NestJS Standards](./standards/backend/nestjs.md) — NestJS-specific conventions
- [Spring Boot Standards](./standards/backend/spring-boot.md) — Spring Boot-specific conventions

---

## Monorepo Rules

### apps

Runnable applications. Each app is independently deployable.

### packages

Reusable shared code. Packages must not contain business logic.

```text
shared-types     # Unified TypeScript type definitions
graphql-schema   # Shared GraphQL schema & codegen types
ui               # Shared UI components
utils            # Shared utility functions
config           # ESLint, Prettier, TS, env configs
```

---

## API Access

Frontend communicates with the backend via **GraphQL**. Internal service-to-service communication uses **REST**.

```text
Frontend
  ↓ (GraphQL)
NestJS — GraphQL Gateway + Application Layer
  ↓ (REST, internal)
Spring Boot — Identity & Core Data Layer
  ↓
PostgreSQL
```

- **Frontend never calls Spring Boot directly** — all requests go through the NestJS GraphQL API.
- **NestJS aggregates** Spring Boot REST endpoints and exposes them as a unified GraphQL schema.
- **REST endpoints** are for internal service communication and external integrations.

---

## Database Conventions

### PostgreSQL

**PostgreSQL** is the database for all services.

- **Primary keys**: UUID — avoid auto-increment IDs for distributed compatibility.
- **Table names**: `snake_case` (e.g., `health_record`, `family_member`).
- **Column names**: `snake_case` (e.g., `created_at`, `member_id`).
- **Migrations**: Flyway for Spring Boot; Prisma Migrate or Knex for NestJS.
- **Indexes**: add indexes for frequently queried columns, foreign keys, and unique constraints.
- **Timestamps**: every table must have `created_at` and `updated_at` columns (auto-managed).
- **Soft delete**: use `deleted_at` timestamp instead of hard deletes for important data.

### Data Ownership

Each service owns its data. Avoid direct modification from other services:

- **Spring Boot (identity-service)** currently owns: users, authentication, permissions, family members, and device registry. In the current codebase, this includes `AuthController`, `MemberController`, `DeviceController`, and `PermissionController`.
- **NestJS (family-service)** serves as the **GraphQL aggregation and business orchestration layer**. It proxies identity/core data from Spring Boot via REST and owns its own domain data (health records, goals, automation rules, AI analysis cache, IoT state — these domains are partially implemented or planned).
- NestJS communicates with Spring Boot via REST API — never direct DB writes.

> **Note:** The data ownership split described here is the target architecture. In the current implementation, identity-service is the most fully realized service; family-service implements auth and member proxying with additional domains in progress.

---

## API Conventions

### GraphQL (Frontend API)

- **Schema-first** approach: define the GraphQL schema before implementing resolvers.
- Every type, field, and argument must have a description docstring.
- Use Relay-style **connection pagination** for list queries.
- Use **enums** for fixed value sets instead of strings.
- Resolve N+1 queries with **DataLoaders**.
- Export `schema.graphql` for frontend code generation.

See [API Design Standards](./api.md) for full GraphQL conventions.

### REST (Internal API)

- **Resource-oriented URLs** with plural nouns.
- **Versioned**: all APIs under `/api/v1/*`.
- **Swagger/OpenAPI**: all REST endpoints must generate OpenAPI 3.0 documentation.
  - NestJS: `@nestjs/swagger` decorators → Swagger UI at `/api/docs`
  - Spring Boot: `springdoc-openapi` → Swagger UI at `/swagger-ui.html`

See [API Design Standards](./api.md) for full REST conventions.

---

## Authentication & SSO

### JWT

- Use JWT Bearer tokens for API authentication.
- Access tokens: short-lived (15–30 minutes).
- Refresh tokens: longer-lived (7–30 days), stored securely.
- Include `Authorization: Bearer <token>` header in all authenticated requests.

### SSO — OAuth2 / OIDC (Reserved)

- Support **OAuth2 / OpenID Connect** for single sign-on.
- SSO provider is **pluggable** — any OIDC-compliant provider (Keycloak, Auth0, Casdoor, Azure AD, etc.).
- When SSO is enabled:
  - Login redirects to SSO provider.
  - Callback exchanges authorization code for tokens.
  - Internal JWT is issued based on SSO identity.
- When SSO is disabled:
  - Fall back to local username/password authentication.
- SSO configuration via environment variables (see [API Design Standards](./api.md)).

---

## Event Naming

Format: `<Entity><Action>Event`

Examples:

```text
MemberCreatedEvent
HealthRecordedEvent
DeviceOfflineEvent
GoalCompletedEvent
```

- Prefer events for: device status updates, notifications, automation triggers.
- Use an event bus or message broker for inter-service communication.

---

## Infrastructure Conventions

- **Local development**: Docker Compose for PostgreSQL, Redis, MQTT, MinIO.
- **Staging / Production**: Kubernetes + Helm.
- Multi-stage Docker builds for all services.
- See [Deployment Guide](./deployment.md) for details.

### Service Conventions

- **MQTT broker** for IoT device communication (EMQX preferred, Mosquitto alternative).
- **Redis** for caching, sessions, rate limiting.
- **MinIO / S3** for object storage (photos, documents, archives).

---

## Logging

Use structured logs. Include contextual identifiers when available:

```text
request_id
member_id
device_id
```

Avoid in production code:

```text
console.log
System.out.println
```

---

## Testing

### Priority Order

1. **Unit Test** — fast, isolated, covers domain logic.
2. **Integration Test** — covers service interactions.
3. **E2E Test** — covers critical user journeys.

### Focus Areas

- Domain logic (health calculations, automation rules).
- GraphQL resolvers (query correctness, mutation side effects).
- Data transformations.
- Error handling paths.

### Rules

- Pre-push hook runs full test suite — tests must pass before push is accepted.
- New feature code requires at least unit tests covering happy path and edge cases.
- GraphQL integration tests should verify query responses against the schema.

---

## AI Agent Instructions

When generating code:

1. Follow feature-first organization.
2. Prefer modular monolith design.
3. Do not introduce microservices.
4. Do not bypass the NestJS GraphQL layer from frontend.
5. Do not bypass Spring Boot for identity data.
6. Use TypeScript strict mode.
7. Follow PostgreSQL conventions (UUID, snake_case).
8. All REST endpoints must have Swagger decorators.
9. All GraphQL types must have description docstrings.
10. Prefer maintainability over abstraction.
11. Keep architecture simple.
12. Optimize for long-term extensibility.
