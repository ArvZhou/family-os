# API Endpoints — Family OS

> Specific API endpoint definitions for Family OS.
> For general API design standards, see [../api.md](../api.md).

---

## Authentication

### Login

```
POST /api/v1/auth/login
```

Request:

```json
{
  "username": "string",
  "password": "string"
}
```

Response:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": "number"
}
```

### Refresh Token

```
POST /api/v1/auth/refresh
```

Request:

```json
{
  "refreshToken": "string"
}
```

---

## Members

### List Members

```
GET /api/v1/members
```

### Get Member

```
GET /api/v1/members/:id
```

### Create Member

```
POST /api/v1/members
```

Request:

```json
{
  "name": "string",
  "birthday": "ISO date",
  "relation": "spouse | parent | child | other",
  "avatarUrl": "string (optional)"
}
```

### Update Member

```
PUT /api/v1/members/:id
```

### Delete Member

```
DELETE /api/v1/members/:id
```

---

## Health Records

### List Health Records

```
GET /api/v1/health-records?memberId=:id&startDate=:date&endDate=:date
```

### Create Health Record

```
POST /api/v1/health-records
```

Request:

```json
{
  "memberId": "uuid",
  "type": "blood_pressure | blood_sugar | weight | temperature",
  "values": {
    "systolic": 120,
    "diastolic": 80,
    "heartRate": 72
  }
}
```

### Get Trend

```
GET /api/v1/health-records/trend?memberId=:id&type=:type&period=week|month|year
```

---

## Goals

### List Goals

```
GET /api/v1/goals
```

### Create Goal

```
POST /api/v1/goals
```

Request:

```json
{
  "memberId": "uuid",
  "title": "string",
  "type": "daily | weekly | monthly | custom",
  "targetValue": "number",
  "unit": "string",
  "startDate": "ISO date",
  "endDate": "ISO date"
}
```

### Update Goal Progress

```
PATCH /api/v1/goals/:id/progress
```

Request:

```json
{
  "value": "number",
  "completed": "boolean"
}
```

---

## Devices

### List Devices

```
GET /api/v1/devices
```

### Get Device Info

```
GET /api/v1/devices/:id
```

### Register Device

```
POST /api/v1/devices
```

Request:

```json
{
  "deviceId": "string (from device)",
  "name": "string",
  "type": "sensor | actuator | camera | other",
  "protocol": "mqtt"
}
```

---

## Automation Rules

### List Rules

```
GET /api/v1/automation/rules
```

### Create Rule

```
POST /api/v1/automation/rules
```

Request:

```json
{
  "name": "string",
  "trigger": {
    "type": "device_event | schedule | health_threshold",
    "condition": "object"
  },
  "action": {
    "type": "control_device | send_notification | execute_script",
    "target": "string",
    "params": "object"
  }
}
```

---

## AI Services

### Health Analysis

```
POST /api/v1/ai/health/analyze
```

Request:

```json
{
  "memberId": "uuid",
  "timeRange": "last_7_days | last_30_days | last_90_days",
  "focusAreas": ["blood_pressure", "sleep"]
}
```

### Goal Recommendation

```
POST /api/v1/ai/goal/recommend
```

Request:

```json
{
  "memberId": "uuid",
  "context": "string"
}
```

### Family Q&A

```
POST /api/v1/ai/chat
```

Request:

```json
{
  "question": "string",
  "context": "object (optional)"
}
```

---

## Notification

### Send Notification

```
POST /api/v1/notifications/send
```

Request:

```json
{
  "memberIds": ["uuid"],
  "channel": "wechat | email | app_push",
  "title": "string",
  "body": "string"
}
```

---

## Archive

### Upload File

```
POST /api/v1/archive/files
```

### List Archive

```
GET /api/v1/archive?category=:category&page=:number
```

---

## Related Documents

- [API Design Standards](../api.md) — General REST API conventions
- [AI Service Design](./ai-service.md) — AI/LLM integration details
- [MQTT Design](./mqtt.md) — IoT device communication protocol
