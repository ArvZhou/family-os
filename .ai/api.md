# API Design Standards

## Purpose

This document defines the general API design standards for all projects. Specific endpoint definitions belong in [features/api.md](./features/api.md).

---

## REST Principles

- Use **resource-oriented URLs** with plural nouns.
- Use **HTTP methods** to express actions.
- All APIs must be **versioned**.

---

## URL Convention

```
/api/v1/<resource>
```

### Resource Naming

| ✅ Good | ❌ Bad |
|---------|--------|
| `/api/v1/members` | `/api/v1/getMember` |
| `/api/v1/health-records` | `/api/v1/createGoal` |
| `/api/v1/goals/:id/progress` | `/api/v1/updateGoalProgress` |

- Use `kebab-case` for multi-word resources.
- Use nested paths for sub-resources: `/api/v1/members/:id/health-records`.
- Avoid verbs in URLs — let HTTP methods express the action.

---

## HTTP Methods

| Method | Semantics | Idempotent | Example |
|--------|-----------|------------|---------|
| `GET` | Retrieve resource(s) | Yes | `GET /api/v1/members` |
| `POST` | Create a resource | No | `POST /api/v1/members` |
| `PUT` | Full replacement | Yes | `PUT /api/v1/members/:id` |
| `PATCH` | Partial update | Yes | `PATCH /api/v1/goals/:id/progress` |
| `DELETE` | Remove a resource | Yes | `DELETE /api/v1/members/:id` |

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| `200 OK` | Successful GET / PUT / PATCH / DELETE |
| `201 Created` | Successful POST (resource created) |
| `204 No Content` | Successful DELETE with no response body |
| `400 Bad Request` | Invalid input / validation error |
| `401 Unauthorized` | Authentication required |
| `403 Forbidden` | Permission denied |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Duplicate or conflicting resource |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server error |

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "string",
    "details": []
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Permission denied |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `CONFLICT` | Resource conflict |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Pagination

Use cursor-based or offset-based pagination. Default to offset-based for simple cases.

```
GET /api/v1/resources?page=1&limit=20
```

Response includes metadata:

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

### Rules

- Default `limit`: 20, max: 100.
- Always include `total` and `hasMore`.
- Use `cursor` pagination for infinite scroll or high-volume endpoints.

---

## Authentication

- Use **JWT Bearer tokens** for authentication.
- Include `Authorization: Bearer <token>` header in all authenticated requests.
- Provide a refresh token mechanism for long-lived sessions.
- Never expose sensitive data (tokens, secrets) in URLs or query parameters.

---

## Versioning

- All APIs must be versioned under `/api/v1/`, `/api/v2/`, etc.
- Breaking changes require a new version.
- Non-breaking changes (additive fields, new endpoints) can be added to the current version.

---

## WebSocket Events (Future)

Real-time communication via WebSocket for live updates.

```
ws://host/ws/<resource>/:id
```

Event format:

```json
{
  "type": "resource_update",
  "payload": {}
}
```

---

## Related Documents

- [Feature: API Endpoints](./features/api.md) — Specific endpoint definitions for this project
- [NestJS Standards](./standards/backend/nestjs.md) — NestJS API implementation conventions
- [Spring Boot Standards](./standards/backend/spring-boot.md) — Spring Boot API implementation conventions
