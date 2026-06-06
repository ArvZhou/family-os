# Family OS MQTT 设计指南

## 概述

MQTT 是 Family OS 中用于物联网设备通信的协议。

### 架构

```text
物联网设备
  ↓ (Wi-Fi / Zigbee / 蓝牙)
MQTT 代理（EMQX / Mosquitto）
  ↓
NestJS MQTT 网关
  ↓
处理 → PostgreSQL / 事件
```

---

## 协议设置

| 参数 | 值 |
|------|-----|
| 协议 | MQTT 3.1.1 或 5.0 |
| 端口 | 1883（TCP）、8883（TLS） |
| QoS 等级 | 1（默认） |
| 心跳间隔 | 60 秒 |
| 干净会话 | true |
| 客户端 ID | `device-<uuid>` |

---

## 主题约定

主题结构遵循层级模式：

```
<领域>/<资源>/<动作>
```

### 主题表

| 主题 | 方向 | 说明 |
|------|------|------|
| `device/{deviceId}/status` | 上 → 下 | 设备状态（在线/离线） |
| `device/{deviceId}/telemetry` | 上 → 下 | 传感器数据 |
| `device/{deviceId}/command` | 下 ↑ | 服务端下发的控制指令 |
| `automation/{ruleId}/trigger` | 上 → 下 | 自动化规则触发事件 |
| `device/{deviceId}/report` | 上 → 下 | 设备自主上报 |

### 通配符支持

- 单层通配符：`+` — `device/+/status`
- 多层通配符：`#` — `device/#`

---

## 消息格式

### 遥测数据

```json
{
  "deviceId": "device-uuid",
  "timestamp": "2026-06-02T10:00:00Z",
  "type": "temperature",
  "value": 25.5,
  "unit": "celsius"
}
```

### 状态更新

```json
{
  "deviceId": "device-uuid",
  "status": "online | offline | error",
  "signalStrength": -45,
  "batteryLevel": 80
}
```

### 命令响应

```json
{
  "correlationId": "uuid",
  "deviceId": "device-uuid",
  "result": "success | failed",
  "message": "string (可选)"
}
```

---

## 认证机制

设备使用凭据进行身份验证。

方式：

```
用户名: deviceId
密码: deviceToken
```

企业部署可使用基于证书的认证。

---

## 保留消息

使用保留消息的场景：

- 设备在线/离线状态
- 设备最后已知数值
- 当前自动化状态

不使用保留消息的场景：

- 历史遥测数据
- 事件日志
- 一次性通知

---

## 错误处理

### 连接断开

客户端应实现自动重连：

- 重试间隔：指数退避（1s → 2s → 4s → 最大 30s）
- 最大重试次数：无限（保持到重新连接）
- 重连时清除会话 = false（接收积压消息）

### 无效消息

丢弃无效消息并记录错误，包含：

- 主题
- 负载（截断显示）
- 错误原因

---

## NestJS MQTT 集成

网关配置：

```ts
MqttModule.forRoot({
  url: 'mqtt://broker:1883',
  options: {
    clientId: 'family-os-gateway',
    qos: 1,
    clean: true,
    reconnectPeriod: 1000,
  },
})
```

订阅主题：

```ts
@Subscribe('device/+/telemetry')
handleTelemetry(payload) { ... }

@Subscribe('device/+/status')
handleStatusUpdate(payload) { ... }
```

发布命令：

```ts
this.mqttClient.publish(
  'device/device-xyz/command',
  JSON.stringify({ action: 'turn_on' }),
)
```

---

## 安全措施

| 层级 | 安全措施 |
|------|----------|
| 传输层 | TLS/SSL 用于外部连接 |
| 认证 | 用户名/密码或客户端证书 |
| 访问控制 | 按主题路径配置 ACL |
| 限流 | 每个设备消息数量限制 |
| 审计 | 记录所有连接/断开事件 |

---

## 监控指标

关键监控指标：

| 指标 | 告警阈值 |
|------|----------|
| 在线设备数 | 下降超过 10% |
| 每分钟消息量 | 突然激增或骤降 |
| 消息队列深度 | > 10000 |
| 连接失败率 | > 5次/分钟 |
| 离线时长 | 设备离线超 30 分钟 |
