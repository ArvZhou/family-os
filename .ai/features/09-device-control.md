# 09 — 设备控制 + GraphQL 订阅

## 依赖

- [08-mqtt-integration](./08-mqtt-integration.md) — MQTT 通信就绪

## 用户可感知的交付

- 从设备详情页发送控制指令（如"打开灯"、"关闭窗帘"）
- 设备状态变化实时推送到前端（无需刷新页面）

## API 设计 (GraphQL)

```graphql
type Mutation {
  sendDeviceCommand(deviceId: ID!, input: DeviceCommandInput!): DeviceCommandResult!
}

type Subscription {
  deviceStatusChanged(deviceId: ID): DeviceStatusEvent!
  deviceTelemetry(deviceId: ID!): TelemetryEvent!
}
```

## 关键实现要点

- `sendDeviceCommand` → NestJS 发布 MQTT 消息到 `device/{deviceId}/command`
- GraphQL Subscription 通过 WebSocket 推送（`graphql-ws` 协议）
- Subscription 的 trigger 来自 MQTT 消息处理回调
- 指令需要 `correlationId` 用于追踪执行结果

## 验收标准

- 发送指令后 MQTT broker 收到消息（用 `mosquitto_sub` 验证）
- 设备状态变化时前端实时更新（WebSocket）
