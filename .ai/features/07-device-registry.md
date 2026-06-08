# 07 — 设备注册与状态管理

## 依赖

- [03-graphql-gateway](./03-graphql-gateway.md)
- [04-frontend-shell](./04-frontend-shell.md)

## 用户可感知的交付

- 在"设备"页面注册一个新 IoT 设备（如温度传感器）
- 查看已注册设备列表及其在线/离线状态
- 设备详情页显示最后在线时间

## 数据模型

**服务**: Spring Boot (identity-service)

**表**: `devices` (已存在)

| 列           | 类型      | 说明                               |
| ------------ | --------- | ---------------------------------- |
| id           | UUID      | 主键                               |
| device_id    | VARCHAR   | 设备唯一标识（来自设备端）         |
| name         | VARCHAR   | 设备名称                           |
| device_type  | VARCHAR   | SENSOR / ACTUATOR / CAMERA / OTHER |
| protocol     | VARCHAR   | 通信协议（mqtt）                   |
| status       | VARCHAR   | ONLINE / OFFLINE / ERROR           |
| last_seen_at | TIMESTAMP | 最后在线时间                       |
| created_at   | TIMESTAMP |                                    |
| updated_at   | TIMESTAMP |                                    |
| deleted_at   | TIMESTAMP | 逻辑删除                           |

## API 设计 (GraphQL)

```graphql
type Query {
  devices(status: DeviceStatus, first: Int, after: String): DeviceConnection!
  device(id: ID!): Device
}

type Mutation {
  registerDevice(input: RegisterDeviceInput!): Device!
}

type Device {
  id: ID!
  deviceId: String!
  name: String!
  type: DeviceType!
  protocol: String!
  status: DeviceStatus!
  lastSeenAt: DateTime
  createdAt: DateTime!
}

enum DeviceType {
  SENSOR
  ACTUATOR
  CAMERA
  OTHER
}
enum DeviceStatus {
  ONLINE
  OFFLINE
  ERROR
}
```

## 关键实现要点

- 设备注册通过 Spring Boot REST（`POST /api/v1/devices`），NestJS 转发 GraphQL mutation
- 设备状态由 MQTT 模块更新（Feature 08），当前阶段手动设置
- `device_id` 是设备端的唯一标识，需要在注册时验证唯一性

## 验收标准

- 注册一个设备，在列表中能看到
- 设备状态正确显示（当前阶段手动设置）
- 不存在的设备返回 NOT_FOUND
