# 08 — MQTT 设备通信

## 依赖

- [07-device-registry](./07-device-registry.md) — 需要已注册的设备

## 用户可感知的交付

- IoT 设备通过 MQTT 自动上报数据（温度、湿度等）
- 设备在线/离线状态自动更新
- 在设备详情页看到最近的上报数据

## 架构

```text
IoT Device → MQTT Broker (EMQX) → NestJS MQTT Gateway → PostgreSQL
```

## Topic 设计

| Topic                         | 方向            | 说明                   |
| ----------------------------- | --------------- | ---------------------- |
| `device/{deviceId}/telemetry` | Device → Server | 传感器数据             |
| `device/{deviceId}/status`    | Device → Server | 在线/离线状态          |
| `device/{deviceId}/command`   | Server → Device | 控制指令（Feature 09） |

## 消息格式

### Telemetry

```json
{
  "deviceId": "uuid",
  "timestamp": "2026-06-08T10:00:00Z",
  "type": "temperature",
  "value": 25.5,
  "unit": "celsius"
}
```

## 关键实现要点

- NestJS 使用 `@nestjs/microservices` MQTT transport 或 `mqtt.js`
- 收到 telemetry 后更新设备 `last_seen_at` + 写入 telemetry 表（如需要）
- 设备 status 通过 retained message 持久化，新订阅者立即可知设备在线状态
- EMQX 通过 Docker Compose 本地运行，生产环境单独部署

## 验收标准

- 用 `mosquitto_pub` 模拟设备发送 telemetry，NestJS 能接收到
- 设备 `last_seen_at` 自动更新
- 设备断连后 status 变为 OFFLINE
