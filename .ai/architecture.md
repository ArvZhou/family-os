# System Architecture Standards

## Purpose

This document defines general system architecture principles. It describes architectural patterns and standards without prescribing specific technologies. For technology-specific standards, see:

- [Frontend Standards](./frontend.md) — Framework-agnostic frontend conventions
  - [Next.js Standards](./standards/frontend/nextjs.md) | [Nuxt.js Standards](./standards/frontend/nuxtjs.md)
- [Engineering Conventions](./conventions.md) — General engineering conventions
  - [NestJS Standards](./standards/backend/nestjs.md) | [Spring Boot Standards](./standards/backend/spring-boot.md)

---

## Overall Architecture

```text
Frontend (Web / Mobile)
  ↓
Application Layer (BFF / API Gateway)
  ↓
Domain Services (Identity, Business Logic, IoT, AI)
  ↓
Data Layer (Database, Cache, Object Storage)
```

Device communication path:

```text
IoT Device
  ↓
Message Broker (MQTT / AMQP)
  ↓
Application Layer
```

---

## Repository Structure (Monorepo)

```text
project/
├── apps/                    # Runnable applications
│   ├── web/                 # Frontend application
│   ├── api-gateway/         # Application layer / BFF
│   └── api-core/            # Data layer / identity service
├── packages/                # Reusable shared code
│   ├── shared-types/        # Type definitions
│   ├── ui/                  # Shared UI components
│   ├── utils/               # Utility functions
│   └── config/              # Shared configs (lint, format, ts)
├── infra/                   # Infrastructure as code
│   ├── docker/              # Docker Compose + Dockerfiles
│   ├── k8s/                 # Kubernetes / Helm charts
│   ├── nginx/               # Reverse proxy config
│   ├── broker/              # Message broker config
│   └── database/            # Database migration scripts
├── docs/                    # Project documentation
├── tools/                   # Dev utilities
├── package.json
├── workspace.yaml
└── README.md
```

---

## Application Layer (`apps`)

`apps` contains all runnable applications. Each application is independently deployable.

### Frontend Application

Responsibilities:

- User interface with SSR for SEO and fast initial load
- Data presentation (charts, dashboards, trends)
- IoT device control interface
- Multi-language support
- Multi-environment deployment

See [Frontend Standards](./frontend.md) for conventions.

### Application Layer Service (BFF)

Responsibilities:

- Business logic coordination
- IoT device communication (via message broker)
- AI/LLM integration
- Notifications and automation
- API aggregation for frontend

This layer is **not** a source of truth — it orchestrates calls to the data layer and external services.

### Data Layer Service (Identity / Core)

Responsibilities:

- Authentication and authorization
- User and permission management
- Core data ownership (members, devices, base records)

This service is the **single source of truth** for identity and core data. Other services communicate with it via HTTP API.

---

## Shared Packages (`packages`)

### `shared-types`

Unified type definitions shared across all applications and packages.

```ts
export interface Member {
  id: string;
  name: string;
  birthday: string;
}
```

**Rule**: packages must not contain business logic.

### `ui`

Shared UI components used across frontend applications.

### `utils`

Shared utility functions (date formatting, number formatting, validators).

### `config`

Shared configuration for ESLint, Prettier, TypeScript, and environment setup.

---

## Infrastructure (`infra`)

### `docker`

Docker Compose for local development. Each service has a multi-stage Dockerfile.

### `k8s`

Kubernetes deployment manifests with Helm charts for staging and production.

### `nginx`

Reverse proxy configuration for routing frontend, API, and auth requests.

### `broker`

Message broker configuration (MQTT / AMQP).

### `database`

Database migration scripts and seed data.

---

## Data Flow Design

### User Requests

```text
Frontend
  ↓
Application Layer
  ↓
Data Layer Service
  ↓
Database
```

### IoT Data

```text
Sensor / Device
  ↓
Message Broker
  ↓
Application Layer
  ↓
Database / Events
```

### AI Analysis

```text
User Request
  ↓
Application Layer (AI Module)
  ↓
LLM Provider
  ↓
Result (cached + stored)
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

- HTTP API (synchronous)
- Events / Message Broker (asynchronous)

Each service owns its database schema. No cross-service direct database access.

### 4. Single Source of Truth

Core data (identity, permissions, base records) has exactly one owning service. Other services read via API, never via direct database access.

---

## Feature Domains

The following domains are typical for a platform of this type:

| Domain | Responsibility |
|--------|---------------|
| Members | Family member profiles and relationships |
| Health | Health records, monitoring, trends |
| Goals | Goal setting, habit building, growth tracking |
| Devices | IoT device registration, control, monitoring |
| Automation | Rule-based automation triggers and actions |
| AI | Intelligent analysis, recommendations, Q&A |
| Archive | Photos, documents, important events |
| Notifications | Multi-channel alerts (push, email, messaging) |

Feature-specific designs are documented in [features/](./features/).

---

## Evolution Roadmap

### Phase 1 — Foundation

Core applications + database + message broker.

### Phase 2 — Enrichment

+ Cache layer (e.g., Redis)
+ Object storage (e.g., MinIO / S3)
+ AI/LLM integration

### Phase 3 — Operations

+ Container orchestration (Kubernetes)
+ CI/CD pipelines
+ Monitoring and alerting

### Phase 4 — Scale

+ Dedicated IoT service
+ Dedicated notification service
+ Dedicated AI service

Gradually evolve toward a microservice architecture when clear boundaries emerge.
