# Deployment Standards

## Purpose

This document defines general deployment standards. Specific build and deploy details for each framework are in their respective standards files:

- [Next.js Standards](./standards/frontend/nextjs.md) — Docker + Helm for Next.js
- [Nuxt.js Standards](./standards/frontend/nuxtjs.md) — Docker + Helm for Nuxt.js
- [NestJS Standards](./standards/backend/nestjs.md) — NestJS deployment conventions
- [Spring Boot Standards](./standards/backend/spring-boot.md) — Spring Boot deployment conventions
- [Terraform Standards](./standards/infra/terraform.md) — Cloud infrastructure as code (IaC)

---

## Environment Strategy

Support three deployment environments:

| Environment | Purpose | Characteristics |
|-------------|---------|-----------------|
| **Development** | Local dev, feature branches | Local infrastructure, hot reload |
| **Staging** | Pre-release QA, integration testing | Production-like config, test data |
| **Production** | Live user-facing environment | Real data, high availability |

Each service reads its environment config from env-specific files. Never hardcode environment-specific values in source code.

---

## Local Development

Use Docker Compose (or equivalent) to run infrastructure services locally.

### Prerequisites

- Docker & Docker Compose
- Language-specific toolchains (Node.js, JDK, etc.)
- Package manager (pnpm, npm, yarn)

### Workflow

```bash
# Start infrastructure
docker compose -f infra/docker/docker-compose.yml up -d

# Run database migrations
# (framework-specific migration command)

# Start application services
# (framework-specific dev commands)
```

---

## Environment Variables

### Template (`.env.example`)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=<project_name>
DB_USER=<user>
DB_PASSWORD=<secret>

# Cache
CACHE_HOST=localhost
CACHE_PORT=6379

# Message Broker
BROKER_URL=mqtt://localhost:1883

# Object Storage
STORAGE_ENDPOINT=localhost:9000
STORAGE_ACCESS_KEY=<key>
STORAGE_SECRET_KEY=<secret>

# Authentication
JWT_SECRET=<generate strong secret>
JWT_REFRESH_SECRET=<generate strong refresh secret>

# AI / LLM
LLM_API_KEY=<provider key>
LLM_MODEL=<model name>
LLM_BASE_URL=<optional proxy>
```

### Rules

- Never commit real secrets to `.env` files — use `.env.example` as a template.
- Each environment has its own `.env.<environment>` file.
- Use a schema validation library to validate environment variables at startup.

---

## Infrastructure Services

### Database

Port: standard (e.g., `5432` for PostgreSQL)

Used for persistent data storage. Each service may have its own schema or database.

### Cache

Port: standard (e.g., `6379` for Redis)

Used for caching, session storage, rate limiting.

### Message Broker

Port: standard (e.g., `1883` for MQTT, `5672` for AMQP)

Used for IoT device communication and event-driven architecture.

### Object Storage

Port: standard (e.g., `9000` for MinIO / S3)

Used for photos, documents, archives.

---

## Docker Compose Example

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mqtt:
    image: emqx/emqx:latest
    ports:
      - "1883:1883"
      - "18083:18083"

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${STORAGE_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${STORAGE_SECRET_KEY}
```

---

## Docker Builds

All services use **multi-stage Docker builds** for minimal production images.

### General Pattern

```dockerfile
# Stage 1: Install dependencies
FROM <base-image> AS deps
WORKDIR /app
COPY <dependency-files> ./
RUN <install-command>

# Stage 2: Build
FROM <base-image> AS builder
WORKDIR /app
COPY --from=deps /app/<deps-dir> ./<deps-dir>
COPY . .
RUN <build-command>

# Stage 3: Production runtime
FROM <minimal-base-image> AS runner
WORKDIR /app
ENV <ENV>=production
COPY --from=builder /app/<build-output> ./<build-output>
EXPOSE <port>
CMD ["<start-command>"]
```

### Principles

- **Separate dependency installation** from build (cached layer).
- **Minimal production image** — only include build output, not source or dev dependencies.
- **Tag per environment**: `<project>-<service>:dev`, `<project>-<service>:staging`, `<project>-<service>:prod`.

Framework-specific Dockerfiles are documented in their respective standards files.

---

## Kubernetes Deployment (Helm)

### Chart Structure

```
infra/k8s/charts/
├── <frontend>/
│   ├── Chart.yaml
│   ├── values.yaml              # Default values
│   ├── values-dev.yaml          # Dev overrides
│   ├── values-staging.yaml      # Staging overrides
│   ├── values-prod.yaml         # Production overrides
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       ├── ingress.yaml
│       └── _helpers.tpl
├── <backend-gateway>/
│   └── ...
└── <backend-core>/
    └── ...
```

### Per-Environment Values

Each environment has its own values file overriding:

- **Replica count**: 1 for dev, 3+ for production.
- **Image tag**: per-environment tag.
- **Environment variables**: per-environment API URLs and config.
- **Ingress**: per-environment host and TLS settings.

### Deploy

```bash
# Dev
helm upgrade --install <service> ./infra/k8s/charts/<service> \
  -f ./infra/k8s/charts/<service>/values-dev.yaml

# Production
helm upgrade --install <service> ./infra/k8s/charts/<service> \
  -f ./infra/k8s/charts/<service>/values-prod.yaml
```

Build tools (Docker CLI, kaniko, buildpacks, CI pipeline) are intentionally left open — the Helm chart only references the final image `registry/repo:tag`.

---

## Reverse Proxy

Use a reverse proxy (e.g., Nginx, Traefik, Caddy) to route requests:

```nginx
server {
    listen 80;
    server_name example.com;

    location /api/ {
        proxy_pass http://<backend-gateway>:<port>;
    }

    location /auth/ {
        proxy_pass http://<backend-core>:<port>;
    }

    location / {
        proxy_pass http://<frontend>:<port>;
    }
}
```

---

## Production Checklist

- [ ] Set production environment mode
- [ ] Set strong secrets for authentication
- [ ] Enable HTTPS / TLS
- [ ] Configure log aggregation (ELK / Loki / CloudWatch)
- [ ] Set up monitoring (Prometheus + Grafana / Datadog)
- [ ] Configure database backups and retention
- [ ] Configure object storage backups
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Test recovery procedures
- [ ] Configure rate limiting
- [ ] Set up alerting for critical metrics
