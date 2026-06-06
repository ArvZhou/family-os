# Family OS 工程规范

## 目的

本文档定义了所有参与 Family OS 的 AI Agent 和贡献者应遵循的工程规范。

除非有明确说明，否则所有生成的代码都应遵循这些规范。

## 核心原则

### 1. 优先模块化单体

当前架构：

```text
React
↓
NestJS
↓
Spring Boot
↓
PostgreSQL
```

优先采用模块化单体，而不是微服务。

建议：

- 保持清晰的领域边界
- 在内部拆分模块
- 保持部署简单

避免：

- 过早拆分服务
- 不必要的分布式事务
- 复杂的服务网格架构

### 2. 以领域为中心组织代码

按照功能或领域来组织代码。

推荐：

```text
health/
goal/
member/
device/
```

不推荐：

```text
controllers/
services/
repositories/
```

### 3. 单一职责

每个模块只负责一个业务能力。

示例：

- 健康
- 目标
- 档案
- 设备
- 自动化

避免大型通用业务模块。

### 4. 显式边界

模块之间通过以下方式通信：

- 公共服务
- 事件
- API

避免：

- 深层跨模块导入
- 共享可变状态

## Monorepo 规范

仓库结构：

```text
apps/
packages/
infra/
docs/
.ai/
```

### `apps`

可运行应用。

```text
apps/web
apps/api-spring
apps/api-nest
```

### `packages`

可复用的共享代码。

```text
shared-types
ui
utils
config
```

`packages` 中不得包含业务逻辑。

## 前端规范

框架：

```text
React
TypeScript
```

推荐结构：

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

### 以特性为先

推荐：

```text
features/health
features/device
features/member
```

而不是：

```text
components/health
components/device
```

### 状态管理

优先级顺序：

1. React Query
2. Zustand

仅在复杂度确实需要时使用 Redux。

### API 访问

不要让 UI 直接调用 Spring Boot。

推荐请求流：

```text
React
↓
NestJS
↓
Spring
```

NestJS 是面向前端请求的应用层。

## NestJS 规范

角色：

```text
业务层
IoT 层
AI 层
```

NestJS 不是事实来源。

### 模块结构

每个功能模块应保持清晰结构：

```text
health/
├── controllers
├── services
├── dto
├── entities
├── events
└── health.module.ts
```

### 命名

```text
HealthController
HealthService
CreateHealthDto
HealthEntity
```

### 事件驱动设计

以下场景优先使用事件：

- 设备状态更新
- 通知发送
- 自动化触发

示例：

```text
HealthRecordedEvent
DeviceOnlineEvent
GoalCompletedEvent
```

### MQTT

所有设备通信都应通过 MQTT。

避免设备直接写数据库。

## Spring Boot 规范

角色：

```text
身份
权限
核心数据
```

Spring 是事实来源。

### 包结构

使用基于功能的包结构。

```text
member
auth
device
permission
```

避免先按技术层划分包。

### 分层结构

每个功能内部建议保持以下分层：

```text
controller
service
repository
entity
dto
```

示例：

```text
member/
├── controller
├── service
├── repository
├── entity
└── dto
```

### 数据库所有权

只有 Spring 负责以下数据：

- 用户
- 权限
- 设备注册信息

避免由 NestJS 直接修改这些数据。

## 数据库规范

数据库：

```text
PostgreSQL
```

### 迁移

Spring Boot 迁移使用 Flyway。

### 命名

表：

```text
member
health_record
goal
device
```

字段：

```text
snake_case
```

示例：

```text
created_at
updated_at
member_id
```

### 主键

优先使用 UUID。

避免使用自增 ID，以保证分布式兼容性。

## API 规范

风格：

```text
REST
```

### 资源命名

推荐：

```text
/api/members
/api/health-records
/api/goals
```

不推荐：

```text
/api/getMember
/api/createGoal
```

### 版本控制

所有 API 都应带版本号。

示例：

```text
/api/v1/members
```

## 事件命名

格式：

```text
<Entity><Action>Event
```

示例：

```text
MemberCreatedEvent
HealthRecordedEvent
DeviceOfflineEvent
```

## 基础设施规范

### 本地开发

本地开发使用 Docker Compose。

### 生产环境

按需要在生产环境使用 Kubernetes。

### MQTT Broker

推荐：

```text
EMQX
```

可选：

```text
Mosquitto
```

### 对象存储

推荐：

```text
MinIO
```

适用于：

- 照片
- 文档
- 档案

## 日志规范

使用结构化日志。

在可用时应包含以下字段：

- `request_id`
- `member_id`
- `device_id`

生产代码中避免使用 `console.log` 和 `System.out.println`。

## 测试规范

优先级顺序：

1. 单元测试
2. 集成测试
3. E2E 测试

重点关注：

- 领域逻辑
- 自动化规则
- 健康计算

## AI Agent 指令

生成代码时：

1. 遵循以特性为先的组织方式。
2. 优先采用模块化单体设计。
3. 不要引入微服务。
4. 不要让前端绕过 NestJS。
5. 不要让身份数据绕过 Spring。
6. 使用 TypeScript 严格模式。
7. 遵循 PostgreSQL 规范。
8. 优先考虑可维护性，而不是过度抽象。
9. 保持架构简单。
10. 优化长期可扩展性。