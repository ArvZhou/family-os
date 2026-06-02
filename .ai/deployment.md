# Family OS Deployment Guide

## Local Development

Use Docker Compose for local development environment.

```bash
docker compose up -d postgres redis mqtt minio
cd apps/web && pnpm install && pnpm dev
```

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Java 21+ (for Spring Boot)
- pnpm 9+

---

## Environment Variables

### .env.local

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=family_os
DB_USER=family_user
DB_PASSWORD=<secret>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# JWT
JWT_SECRET=<generate strong secret>
JWT_REFRESH_SECRET=<generate strong refresh secret>

# AI / LLM
LLM_API_KEY=<provider key>
LLM_MODEL=gpt-4o
LLM_BASE_URL=<optional proxy>
```

---

## Services

### PostgreSQL

Port: `5432`

```yaml
POSTGRES_DB=family_os
POSTGRES_USER=family_user
POSTGRES_PASSWORD=<secret>
```

### Redis

Port: `6379`

Used for caching, session storage, rate limiting.

### MQTT Broker (EMQX)

Port: `1883` (MQTT), `18083` (Dashboard)

Topic structure:

| Topic | Description |
|-------|-------------|
| `device/+/status` | Device status updates |
| `device/+/telemetry` | Device telemetry data |
| `device/+/command` | Commands sent to devices |
| `automation/+/trigger` | Automation trigger events |

### MinIO

Port: `9000` (API), `9001` (Console)

Buckets:

| Bucket | Purpose |
|--------|---------|
| `family-photos` | Photo archives |
| `family-docs` | Document storage |
| `device-data` | Temporary device cache |

---

## Docker Compose Example

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: family_os
      POSTGRES_USER: family_user
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
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
```

---

## Build

### Frontend

```bash
pnpm install
pnpm build
```

### Spring Boot

```bash
./mvnw clean package -DskipTests
java -jar apps/api-spring/target/api-spring.jar
```

### NestJS

```bash
pnpm build:api-nest
node apps/api-nest/dist/main.js
```

---

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name example.com;

    location /api/ {
        proxy_pass http://nestjs:3000;
    }

    location /auth/ {
        proxy_pass http://springboot:8080;
    }

    location / {
        proxy_pass http://web:3000;
    }
}
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set strong secrets for JWT
- [ ] Enable HTTPS
- [ ] Configure log aggregation (ELK/Loki)
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure database backups
- [ ] Configure MinIO backups
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Test recovery procedures
