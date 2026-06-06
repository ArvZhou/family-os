# Family OS 架构指南

## 项目概览

Family OS 是一个面向家庭场景的数字化管理平台，覆盖以下能力：

- 家庭成员管理
- 健康档案与监测
- 目标与成长系统
- IoT 智能设备管理
- 家庭自动化
- AI 助手
- 家庭档案与记录

项目采用 Monorepo 管理模式，核心技术栈为 React + Spring Boot + NestJS。

## 总体架构

```text
React Web
  ↓
NestJS（业务层 / IoT 层）
  ↓
Spring Boot（身份与核心数据层）
  ↓
PostgreSQL
```

设备通信链路：

```text
IoT Device
  ↓
MQTT Broker
  ↓
NestJS
```

## 仓库结构

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
│   ├── terraform/
│   ├── nginx/
│   ├── mqtt/
│   └── database/
├── docs/
├── tools/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 应用层 `apps`

`apps` 用于存放所有可运行应用。

### `web`

React 前端应用。

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

职责：

- 用户界面
- 数据展示
- 图表与仪表盘
- IoT 控制界面

### `api-spring`

Spring Boot 核心数据服务。

```text
apps/api-spring
├── src/main/java/com/family
├── auth
├── member
├── permission
├── device
└── common
```

职责：

- `auth`：登录、JWT、Refresh Token
- `member`：家庭成员管理
- `permission`：权限管理
- `device`：设备注册与设备元数据管理

Spring 是系统的 Single Source of Truth，负责：

- 用户
- 权限
- 基础数据

### `api-nest`

NestJS 业务服务。

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

模块职责：

- `health`：血压、血糖、体重、医疗记录
- `goal`：目标管理、习惯养成、成长评分
- `archive`：家庭事件、照片、文件记录
- `automation`：自动化规则与联动
- `ai`：健康分析、目标建议、家庭问答
- `notification`：微信、邮件、App 推送
- `iot`：MQTT、设备状态、设备控制

自动化规则示例：

```text
厨房温度 > 35℃
→ 自动开启排风
```

## 公共包 `packages`

### `shared-types`

统一类型定义。

```text
packages/shared-types
├── member
├── health
├── goal
└── device
```

示例：

```ts
export interface Member {
  id: string;
  name: string;
  birthday: string;
}
```

### `ui`

公共 React 组件。

```text
Button
Card
Table
Modal
Chart
```

### `utils`

公共工具函数。

```text
date
number
validator
formatter
```

### `config`

统一配置。

```text
eslint
prettier
typescript
env
```

## 基础设施 `infra`

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

Kubernetes Helm Charts 部署文件。

```text
infra/k8s
├── family-portal
├── family-service
└── identity-service
```

### `terraform`

雲端基礎設施即代碼（IaC）。詳見 [Terraform 標準](../standards/infra/terraform.md)。

```text
infra/terraform
├── modules
│   ├── networking
│   ├── database
│   ├── kubernetes
│   ├── redis
│   ├── storage
│   ├── dns
│   └── iam
└── environments
    ├── dev
    ├── staging
    └── prod
```

### `nginx`

反向代理配置。

```text
infra/nginx
```

### `mqtt`

MQTT Broker 配置，推荐：

- EMQX
- Mosquitto

## 文档 `docs`

项目文档目录：

```text
docs
├── architecture
├── api
├── deployment
├── mqtt
└── ai
```

## 数据流设计

### 用户请求

```text
React
  ↓
NestJS
  ↓
Spring
  ↓
PostgreSQL
```

### IoT 数据

```text
Sensor
  ↓
MQTT
  ↓
NestJS
  ↓
PostgreSQL
```

### AI 分析

```text
Health Data
  ↓
NestJS AI Module
  ↓
LLM
  ↓
Result
```

## 当前阶段架构原则

### 1. 优先 Modular Monolith

Spring：一个应用，多个模块。

Nest：一个应用，多个模块。

### 2. 不提前拆微服务

仅在以下情况考虑拆分：

- 独立部署需求
- 独立扩容需求
- 团队协作需求

### 3. 不共享数据库

系统间通过以下方式通信：

- HTTP API
- Event
- MQTT

## 未来演进路线

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

逐步完成微服务化演进。
