# 05 — 健康记录

## 依赖

- [03-graphql-gateway](./03-graphql-gateway.md) — GraphQL 端点
- [04-frontend-shell](./04-frontend-shell.md) — 前端壳

## 用户可感知的交付

- 在成员详情页看到"健康记录"标签
- 手动录入血压、血糖、体重、体温
- 查看历史记录列表和简单趋势图
- 按时间范围筛选

## 数据模型

**服务**: NestJS (family-service)，数据库由 NestJS 管理

**表**: `health_records`

| 列          | 类型      | 说明                                               |
| ----------- | --------- | -------------------------------------------------- |
| id          | UUID      | 主键                                               |
| member_id   | UUID      | 关联 members 表                                    |
| type        | VARCHAR   | HEALTH_METRIC 枚举                                 |
| values      | JSONB     | 结构化数值（如 `{"systolic":120,"diastolic":80}`） |
| recorded_at | TIMESTAMP | 记录时间                                           |
| created_at  | TIMESTAMP | 创建时间                                           |

## API 设计 (GraphQL)

```graphql
type Query {
  healthRecords(
    memberId: ID!
    type: HealthRecordType
    first: Int
    after: String
  ): HealthRecordConnection!
  healthTrend(memberId: ID!, type: HealthRecordType!, period: TrendPeriod!): HealthTrend!
}

type Mutation {
  createHealthRecord(input: CreateHealthRecordInput!): HealthRecord!
}
```

## 关键实现要点

- NestJS 连接自己的 PostgreSQL schema（不与 Spring Boot 共享表）
- `member_id` 引用 Spring Boot 的 members 表（应用层关联，非数据库外键）
- 趋势计算在 NestJS 服务层完成（SQL 聚合 + 应用层计算）
- 预留 DataLoader 避免 N+1（member → healthRecords）

## 验收标准

- 录入一条血压记录，能在列表中看到
- 30 天趋势图正确显示数据点
- 选择不存在的 member_id 返回友好的错误信息
