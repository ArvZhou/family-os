# 06 — 目标管理

## 依赖

- [05-health-records](./05-health-records.md) — 同属 NestJS 业务层

## 用户可感知的交付

- 为家庭成员设定目标（如"每天走 8000 步"、"减重 2kg"）
- 查看目标进度（百分比 + 当前值）
- 目标到期自动标记为过期

## 数据模型

**服务**: NestJS (family-service)

**表**: `goals`

| 列            | 类型      | 说明                              |
| ------------- | --------- | --------------------------------- |
| id            | UUID      | 主键                              |
| member_id     | UUID      | 关联成员                          |
| title         | VARCHAR   | 目标标题                          |
| type          | VARCHAR   | DAILY / WEEKLY / MONTHLY / CUSTOM |
| target_value  | NUMERIC   | 目标值                            |
| current_value | NUMERIC   | 当前进度                          |
| unit          | VARCHAR   | 单位（步、kg、次）                |
| start_date    | DATE      | 开始日期                          |
| end_date      | DATE      | 结束日期                          |
| status        | VARCHAR   | ACTIVE / COMPLETED / EXPIRED      |
| created_at    | TIMESTAMP |                                   |
| updated_at    | TIMESTAMP |                                   |

## API 设计 (GraphQL)

```graphql
type Query {
  goals(
    memberId: ID
    type: GoalType
    status: GoalStatus
    first: Int
    after: String
  ): GoalConnection!
  goal(id: ID!): Goal
}

type Mutation {
  createGoal(input: CreateGoalInput!): Goal!
  updateGoalProgress(id: ID!, input: UpdateGoalProgressInput!): Goal!
  deleteGoal(id: ID!): Boolean!
}
```

## 关键实现要点

- 进度百分比 `progress` 是计算字段（current / target \* 100）
- 定时任务（cron）检查 `end_date < today AND status = ACTIVE` → 自动设为 EXPIRED
- 更新进度时如果 `current_value >= target_value`，自动标记 COMPLETED

## 验收标准

- 创建一个周目标，能看到进度条
- 更新进度后百分比正确变化
- 过期目标自动标记为 EXPIRED
