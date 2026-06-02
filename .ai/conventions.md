# Family OS Engineering Conventions

## Purpose

This document defines the engineering conventions for all AI agents and contributors working on Family OS.
10. Optimize for long-term extensibility.
## apps

Runnable applications.

```text
apps/web
apps/api-spring
apps/api-nest
```

---

## packages

Reusable shared code.

```text
shared-types
ui
utils
config
```

Packages must not contain business logic.

---

# Frontend Conventions

Framework:

```text
React
TypeScript
```

Recommended:

```text
src/
├── features/
├── components/
├── hooks/
├── services/
├── routes/
├── layouts/
└── pages/
```

---

## Feature First

Prefer:

```text
features/health
features/device
features/member
```

instead of:

```text
components/health
components/device
```

---

## State Management

Preferred order:

1. React Query
2. Zustand

Avoid Redux unless complexity requires it.

---

## API Access

Never call Spring Boot directly from UI.

Preferred:

```text
React
↓
NestJS
↓
Spring
```

NestJS acts as application layer.

---

# NestJS Conventions

Role:

```text
Business Layer
IoT Layer
AI Layer
```

NestJS is not the source of truth.

---

## Module Structure

Each feature:

```text
health/
├── controllers
├── services
├── dto
├── entities
├── events
└── health.module.ts
```

---

## Naming

```text
HealthController
HealthService
CreateHealthDto
HealthEntity
```

---

## Event Driven

Prefer events for:

* Device status updates
* Notifications
* Automation triggers

Examples:

```text
HealthRecordedEvent
DeviceOnlineEvent
GoalCompletedEvent
```

---

## MQTT

All device communication should go through MQTT.

Avoid direct device-to-database communication.

---

# Spring Boot Conventions

Role:

```text
Identity
Permissions
Core Data
```

Spring is the source of truth.

---

## Package Structure

Feature based.

```text
member
auth
device
permission
```

Avoid technical-layer-first packages.

---

## Layer Structure

```text
controller
service
repository
entity
dto
```

inside each feature.

Example:

```text
member/
├── controller
├── service
├── repository
├── entity
└── dto
```

---

## Database Access

Only Spring owns:

* User
* Permission
* Device registry

Avoid direct modification from NestJS.

---

# Database Conventions

Database:

```text
PostgreSQL
```

---

## Migration

Use:

```text
Flyway
```

for Spring Boot.

---

## Naming

Tables:

```text
member
health_record
goal
device
```

Columns:

```text
snake_case
```

Examples:

```text
created_at
updated_at
member_id
```

---

## Primary Keys

Preferred:

```text
UUID
```

Avoid auto increment IDs for distributed compatibility.

---

# API Conventions

Style:

```text
REST
```

---

## Resource Naming

Good:

```text
/api/members
/api/health-records
/api/goals
```

Bad:

```text
/api/getMember
/api/createGoal
```

---

## Versioning

All APIs should be versioned.

Example:

```text
/api/v1/members
```

---

# Event Naming

Format:

```text
<Entity><Action>Event
```

Examples:

```text
MemberCreatedEvent
HealthRecordedEvent
DeviceOfflineEvent
```

---

# Infrastructure Conventions

Containers:

```text
Docker Compose
```

for local development.

---

Future:

```text
Kubernetes
```

for production.

---

## MQTT Broker

Preferred:

```text
EMQX
```

Alternative:

```text
Mosquitto
```

---

## Object Storage

Preferred:

```text
MinIO
```

for:

* Photos
* Documents
* Archives

---

# Logging

Use structured logs.

Include:

```text
request_id
member_id
device_id
```

when available.

Avoid:

```text
console.log
System.out.println
```

in production code.

---

# Testing

Preferred order:

1. Unit Test
2. Integration Test
3. E2E Test

Focus on:

* Domain logic
* Automation rules
* Health calculations

---

# AI Agent Instructions

When generating code:

1. Follow feature-first organization.
2. Prefer modular monolith design.
3. Do not introduce microservices.
4. Do not bypass NestJS from frontend.
5. Do not bypass Spring for identity data.
6. Use TypeScript strict mode.
7. Use PostgreSQL conventions.
8. Prefer maintainability over abstraction.
9. Keep architecture simple.
10. Optimize for long-term extensibility.

```
```
