# 11 — 自动化规则

## 依赖

- [08-mqtt-integration](./08-mqtt-integration.md) — 设备事件触发
- [05-health-records](./05-health-records.md) — 健康阈值触发
- [10-ai-services](./10-ai-services.md) — AI 可以建议规则（可选）

## 用户可感知的交付

- 创建"当温度 > 30°C 时，发送通知"的规则
- 规则自动触发，无需手动干预
- 可以启用/禁用规则

## 数据模型

**服务**: NestJS (family-service)

**表**: `automation_rules`

| 列                | 类型      | 说明                                                |
| ----------------- | --------- | --------------------------------------------------- |
| id                | UUID      | 主键                                                |
| name              | VARCHAR   | 规则名称                                            |
| enabled           | BOOLEAN   | 是否启用                                            |
| trigger_type      | VARCHAR   | DEVICE_EVENT / SCHEDULE / HEALTH_THRESHOLD          |
| trigger_condition | JSONB     | 触发条件                                            |
| action_type       | VARCHAR   | CONTROL_DEVICE / SEND_NOTIFICATION / EXECUTE_SCRIPT |
| action_target     | VARCHAR   | 动作目标                                            |
| action_params     | JSONB     | 动作参数                                            |
| created_at        | TIMESTAMP |                                                     |
| updated_at        | TIMESTAMP |                                                     |

## API 设计 (GraphQL)

```graphql
type Query {
  automationRules(first: Int, after: String): AutomationRuleConnection!
  automationRule(id: ID!): AutomationRule
}

type Mutation {
  createAutomationRule(input: CreateAutomationRuleInput!): AutomationRule!
  updateAutomationRule(id: ID!, input: UpdateAutomationRuleInput!): AutomationRule!
  deleteAutomationRule(id: ID!): Boolean!
  toggleAutomationRule(id: ID!, enabled: Boolean!): AutomationRule!
}
```

## 关键实现要点

- NestJS 事件驱动：MQTT handler / health record created → emit event → automation engine 匹配规则 → 执行动作
- 定时规则使用 `@nestjs/schedule` (cron)
- 规则引擎使用简单匹配，非复杂规则引擎（避免引入 Drools 等重框架）

## 验收标准

- 创建一个设备事件规则，模拟 MQTT 数据触发，验证动作执行
- 禁用规则后不再触发
