# Family OS

A digital management platform for household scenarios.

<div align="center">

**Family members · Health records · Goals · IoT devices · Home automation · AI assistant · Family archives**

[Architecture](.ai/architecture.md) · [API Standards](.ai/api.md) · [Deployment](.ai/deployment.md) · [Features](.ai/features/) · [Standards](.ai/standards/)

</div>

---

## Features

| Domain | What it does |
|--------|-------------|
| **Family Members** | Manage family member profiles, relationships, avatars |
| **Health Records** | Track blood pressure, blood sugar, weight, temperature; view trends |
| **Goals & Growth** | Set goals, build habits, track growth scores |
| **IoT Devices** | Register and control smart devices via MQTT |
| **Home Automation** | Define rules — if sensor X exceeds threshold → do Y |
| **AI Assistant** | Health analysis, goal recommendations, family Q&A powered by LLM |
| **Family Archive** | Store photos, documents, and important events as searchable archives |
| **SSO** | Single sign-on via OAuth2/OIDC (Keycloak, Auth0, Casdoor, etc.) |

## Tech Stack

```
Frontend (Next.js / Nuxt.js)
  ↓ (GraphQL)
NestJS — GraphQL Gateway + Business Layer + IoT + AI
  ↓ (REST, internal)
Spring Boot — Identity & Core Data Layer (SSO / OAuth2)
  ↓
PostgreSQL

Device → MQTT Broker (EMQX) → NestJS
```

### API Layer

- **Frontend → Backend:** GraphQL (NestJS gateway)
- **Service-to-Service:** REST (documented via Swagger / OpenAPI)
- **API Docs:** Swagger UI for REST, GraphQL Playground for schema introspection
- **Authentication:** JWT + SSO (OAuth2 / OIDC reserved)

### Frontend

- **Framework:** Next.js 15+ or Nuxt 3+ (see [standards](.ai/standards/frontend/))
- **API Client:** Apollo Client (React) / vue-apollo (Vue)
- **Styling:** Tailwind CSS + component library (shadcn/ui or Nuxt UI)
- **State:** GraphQL client cache (server) + Zustand/Pinia (client)
- **i18n:** next-intl (Next.js) / @nuxtjs/i18n (Nuxt.js)
- **Testing:** Vitest
- **Linting:** ESLint + Prettier (pre-commit via Husky + lint-staged)

### Backend

- **GraphQL Gateway:** NestJS (`@nestjs/graphql`, code-first)
- **Core Data:** Spring Boot (JPA, Flyway, SpringDoc OpenAPI)
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
│   ├── web/                      # Next.js frontend (SSR + App Router)
│   ├── api-spring/               # Spring Boot — identity & core data
│   └── api-nest/                 # NestJS — business, IoT, AI
├── packages/                     # Shared code
│   ├── shared-types/             # TypeScript type definitions
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
cd apps/api-spring && ./mvnw flyway:migrate
```

### 3. Start backend services

```bash
# Spring Boot
cd apps/api-spring && ./mvnw spring-boot:run

# NestJS (in another terminal)
cd apps/api-nest && pnpm dev
```

### 4. Start frontend

```bash
cd apps/web && pnpm install && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

### General Standards

| Document | Description |
|----------|-------------|
| [Architecture](.ai/architecture.md) | System architecture principles and evolution roadmap |
| [Frontend Standards](.ai/frontend.md) | Framework-agnostic frontend conventions |
| [API Design Standards](.ai/api.md) | GraphQL & REST API conventions, Swagger, SSO auth |
| [Engineering Conventions](.ai/conventions.md) | Coding standards, naming, folder structure |
| [Deployment Standards](.ai/deployment.md) | Multi-env config, Docker builds, K8s Helm, checklist |

### Framework-Specific Standards (`standards/`)

| Document | Description |
|----------|-------------|
| [Next.js Standards](.ai/standards/frontend/nextjs.md) | Apollo Client, codegen, App Router, next-intl, SSO, Docker, Helm |
| [Nuxt.js Standards](.ai/standards/frontend/nuxtjs.md) | vue-apollo, codegen, auto-imports, @nuxtjs/i18n, SSO, Nitro builds |
| [NestJS Standards](.ai/standards/backend/nestjs.md) | GraphQL resolvers, Swagger, DataLoaders, SSO guard, MQTT |
| [Spring Boot Standards](.ai/standards/backend/spring-boot.md) | SpringDoc OpenAPI, Spring Security, OAuth2/OIDC, Flyway, testing |

### Feature Specs (`features/`)

| Document | Description |
|----------|-------------|
| [API Endpoints & GraphQL](.ai/features/api.md) | REST endpoints + GraphQL query/mutation definitions |
| [MQTT Design](.ai/features/mqtt.md) | Topics, message format, authentication |
| [AI Service](.ai/features/ai-service.md) | LLM integration, prompt design, caching |

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
