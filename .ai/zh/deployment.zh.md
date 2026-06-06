# Family OS Deployment Guide (中文)

## 本地开发环境

使用 Docker Compose 搭建本地开发环境。

```bash
docker compose up -d postgres redis mqtt minio
cd apps/web && pnpm install && pnpm dev
```

### 前置依赖

- Docker & Docker Compose
- Node.js 18+
- Java 21+（Spring Boot）
- pnpm 9+

---

## 环境变量

### .env.local

```bash
# 数据库
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
JWT_SECRET=<生成强密钥>
JWT_REFRESH_SECRET=<生成强刷新密钥>

# AI / LLM
LLM_API_KEY=<提供商密钥>
LLM_MODEL=gpt-4o
LLM_BASE_URL=<可选代理地址>
```

---

## 服务说明

### PostgreSQL

端口：`5432`

```yaml
POSTGRES_DB=family_os
POSTGRES_USER=family_user
POSTGRES_PASSWORD=<secret>
```

### Redis

端口：`6379`

用于缓存、会话存储和限流。

### MQTT 代理（EMQX）

端口：`1883`（MQTT）、`18083`（管理后台）

主题结构：

| 主题 | 说明 |
|------|------|
| `device/+/status` | 设备状态更新 |
| `device/+/telemetry` | 设备遥测数据 |
| `device/+/command` | 下发设备的指令 |
| `automation/+/trigger` | 自动化触发事件 |

### MinIO

端口：`9000`（API）、`9001`（控制台）

存储桶：

| 存储桶 | 用途 |
|--------|------|
| `family-photos` | 照片归档 |
| `family-docs` | 文档存储 |
| `device-data` | 设备临时缓存 |

---

## Docker Compose 示例

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

## 构建部署

### 前端

```bash
pnpm install
pnpm build
```

### Spring Boot

```bash
./gradlew bootJar -x test
java -jar apps/identity-service/build/libs/identity-service.jar
```

### NestJS

```bash
pnpm build:api-nest
node apps/api-nest/dist/main.js
```

---

## Nginx 配置示例

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

## 雲端基礎設施 (Terraform)

雲端基礎設施通過 Terraform 配置管理。詳見 [Terraform 標準](../standards/infra/terraform.md)。

```bash
# 初始化
cd infra/terraform/environments/dev
terraform init

# 計劃
terraform plan -var-file="terraform.tfvars"

# 執行
terraform apply

# 銷毀（僅限 dev！）
terraform destroy
```

Terraform 負責管理的資源：
- VPC、子網、NAT 網關
- PostgreSQL 數據庫 (RDS)
- Redis 緩存 (ElastiCache)
- Kubernetes 集群 (EKS)
- S3 對象存儲
- Route 53 DNS 與 ACM SSL 證書

---

## 生产环境检查清单

- [ ] 设置 `NODE_ENV=production`
- [ ] 为 JWT 设置强密钥
- [ ] 启用 HTTPS
- [ ] 配置日志聚合（ELK/Loki）
- [ ] 设置监控（Prometheus + Grafana）
- [ ] 配置数据库备份策略
- [ ] 配置 MinIO 备份策略
- [ ] 配置 SSL 证书
- [ ] 配置防火墙规则
- [ ] 测试恢复流程
