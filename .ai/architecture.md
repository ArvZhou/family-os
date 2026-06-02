# Family OS Architecture Guide

## Project Overview

Family OS is a digital management platform for household scenarios. It covers:

- Family member management
- Health records and monitoring
- Goals and growth system
- IoT smart device management
- Home automation
- AI assistant
- Family archive and records

The project uses a Monorepo architecture with React + Spring Boot + NestJS as the core stack.

## Overall Architecture

```text
React Web
  ↓
NestJS (business layer / IoT layer)
  ↓
Spring Boot (identity and core data layer)
  ↓
PostgreSQL
```

Device communication path:

```text
IoT Device
  ↓
MQTT Broker
  ↓
NestJS
```

## Repository Structure

```text
family-os/
├── apps/
│   ├── web/
│   ├── api-spring/
│   └── api-nest/
├── packages/
│   ├── shared-types/
│   ├── ui/
│   ├── utils/
│   └── config/
├── infra/
│   ├── docker/
│   ├── k8s/
│   ├── nginx/
│   ├── mqtt/
│   └── database/
├── docs/
├── tools/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Application Layer `apps`

`apps` contains all runnable applications.

### `web`

React frontend application.

```text
apps/web
├── src
│   ├── pages
│   ├── components
│   ├── hooks
│   ├── stores
│   ├── services
│   ├── layouts
│   └── routes
└── public
```

Responsibilities:

- User interface
- Data presentation
- Charts and dashboards
- IoT control interface

### `api-spring`

Spring Boot core data service.

```text
apps/api-spring
├── src/main/java/com/family
├── auth
├── member
├── permission
├── device
└── common
```

Responsibilities:

- `auth`: login, JWT, refresh token
- `member`: family member management
- `permission`: permission management
- `device`: device registration and metadata management

Spring is the system’s Single Source of Truth and owns:

- Users
- Permissions
- Base data

### `api-nest`

NestJS business service.

```text
apps/api-nest
├── src
├── modules
│   ├── health
│   ├── goal
│   ├── archive
│   ├── automation
│   ├── ai
│   ├── notification
│   └── iot
├── infrastructure
└── shared
```

Module responsibilities:

- `health`: blood pressure, blood sugar, weight, medical records
- `goal`: goal management, habit building, growth scoring
- `archive`: family events, photos, document records
- `automation`: automation rules and triggers
- `ai`: health analysis, goal suggestions, family Q&A
- `notification`: WeChat, email, app push
- `iot`: MQTT, device state, device control

Automation rule example:

```text
Kitchen temperature > 35°C
→ Turn on exhaust fan automatically
```

## Shared Packages `packages`

### `shared-types`

Unified type definitions.

```text
packages/shared-types
├── member
├── health
├── goal
└── device
```

Example:

```ts
export interface Member {
  id: string;
  name: string;
  birthday: string;
}
```

### `ui`

Shared React components.

```text
Button
Card
Table
Modal
Chart
```

### `utils`

Shared utility functions.

```text
date
number
validator
formatter
```

### `config`

Shared configuration.

```text
eslint
prettier
typescript
env
```

## Infrastructure `infra`

### `docker`

```text
infra/docker
├── postgres
├── redis
├── mqtt
├── spring
└── nest
```

### `k8s`

Future Kubernetes deployment manifests.

```text
infra/k8s
├── spring
├── nest
├── postgres
├── redis
└── mqtt
```

### `nginx`

Reverse proxy configuration.

```text
infra/nginx
```

### `mqtt`

MQTT broker configuration. Recommended options:

- EMQX
- Mosquitto

## Documentation `docs`

Project documentation directory:

```text
docs
├── architecture
├── api
├── deployment
├── mqtt
└── ai
```

## Data Flow Design

### User Requests

```text
React
  ↓
NestJS
  ↓
Spring
  ↓
PostgreSQL
```

### IoT Data

```text
Sensor
  ↓
MQTT
  ↓
NestJS
  ↓
PostgreSQL
```

### AI Analysis

```text
Health Data
  ↓
NestJS AI Module
  ↓
LLM
  ↓
Result
```

## Current Architecture Principles

### 1. Prefer Modular Monolith

Spring: one application, multiple modules.

Nest: one application, multiple modules.

### 2. Do Not Split Microservices Early

Consider splitting only when there is a need for:

- Independent deployment
- Independent scaling
- Team collaboration boundaries

### 3. Do Not Share Databases

Services communicate through:

- HTTP API
- Events
- MQTT

## Future Evolution Roadmap

### Phase 1

```text
React
Spring
Nest
PostgreSQL
MQTT
```

### Phase 2

```text
+ Redis
+ MinIO
+ AI Service
```

### Phase 3

```text
+ Kubernetes
+ CI/CD
+ Monitoring
```

### Phase 4

```text
+ IoT Service
+ Notification Service
+ AI Service
```

Gradually evolve toward a microservice architecture.