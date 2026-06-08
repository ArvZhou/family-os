# 12 — 多渠道通知

## 依赖

- [11-automation](./11-automation.md) — 自动化规则触发通知（也可独立触发）

## 用户可感知的交付

- 当健康阈值超标或设备异常时收到通知
- 通知可通过微信/邮件/App Push 发送（MVP 阶段只需一种渠道）
- 在通知历史页面查看已发送的通知

## API 设计 (GraphQL)

```graphql
type Mutation {
  sendNotification(input: SendNotificationInput!): NotificationResult!
}

enum NotificationChannel {
  WECHAT
  EMAIL
  APP_PUSH
}

input SendNotificationInput {
  memberIds: [ID!]!
  channel: NotificationChannel!
  title: String!
  body: String!
}

type NotificationResult {
  success: Boolean!
  sent: Int!
  failed: Int!
}
```

## 关键实现要点

- MVP 阶段优先实现 App Push（Web Push API）或 邮件（SMTP）
- 微信通知需要公众号/小程序接入，放后面
- 通知渠道使用 strategy pattern，方便切换/扩展
- 记录通知历史供查询

## 验收标准

- 调用 sendNotification，目标用户收到通知
- 通知历史正确记录
