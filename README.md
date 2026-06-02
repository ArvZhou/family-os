# Family OS

A digital management platform for household scenarios.

<div align="center">

**Family members · Health records · Goals · IoT devices · Home automation · AI assistant · Family archives**

[Architecture](.ai/architecture.md) · [API Reference](.ai/api.md) · [Deployment](.ai/deployment.md) · [MQTT](.ai/mqtt.md) · [AI Service](.ai/ai-service.md)

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

## Tech Stack

```
React (Web UI)
  ↓
NestJS (Business layer / IoT layer / AI layer)
  ↓
Spring Boot (Identity & core data layer)
  ↓
PostgreSQL

Device → MQTT Broker (EMQX) → NestJS
```

### Infrastructure

- **Database:** PostgreSQL (UUID primary keys, Flyway migrations)
- **Cache / Session:** Redis
- **Messaging:** MQTT (EMQX or Mosquitto)
- **Object Storage:** MinIO
- **Containerization:** Docker Compose (local), Kubernetes (future)

## Repository Structure

```
family-os/
├── apps/                         # Runnable applications
│   ├── web/                      # React frontend
│   ├── api-spring/               # Spring Boot — identity & core data
│   └── api-nest/                 # NestJS — business, IoT, AI
├── packages/                     # Shared code
│   ├── shared-types/             # TypeScript type definitions
│   ├── ui/                       # Shared React components
│   ├── utils/                    # Shared utility functions
│   └── config/                   # ESLint, Prettier, TS configs
├── infra/                        # Infrastructure as code
│   ├── docker/                   # Docker Compose services
│   ├── k8s/                      # K8s manifests (planned)
│   ├── nginx/                    # Reverse proxy config
│   ├── mqtt/                     # MQTT broker config
│   └── database/                 # Database migration scripts
├── docs/                         # Project documentation
├── tools/                        # Dev utilities
└── .ai/                          # Architecture & design docs
```

## Quick Start

### Prerequisites

- Node.js 18+
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

| Document | Description |
|----------|-------------|
| [Architecture](.ai/architecture.md) | Overall system architecture and evolution roadmap |
| [Engineering Conventions](.ai/conventions.md) | Coding standards, naming, folder structure |
| [API Reference](.ai/api.md) | REST API endpoints and request/response formats |
| [Deployment Guide](.ai/deployment.md) | Docker Compose, Nginx, production checklist |
| [MQTT Design](.ai/mqtt.md) | Topics, message format, authentication |
| [AI Service](.ai/ai-service.md) | LLM integration, prompt design, caching |

Chinese versions available alongside each file (`*.zh.md`).

## Architecture Principles

1. **Prefer modular monolith** — One application, multiple modules per service.
2. **No microservices early on** — Split only when independent deploy/scale/team boundaries demand it.
3. **No shared databases** — Services communicate via HTTP API, events, or MQTT.
4. **Frontend never calls Spring directly** — All requests go through NestJS.
5. **TypeScript strict mode** — No `any` types.

## Contributing

If you're an AI agent working on this project, read [AGENTS.md](AGENTS.md) first.
