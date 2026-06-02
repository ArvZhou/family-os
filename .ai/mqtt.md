# Family OS MQTT Design Guide

## Overview

MQTT is the protocol used for IoT device communication in Family OS.

### Architecture

```text
IoT Devices
  ↓ (Wi-Fi / Zigbee / Bluetooth)
MQTT Broker (EMQX / Mosquitto)
  ↓
NestJS MQTT Gateway
  ↓
Process → PostgreSQL / Events
```

---

## Protocol Settings

| Setting | Value |
|---------|-------|
| Protocol | MQTT 3.1.1 or 5.0 |
| Port | 1883 (TCP), 8883 (TLS) |
| QoS Level | 1 (default) |
| Keep Alive | 60 seconds |
| Clean Session | true |
| Client ID | `device-<uuid>` |

---

## Topic Convention

Topic structure follows a hierarchical pattern:

```
<domain>/<resource>/<action>
```

### Topic Table

| Topic | Direction | Description |
|-------|-----------|-------------|
| `device/{deviceId}/status` | Up → Down | Device status (online/offline) |
| `device/{deviceId}/telemetry` | Up → Down | Sensor data |
| `device/{deviceId}/command` | Down ↑ | Control commands from server |
| `automation/{ruleId}/trigger` | Up → Down | Automation rule triggers |
| `device/{deviceId}/report` | Up → Down | Device self-reporting |

### Wildcard Support

- Single-level: `+` — `device/+/status`
- Multi-level: `#` — `device/#`

---

## Message Format

### Telemetry Data

```json
{
  "deviceId": "device-uuid",
  "timestamp": "2026-06-02T10:00:00Z",
  "type": "temperature",
  "value": 25.5,
  "unit": "celsius"
}
```

### Status Update

```json
{
  "deviceId": "device-uuid",
  "status": "online | offline | error",
  "signalStrength": -45,
  "batteryLevel": 80
}
```

### Command Response

```json
{
  "correlationId": "uuid",
  "deviceId": "device-uuid",
  "result": "success | failed",
  "message": "string (optional)"
}
```

---

## Authentication

Device authentication using credentials.

Method:

```
Username: deviceId
Password: deviceToken
```

Or certificate-based authentication for enterprise deployments.

---

## Retained Messages

Use retained messages for:

- Device online/offline status
- Device last known values
- Current automation state

Do NOT use retained messages for:

- Historical telemetry
- Event logs
- One-time notifications

---

## Error Handling

### Connection Lost

The client should implement automatic reconnection:

- Retry interval: exponential backoff (1s → 2s → 4s → max 30s)
- Max retries: unlimited (persist until connected)
- Clear session on reconnect = false (receive pending messages)

### Invalid Message

Discard invalid messages and log the error with:

- Topic
- Payload (truncated)
- Error reason

---

## NestJS MQTT Integration

Gateway configuration:

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

Subscribing topics:

```ts
@Subscribe('device/+/telemetry')
handleTelemetry(payload) { ... }

@Subscribe('device/+/status')
handleStatusUpdate(payload) { ... }
```

Publishing commands:

```ts
this.mqttClient.publish(
  'device/device-xyz/command',
  JSON.stringify({ action: 'turn_on' }),
)
```

---

## Security

| Layer | Measure |
|-------|---------|
| Transport | TLS / SSL for external connections |
| Auth | Username/password or client certificates |
| Access Control | ACL per topic path |
| Rate Limit | Per-device message limit |
| Audit | Log all connection/disconnect events |

---

## Monitoring

Key metrics to track:

| Metric | Alert Threshold |
|--------|-----------------|
| Connected devices | Drop > 10% |
| Messages per minute | Sudden spike/drop |
| Message queue depth | > 10000 |
| Connection failures | > 5/min |
| Offline duration | Device offline > 30min |
