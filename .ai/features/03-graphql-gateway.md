# 03 — GraphQL Gateway 搭建

## 依赖

- [01-auth](./01-auth.md) — 需要 Spring Boot 的认证端点
- [02-members](./02-members.md) — 需要 Spring Boot 的成员端点

## 用户可感知的交付

前端可以通过单一 GraphQL 端点 (`POST /graphql`) 查询和变更数据，不再直接调用 Spring Boot REST。GraphQL Playground 在开发环境可用来浏览 schema 和测试查询。

## 架构

```text
Frontend (Next.js)
  ↓ GraphQL (POST /graphql)
NestJS (family-service) — GraphQL Gateway
  ↓ REST (internal, http://identity-service:8080/api/v1/*)
Spring Boot (identity-service) — Identity & Core Data
```

NestJS 作为 BFF（Backend for Frontend），负责：

1. GraphQL schema 定义和 resolver 实现
2. 通过 HTTP 调用 Spring Boot REST，聚合数据
3. 认证转发 — 前端传 JWT，NestJS 原样带给 Spring Boot

## GraphQL Schema

### Auth

```graphql
type Mutation {
  login(input: LoginInput!): AuthPayload!
  refreshToken(input: RefreshTokenInput!): AuthPayload!
}

input LoginInput {
  username: String!
  password: String!
}

input RefreshTokenInput {
  refreshToken: String!
}

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  expiresIn: Int!
  user: User!
}
```

### Members

```graphql
type Query {
  members: [Member!]!
  member(id: ID!): Member
}

type Mutation {
  createMember(input: CreateMemberInput!): Member!
  updateMember(id: ID!, input: UpdateMemberInput!): Member!
  deleteMember(id: ID!): Boolean!
}

type Member {
  id: ID!
  name: String!
  birthday: Date!
  relation: Relation!
  avatarUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum Relation {
  SPOUSE
  PARENT
  CHILD
  SIBLING
  OTHER
}

input CreateMemberInput {
  name: String!
  birthday: Date!
  relation: Relation!
  avatarUrl: String
}

input UpdateMemberInput {
  name: String
  birthday: Date
  relation: Relation
  avatarUrl: String
}

type User {
  id: ID!
  name: String!
  email: String
}
```

### 自定义 Scalar

```graphql
scalar Date # ISO date string (yyyy-MM-dd)
scalar DateTime # ISO datetime string
```

## 关键实现要点

- **NestJS 项目**: `apps/family-service`，使用 `@nestjs/graphql` code-first 方式（`autoSchemaFile: schema.graphql`）
- **HTTP 调用**: 使用 `@nestjs/axios` 的 `HttpService` 调用 Spring Boot REST，Identity Service 地址通过 `IDENTITY_SERVICE_URL` 环境变量配置（默认 `http://localhost:8080`）
- **认证转发**: Resolver 通过 `@Context() ctx` 获取 `req.headers.authorization`，原样附加到对 Spring Boot 的 HTTP 请求头。无需验证 token——Spring Boot 负责验证
- **JWT 密钥**: 开发环境有默认值（`JWT_SECRET`/`JWT_REFRESH_SECRET`），生产环境必须覆盖
- **错误映射**: Spring Boot 返回的 401 → GraphQL UNAUTHENTICATED，404 → null（Query）/ GraphQL NOT_FOUND（Mutation 抛异常），400 → GraphQL BAD_REQUEST
- **Context 配置**: `GraphQLModule.forRoot({ context: ({ req }) => ({ req }) })` 使 resolver 能访问原始请求头
- **ValidationPipe**: 仅保留 `transform: true`，关闭 `whitelist` / `forbidNonWhitelisted`（GraphQL InputType 用 `@Field` 而非 `class-validator`）
- **Schema 导出**: 构建时自动生成 `schema.graphql` 供前端 codegen 使用

## 模块结构

```
apps/family-service/src/modules/
├── auth/
│   ├── auth.resolver.ts      # login, refreshToken mutations
│   ├── auth.service.ts       # HTTP → Spring Boot /api/v1/auth/*
│   ├── models/
│   │   ├── auth.model.ts     # AuthPayload, LoginInput, RefreshTokenInput
│   │   └── user.model.ts     # User ObjectType
│   └── auth.module.ts
├── member/
│   ├── member.resolver.ts    # members, member queries + CRUD mutations
│   ├── member.service.ts     # HTTP → Spring Boot /api/v1/members/*
│   ├── models/
│   │   └── member.model.ts   # Member, Relation enum, CreateMemberInput, UpdateMemberInput
│   └── member.module.ts
└── common/                   # (后续 DataLoader, guards 放这里)
```

## 验收标准

```bash
# 1. Playground 可访问
curl http://localhost:4000/graphql
# 期望: 200 (GraphQL Playground HTML)

# 2. 登录
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: {username:\"test\", password:\"Test1234\"}) { accessToken user { id name } } }"}'
# 期望: 200, 返回 accessToken + user

# 3. 获取成员列表（带 token）
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query":"{ members { id name birthday relation } }"}'
# 期望: 200, 返回成员数组

# 4. 未认证访问
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ members { id name } }"}'
# 期望: 200, errors 数组含 UNAUTHORIZED
```
