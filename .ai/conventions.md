# Engineering Conventions

## Purpose

This document defines general engineering conventions for all contributors (human + AI agents). Framework-specific conventions are in separate files:

- [Frontend Standards](./frontend.md) — General frontend conventions
- [NestJS Standards](./standards/backend/nestjs.md) — NestJS-specific conventions
- [Spring Boot Standards](./standards/backend/spring-boot.md) — Spring Boot-specific conventions

---

## Monorepo Rules

### apps

Runnable applications. Each app is independently deployable.

### packages

Reusable shared code. Packages must not contain business logic.

```text
shared-types     # Unified type definitions
ui               # Shared UI components
utils            # Shared utility functions
config           # ESLint, Prettier, TS, env configs
```

---

## API Access

Frontend should never call the data layer directly. All requests go through the application layer.

```text
Frontend
  ↓
Application Layer (BFF / API Gateway)
  ↓
Domain Services
  ↓
Database
```

The application layer handles:
- Request routing and aggregation
- IoT device communication
- AI/LLM integration
- Cross-cutting concerns (notifications, automation)

---

## Database Conventions

### General Rules

- Use a relational database (e.g., PostgreSQL) as the primary data store.
- **Primary keys**: UUID — avoid auto-increment IDs for distributed compatibility.
- **Table names**: `snake_case` or `kebab-case` (e.g., `health_record`, `family_member`).
- **Column names**: `snake_case` (e.g., `created_at`, `member_id`).
- **Migrations**: use a migration tool (e.g., Flyway, Prisma Migrate, Knex migrations).
- The data layer service is the **single source of truth** for identity, permissions, and core data.

### Data Ownership

Each service owns its data. Avoid direct modification from other services:

- **Identity service** owns: users, permissions, device registry.
- **Application layer** communicates with identity service via HTTP API or events — never direct DB writes.

---

## API Conventions

- **Style**: REST with resource-oriented URLs.
- **Versioning**: all APIs versioned under `/api/v1/*`.
- **Resource naming**: plural nouns — `/api/v1/members`, `/api/v1/health-records`.
- Never: `/api/getMember`, `/api/createGoal`.

See [API Design Standards](./api.md) for full conventions.

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

- **Local development**: Docker Compose for infrastructure services.
- **Staging / Production**: Kubernetes + Helm (or equivalent orchestrator).
- Multi-stage Docker builds for all services.
- See [Deployment Guide](./deployment.md) for details.

### Service Conventions

- **MQTT broker** for IoT device communication (e.g., EMQX, Mosquitto).
- **Object storage** for photos, documents, archives (e.g., MinIO, S3).
- **Cache / session store** for performance (e.g., Redis).

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
System.err.println
```

---

## Testing

### Priority Order

1. **Unit Test** — fast, isolated, covers domain logic.
2. **Integration Test** — covers service interactions.
3. **E2E Test** — covers critical user journeys.

### Focus Areas

- Domain logic (health calculations, automation rules).
- Data transformations.
- Error handling paths.

### Rules

- Pre-push hook runs full test suite — tests must pass before push is accepted.
- New feature code requires at least unit tests covering happy path and edge cases.

---

## AI Agent Instructions

When generating code:

1. Follow feature-first organization.
2. Prefer modular monolith design.
3. Do not introduce microservices.
4. Do not bypass the application layer from frontend.
5. Do not bypass the data layer service for identity data.
6. Use TypeScript strict mode.
7. Follow database conventions (UUID, snake_case).
8. Prefer maintainability over abstraction.
9. Keep architecture simple.
10. Optimize for long-term extensibility.
