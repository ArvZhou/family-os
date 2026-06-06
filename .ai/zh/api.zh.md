# Family OS API 参考

## 概述

所有 API 遵循 REST 规范并进行版本控制。

```
/api/v1/<资源>
```

---

## 认证

### 登录

```
POST /api/v1/auth/login
```

请求体：

```json
{
  "username": "string",
  "password": "string"
}
```

响应体：

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": "number"
}
```

### 刷新令牌

```
POST /api/v1/auth/refresh
```

请求体：

```json
{
  "refreshToken": "string"
}
```

---

## 家庭成员

### 获取成员列表

```
GET /api/v1/members
```

### 获取单个成员

```
GET /api/v1/members/:id
```

### 创建成员

```
POST /api/v1/members
```

请求体：

```json
{
  "name": "string",
  "birthday": "ISO日期",
  "relation": "spouse | parent | child | other",
  "avatarUrl": "string (可选)"
}
```

### 更新成员

```
PUT /api/v1/members/:id
```

### 删除成员

```
DELETE /api/v1/members/:id
```

---

## 健康记录

### 获取健康记录列表

```
GET /api/v1/health-records?memberId=:id&startDate=:date&endDate=:date
```

### 创建健康记录

```
POST /api/v1/health-records
```

请求体：

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

### 获取趋势

```
GET /api/v1/health-records/trend?memberId=:id&type=:type&period=week|month|year
```

---

## 目标管理

### 获取目标列表

```
GET /api/v1/goals
```

### 创建目标

```
POST /api/v1/goals
```

请求体：

```json
{
  "memberId": "uuid",
  "title": "string",
  "type": "daily | weekly | monthly | custom",
  "targetValue": "number",
  "unit": "string",
  "startDate": "ISO日期",
  "endDate": "ISO日期"
}
```

### 更新目标进度

```
PATCH /api/v1/goals/:id/progress
```

请求体：

```json
{
  "value": "number",
  "completed": "boolean"
}
```

---

## 设备

### 获取设备列表

```
GET /api/v1/devices
```

### 获取设备信息

```
GET /api/v1/devices/:id
```

### 注册设备

```
POST /api/v1/devices
```

请求体：

```json
{
  "deviceId": "string (来自设备)",
  "name": "string",
  "type": "sensor | actuator | camera | other",
  "protocol": "mqtt"
}
```

---

## 自动化规则

### 获取规则列表

```
GET /api/v1/automation/rules
```

### 创建规则

```
POST /api/v1/automation/rules
```

请求体：

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

## AI 服务

### 健康分析

```
POST /api/v1/ai/health/analyze
```

请求体：

```json
{
  "memberId": "uuid",
  "timeRange": "last_7_days | last_30_days | last_90_days",
  "focusAreas": ["blood_pressure", "sleep"]
}
```

### 目标推荐

```
POST /api/v1/ai/goal/recommend
```

请求体：

```json
{
  "memberId": "uuid",
  "context": "string"
}
```

### 家庭问答

```
POST /api/v1/ai/chat
```

请求体：

```json
{
  "question": "string",
  "context": "object (可选)"
}
```

---

## 通知

### 发送通知

```
POST /api/v1/notifications/send
```

请求体：

```json
{
  "memberIds": ["uuid"],
  "channel": "wechat | email | app_push",
  "title": "string",
  "body": "string"
}
```

---

## 档案

### 上传文件

```
POST /api/v1/archive/files
```

### 获取档案列表

```
GET /api/v1/archive?category=:category&page=:number
```

---

## 错误响应格式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "string",
    "details": []
  }
}
```

常见错误码：

| 错误码 | 说明 |
|--------|------|
| UNAUTHORIZED | 需要身份认证 |
| FORBIDDEN | 权限不足 |
| NOT_FOUND | 资源不存在 |
| VALIDATION_ERROR | 输入数据无效 |
| RATE_LIMITED | 请求过于频繁 |

---

## 分页

使用游标或偏移分页。

```
GET /api/v1/resources?page=1&limit=20
```

响应包含元数据：

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

---

## WebSocket 事件（计划中）

通过 WebSocket 实现设备状态的实时更新。

```
ws://host/ws/device/:deviceId
```

事件示例：

```json
{
  "type": "device_update",
  "payload": {}
}
```
