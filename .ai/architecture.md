# System Architecture Standards

## Purpose

This document defines general system architecture principles. For technology-specific standards, see:

- [Frontend Standards](./frontend.md) — Framework-agnostic frontend conventions
  - [Next.js Standards](./standards/frontend/nextjs.md) | [Nuxt.js Standards](./standards/frontend/nuxtjs.md)
- [Engineering Conventions](./conventions.md) — General engineering conventions
  - [NestJS Standards](./standards/backend/nestjs.md) | [Spring Boot Standards](./standards/backend/spring-boot.md)
- [API Design Standards](./api.md) — GraphQL & REST API conventions

---

## Overall Architecture

```text
Frontend (Web / Mobile)
  ↓ (GraphQL)
NestJS — GraphQL Gateway + Application Layer
  ↓ (REST, internal)
Spring Boot — Identity & Core Data Layer
  ↓
PostgreSQL
```

Device communication path:

```text
IoT Device
  ↓
MQTT Broker (EMQX / Mosquitto)
  ↓
NestJS
  ↓
PostgreSQL / GraphQL Subscription
```

---

## Repository Structure (Monorepo)

```text
project/
├── apps/                    # Runnable applications
│   ├── web/                 # Frontend application
│   ├── api-nest/            # NestJS — GraphQL gateway + BFF
│   └── api-spring/          # Spring Boot — identity & core data
├── packages/                # Reusable shared code
│   ├── shared-types/        # TypeScript type definitions
│   ├── graphql-schema/      # Shared GraphQL schema & codegen types
│   ├── ui/                  # Shared UI components
│   ├── utils/               # Utility functions
│   └── config/              # Shared configs (lint, format, ts)
├── infra/                   # Infrastructure as code
│   ├── docker/              # Docker Compose + Dockerfiles
│   ├── k8s/                 # Kubernetes / Helm charts
│   ├── terraform/           # Cloud infrastructure (IaC)
│   ├── nginx/               # Reverse proxy config
│   ├── mqtt/                # MQTT broker config
│   └── database/            # Database migration scripts (Flyway)
├── docs/                    # Project documentation
├── tools/                   # Dev utilities
├── package.json
├── workspace.yaml
└── README.md
```

---

## Application Layer (`apps`)

### Frontend Application

Responsibilities:

- User interface with SSR for SEO and fast initial load
- Data presentation (charts, dashboards, trends)
- IoT device control interface
- Multi-language support
- Multi-environment deployment
- **GraphQL client** consuming the NestJS GraphQL API

See [Frontend Standards](./frontend.md) for conventions.

### NestJS — GraphQL Gateway + Application Layer

NestJS serves as the **GraphQL gateway** and **application layer**:

```text
Role:
  GraphQL Gateway (frontend API)
  Business Logic (health, goals, archive)
  IoT Layer (MQTT integration)
  AI Layer (LLM integration)
  BFF (Backend for Frontend)
```

Responsibilities:

- **GraphQL API**: expose a unified GraphQL schema for frontend consumption
- **Aggregate REST calls**: orchestrate calls to Spring Boot's REST APIs
- **Business logic**: health analysis, goal management, automation rules
- **IoT**: MQTT device communication
- **AI/LLM**: intelligent analysis and recommendations
- **Notifications**: multi-channel alerts
- **Swagger**: REST endpoints documented via OpenAPI

NestJS is **not** a source of truth — it delegates to Spring Boot for identity and core data.

### Spring Boot — Identity & Core Data Layer

Spring Boot serves as the **data layer** and **single source of truth**:

```text
Role:
  Identity (users, authentication)
  Permissions (authorization, RBAC)
  Core Data (members, device registry)
  SSO Provider Integration (OAuth2/OIDC)
```

Responsibilities:

- **Authentication**: local login + OAuth2/OIDC SSO integration
- **Authorization**: permission management, role-based access control
- **Core data**: family members, device registry, base records
- **REST API**: documented via SpringDoc OpenAPI / Swagger
- **Database ownership**: sole owner of PostgreSQL identity/core tables

Spring Boot owns the data — other services communicate via REST API.

---

## Shared Packages (`packages`)

### `shared-types`

Unified TypeScript type definitions shared across all applications.

### `graphql-schema`

Shared GraphQL schema files and auto-generated TypeScript types from `graphql-codegen`.

### `ui`

Shared UI components.

### `utils`

Shared utility functions (date formatting, validation, formatters).

### `config`

Shared configuration for ESLint, Prettier, TypeScript, and environment setup.

---

## Infrastructure (`infra`)

### `docker`

Docker Compose for local development — PostgreSQL, Redis, MQTT (EMQX), MinIO.

### `k8s`

Kubernetes Helm charts for staging and production deployment.

### `nginx`

Reverse proxy — routes `/graphql` to NestJS, `/api/` to NestJS REST, `/auth/` to Spring Boot.

### `mqtt`

MQTT broker configuration (EMQX preferred, Mosquitto as alternative).

### `database`

Flyway migration scripts for PostgreSQL.

---

## Data Flow Design

### User Requests (Frontend → Data)

```text
Frontend
  ↓ GraphQL query/mutation
NestJS (GraphQL Resolver)
  ↓ REST call (internal)
Spring Boot (Controller → Service → Repository)
  ↓
PostgreSQL
```

### IoT Data (Device → System)

```text
Sensor / Device
  ↓ MQTT publish
MQTT Broker
  ↓ MQTT subscribe
NestJS (MQTT Handler)
  ↓ GraphQL subscription push / REST call
Frontend / PostgreSQL
```

### AI Analysis

```text
Frontend (GraphQL query: healthAnalysis)
  ↓
NestJS AI Service
  ├── Collect context (REST → Spring Boot → PostgreSQL)
  ├── Build prompt
  ├── Call LLM API
  └── Cache result (Redis)
  ↓
GraphQL response → Frontend
```

### SSO Authentication

```text
Frontend
  ↓ Redirect
SSO Provider (Keycloak / Auth0 / Casdoor / ...)
  ↓ OAuth2 Authorization Code
NestJS (SSO callback handler)
  ↓ REST (verify/create user)
Spring Boot (Identity service)
  ↓
PostgreSQL
  ↓
JWT issued → Frontend
```

---

## Architecture Principles

### 1. Prefer Modular Monolith

Each service is one application with multiple domain modules. Avoid splitting into microservices prematurely.

### 2. Do Not Split Microservices Early

Consider splitting only when there is a clear need for:

- Independent deployment cycles
- Independent scaling requirements
- Team collaboration boundaries

### 3. Do Not Share Databases

Services communicate through:

- GraphQL (frontend → NestJS)
- REST (NestJS → Spring Boot, service-to-service)
- Events / MQTT (asynchronous)

Each service owns its PostgreSQL schema. No cross-service direct database access.

### 4. Single Source of Truth

Identity, permissions, and core data have exactly one owning service (Spring Boot). Other services read via REST API, never via direct database access.

### 5. API Documentation is Mandatory

- All REST APIs must generate OpenAPI/Swagger documentation.
- GraphQL schema must be documented with descriptions and exported for codegen.

---

## Feature Domains

| Domain | Responsibility | API |
|--------|---------------|-----|
| Members | Family member profiles and relationships | GraphQL + REST |
| Health | Health records, monitoring, trends | GraphQL + REST |
| Goals | Goal setting, habit building, growth tracking | GraphQL + REST |
| Devices | IoT device registration, control, monitoring | GraphQL + REST + MQTT |
| Automation | Rule-based automation triggers and actions | GraphQL + REST |
| AI | Intelligent analysis, recommendations, Q&A | GraphQL |
| Archive | Photos, documents, important events | GraphQL + REST |
| Notifications | Multi-channel alerts | GraphQL + REST |
| Auth / SSO | Authentication, SSO, permissions | REST + OAuth2/OIDC |

Feature-specific designs are documented in [features/](./features/).

---

## Evolution Roadmap

### Phase 1 — Foundation

Core applications + PostgreSQL + MQTT broker + GraphQL API + JWT auth.

### Phase 2 — Enrichment

+ Redis (cache + sessions)
+ MinIO (object storage)
+ AI/LLM integration
+ SSO (OAuth2/OIDC) integration

### Phase 3 — Operations

+ Kubernetes + Helm
+ CI/CD pipelines
+ Monitoring (Prometheus + Grafana)
+ Log aggregation (ELK / Loki)

### Phase 4 — Scale

+ Dedicated IoT service
+ Dedicated notification service
+ Dedicated AI service
+ GraphQL federation (if needed)

Gradually evolve toward a microservice architecture when clear boundaries emerge.
