# Family OS

A digital management platform for household scenarios.

<div align="center">

**Family members · Health records · Goals · IoT devices · Home automation · AI assistant · Family archives**

[Architecture](.ai/architecture.md) · [API Standards](.ai/api.md) · [Deployment](.ai/deployment.md) · [Features](.ai/features/) · [Standards](.ai/standards/)

</div>

---

## Features

| Domain              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| **Family Members**  | Manage family member profiles, relationships, avatars                |
| **Health Records**  | Track blood pressure, blood sugar, weight, temperature; view trends  |
| **Goals & Growth**  | Set goals, build habits, track growth scores                         |
| **IoT Devices**     | Register and control smart devices via MQTT                          |
| **Home Automation** | Define rules — if sensor X exceeds threshold → do Y                  |
| **AI Assistant**    | Health analysis, goal recommendations, family Q&A powered by LLM     |
| **Family Archive**  | Store photos, documents, and important events as searchable archives |
| **SSO**             | Single sign-on via OAuth2/OIDC (Keycloak, Auth0, Casdoor, etc.)      |

## Tech Stack

```
Frontend (Next.js)
  ↓ (GraphQL)
NestJS (family-service) — GraphQL Gateway + Business Layer + IoT + AI
  ↓ (REST, internal)
Spring Boot (identity-service) — Identity & Core Data Layer (SSO / OAuth2)
  ↓
PostgreSQL

Device → MQTT Broker (EMQX) → NestJS
```

> **Note:** The frontend currently supports only Next.js. The NestJS gateway and Spring Boot identity service are implemented as `apps/family-service` and `apps/identity-service` respectively.

### API Layer

- **Frontend → Backend:** GraphQL (NestJS gateway)
- **Service-to-Service:** REST (documented via Swagger / OpenAPI)
- **API Docs:** Swagger UI for REST, GraphQL Playground for schema introspection
- **Authentication:** JWT + SSO (OAuth2 / OIDC reserved)

### Frontend

- **Framework:** Next.js 15+ (see [standards](.ai/standards/frontend/nextjs.md))
- **API Client:** Apollo Client (React)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** GraphQL client cache (server) + Zustand (client)
- **i18n:** next-intl
- **Testing:** Vitest
- **Linting:** ESLint + Prettier (pre-commit via Husky + lint-staged)

> **Note:** Nuxt.js / Vue support is documented in [standards](.ai/standards/frontend/nuxtjs.md) as a future option but is not currently implemented in this repository.

### Backend

- **GraphQL Gateway:** NestJS (`@nestjs/graphql`, code-first)
- **Core Data:** Spring Boot (MyBatis-Plus, Flyway, SpringDoc OpenAPI)
- **Database:** PostgreSQL (UUID primary keys, snake_case)

### Infrastructure

- **Database:** PostgreSQL (Flyway migrations)
- **Cache / Session:** Redis
- **Messaging:** MQTT (EMQX or Mosquitto)
- **Object Storage:** MinIO
- **Containerization:** Docker + Docker Compose (local), Kubernetes + Helm (staging / production)

## Repository Structure

```
family-os/
├── apps/                         # Runnable applications
│   ├── family-portal/            # Next.js frontend (SSR + App Router)
│   ├── family-service/           # NestJS — business, IoT, AI
│   └── identity-service/         # Spring Boot — identity & core data
├── packages/                     # Shared code
│   ├── shared-types/             # TypeScript type definitions
│   ├── graphql-schema/           # Shared GraphQL schema & codegen types
│   ├── ui/                       # Shared React components
│   ├── utils/                    # Shared utility functions
│   └── config/                   # ESLint, Prettier, TS configs
├── infra/                        # Infrastructure as code
│   ├── docker/                   # Docker Compose + per-service Dockerfiles
│   ├── k8s/                      # Helm charts for staging / production
│   ├── nginx/                    # Reverse proxy config
│   ├── mqtt/                     # MQTT broker config
│   └── database/                 # Database migration scripts
├── docs/                         # Project documentation
├── tools/                        # Dev utilities
└── .ai/                          # Architecture & design docs (standards + features)
```

## Quick Start

### Prerequisites

- Node.js 22+ (LTS)
- Java 21+
- pnpm 9+
- Docker & Docker Compose

### 1. Start infrastructure

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

This starts PostgreSQL, Redis, MQTT (EMQX), and MinIO.

### 2. Run databases migrations

```bash
cd apps/identity-service && ./gradlew flywayMigrate
```

### 3. Start backend services

```bash
# Spring Boot
cd apps/identity-service && ./gradlew bootRun

# NestJS (in another terminal)
cd apps/family-service && pnpm dev
```

### 4. Start frontend

```bash
cd apps/family-portal && pnpm install && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

### General Standards

| Document                                      | Description                                          |
| --------------------------------------------- | ---------------------------------------------------- |
| [Architecture](.ai/architecture.md)           | System architecture principles and evolution roadmap |
| [Frontend Standards](.ai/frontend.md)         | Framework-agnostic frontend conventions              |
| [API Design Standards](.ai/api.md)            | GraphQL & REST API conventions, Swagger, SSO auth    |
| [Engineering Conventions](.ai/conventions.md) | Coding standards, naming, folder structure           |
| [Deployment Standards](.ai/deployment.md)     | Multi-env config, Docker builds, K8s Helm, checklist |

### Framework-Specific Standards (`standards/`)

| Document                                                      | Description                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [Next.js Standards](.ai/standards/frontend/nextjs.md)         | Apollo Client, codegen, App Router, next-intl, SSO, Docker, Helm                                   |
| [Nuxt.js Standards](.ai/standards/frontend/nuxtjs.md)         | vue-apollo, codegen, auto-imports, @nuxtjs/i18n, SSO, Nitro builds                                 |
| [NestJS Standards](.ai/standards/backend/nestjs.md)           | GraphQL resolvers, Swagger, DataLoaders, SSO guard, MQTT                                           |
| [Spring Boot Standards](.ai/standards/backend/spring-boot.md) | SpringDoc OpenAPI, Spring Security, OAuth2/OIDC, Flyway, testing                                   |
| [Terraform Standards](.ai/standards/infra/terraform.md)       | Cloud infrastructure as code — VPC, DB, K8s, Redis, DNS, SSL _(future; no `infra/terraform/` yet)_ |

### Feature Specs (`features/`)

Feature specs are ordered by implementation dependency (01–14). The first four (auth, members, GraphQL gateway, frontend shell) are implemented; the remaining are in planning or early development.

| #   | Document                                                | Service          | Description                        |
| --- | ------------------------------------------------------- | ---------------- | ---------------------------------- |
| 01  | [Auth](.ai/features/01-auth.md)                         | identity-service | Registration, login, JWT           |
| 02  | [Members](.ai/features/02-members.md)                   | identity-service | Family member profiles             |
| 03  | [GraphQL Gateway](.ai/features/03-graphql-gateway.md)   | family-service   | GraphQL API + Spring Boot proxy    |
| 04  | [Frontend Shell](.ai/features/04-frontend-shell.md)     | family-portal    | Login page, layout, member list    |
| 05  | [Health Records](.ai/features/05-health-records.md)     | family-service   | Health metrics, trends _(planned)_ |
| 06  | [Goals](.ai/features/06-goals.md)                       | family-service   | Goal setting, progress _(planned)_ |
| 07  | [Device Registry](.ai/features/07-device-registry.md)   | identity-service | Device registration, status        |
| 08  | [MQTT Integration](.ai/features/08-mqtt-integration.md) | family-service   | IoT device communication           |
| 09  | [Device Control](.ai/features/09-device-control.md)     | family-service   | Device commands + subscriptions    |
| 10  | [AI Services](.ai/features/10-ai-services.md)           | family-service   | LLM analysis, recommendations      |
| 11  | [Automation](.ai/features/11-automation.md)             | family-service   | Rule-based triggers                |
| 12  | [Notifications](.ai/features/12-notifications.md)       | family-service   | Multi-channel alerts               |
| 13  | [Archive](.ai/features/13-archive.md)                   | family-service   | Photo/document storage             |
| 14  | [SSO](.ai/features/14-sso.md)                           | identity-service | OAuth2/OIDC single sign-on         |

Chinese versions available in `.ai/zh/` (`*.zh.md`).

## Architecture Principles

1. **Prefer modular monolith** — One application, multiple modules per service.
2. **No microservices early on** — Split only when independent deploy/scale/team boundaries demand it.
3. **No shared databases** — Services communicate via GraphQL, REST, events, or MQTT.
4. **Frontend uses GraphQL** — All frontend requests go through NestJS GraphQL API. No direct REST to Spring.
5. **REST APIs have Swagger docs** — All REST endpoints generate OpenAPI documentation.
6. **TypeScript strict mode** — No `any` types.
7. **SSO ready** — OAuth2/OIDC reserved for single sign-on integration.

## Contributing

If you're an AI agent working on this project, read [AGENTS.md](AGENTS.md) first.
