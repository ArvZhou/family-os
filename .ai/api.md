# API Design Standards

## Purpose

This document defines the general API design standards. Specific endpoint definitions and GraphQL operations belong in [features/](./features/) (ordered by implementation phase).

---

## API Architecture

The system uses a **dual-protocol** approach:

| Protocol    | Consumer                                 | Purpose                                            |
| ----------- | ---------------------------------------- | -------------------------------------------------- |
| **GraphQL** | Frontend (Web / Mobile)                  | Primary API for client applications                |
| **REST**    | Internal services, external integrations | Service-to-service communication, third-party APIs |

```text
Frontend
  ↓ (GraphQL)
Application Layer (NestJS — GraphQL Gateway)
  ↓ (REST, internal)
Data Layer (Spring Boot)
  ↓
PostgreSQL
```

- **Frontend** talks to the application layer via GraphQL.
- **Service-to-service** communication uses REST.
- All REST APIs must generate **OpenAPI/Swagger** documentation.
- All GraphQL APIs support **schema introspection** and provide a **Playground** in development.

---

## GraphQL Standards

### Design Principles

- **Schema-first**: define the schema before implementing resolvers.
- Use `type Query` for reads, `type Mutation` for writes, `type Subscription` for real-time.
- Follow **Relay specification** for pagination (connections, edges, cursors).
- Use **enums** for fixed sets of values instead of strings.
- Nest related fields under the parent type (avoid flat query explosion).

### Naming Conventions

| Element       | Convention                        | Example                                |
| ------------- | --------------------------------- | -------------------------------------- |
| Types         | `PascalCase` singular noun        | `Member`, `HealthRecord`               |
| Queries       | `camelCase`, plural for lists     | `members`, `member(id: ID!)`           |
| Mutations     | `camelCase`, verb + noun          | `createMember`, `deleteMember`         |
| Input types   | `PascalCase` + `Input`            | `CreateMemberInput`                    |
| Subscriptions | `camelCase`, `on` prefix optional | `memberUpdated`, `deviceStatusChanged` |
| Enums         | `UPPER_SNAKE_CASE` values         | `BLOOD_PRESSURE`, `DAILY`              |

### Error Handling

GraphQL errors follow a structured format:

```json
{
  "errors": [
    {
      "message": "Member not found",
      "extensions": {
        "code": "NOT_FOUND",
        "path": ["member"],
        "timestamp": "2026-06-06T10:00:00Z"
      }
    }
  ]
}
```

Common error codes:

| Code               | Description             |
| ------------------ | ----------------------- |
| `UNAUTHORIZED`     | Authentication required |
| `FORBIDDEN`        | Permission denied       |
| `NOT_FOUND`        | Resource not found      |
| `VALIDATION_ERROR` | Invalid input data      |
| `CONFLICT`         | Resource conflict       |
| `INTERNAL_ERROR`   | Unexpected server error |

### Pagination (Relay Connection)

```graphql
type Query {
  members(first: Int, after: String, last: Int, before: String): MemberConnection!
}

type MemberConnection {
  edges: [MemberEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type MemberEdge {
  node: Member!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Schema Documentation

- Every type, field, and argument must have a `"""description"""` docstring.
- Use `@deprecated(reason: "...")` for fields being phased out.

```graphql
"""
A family member profile
"""
type Member {
  """
  Unique identifier
  """
  id: ID!
  """
  Display name
  """
  name: String!
  """
  Date of birth in ISO format
  """
  birthday: Date!
  """
  Relationship to the account owner
  """
  relation: Relation!
  """
  Health records for this member
  """
  healthRecords(first: Int, after: String): HealthRecordConnection!
}
```

### Introspection & Playground

- **Development**: GraphQL Playground enabled at `/graphql`.
- **Production**: introspection disabled by default; expose via separate admin endpoint if needed.
- Schema must be exported as `schema.graphql` for code generation.

---

## REST Standards

### REST Principles

- Use **resource-oriented URLs** with plural nouns.
- Use **HTTP methods** to express actions.
- All APIs must be **versioned**.

### URL Convention

```
/api/v1/<resource>
```

#### Resource Naming

| ✅ Good                      | ❌ Bad                       |
| ---------------------------- | ---------------------------- |
| `/api/v1/members`            | `/api/v1/getMember`          |
| `/api/v1/health-records`     | `/api/v1/createGoal`         |
| `/api/v1/goals/:id/progress` | `/api/v1/updateGoalProgress` |

- Use `kebab-case` for multi-word resources.
- Use nested paths for sub-resources: `/api/v1/members/:id/health-records`.
- Avoid verbs in URLs — let HTTP methods express the action.

### HTTP Methods

| Method   | Semantics            | Idempotent | Example                            |
| -------- | -------------------- | ---------- | ---------------------------------- |
| `GET`    | Retrieve resource(s) | Yes        | `GET /api/v1/members`              |
| `POST`   | Create a resource    | No         | `POST /api/v1/members`             |
| `PUT`    | Full replacement     | Yes        | `PUT /api/v1/members/:id`          |
| `PATCH`  | Partial update       | Yes        | `PATCH /api/v1/goals/:id/progress` |
| `DELETE` | Remove a resource    | Yes        | `DELETE /api/v1/members/:id`       |

### HTTP Status Codes

| Code                        | Usage                                   |
| --------------------------- | --------------------------------------- |
| `200 OK`                    | Successful GET / PUT / PATCH / DELETE   |
| `201 Created`               | Successful POST (resource created)      |
| `204 No Content`            | Successful DELETE with no response body |
| `400 Bad Request`           | Invalid input / validation error        |
| `401 Unauthorized`          | Authentication required                 |
| `403 Forbidden`             | Permission denied                       |
| `404 Not Found`             | Resource not found                      |
| `409 Conflict`              | Duplicate or conflicting resource       |
| `429 Too Many Requests`     | Rate limit exceeded                     |
| `500 Internal Server Error` | Unexpected server error                 |

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "string",
    "details": []
  }
}
```

### REST Pagination

Use cursor-based or offset-based pagination:

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

- Default `limit`: 20, max: 100.
- Always include `total` and `hasMore`.

---

## API Documentation

### REST — OpenAPI / Swagger

All REST APIs **must** generate OpenAPI 3.0 documentation automatically:

- **NestJS**: use `@nestjs/swagger` with decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).
- **Spring Boot**: use `springdoc-openapi` for automatic Swagger generation.
- Swagger UI must be available at:
  - NestJS: `/api/docs` (or `/api/v1/docs`)
  - Spring Boot: `/swagger-ui.html`
- OpenAPI spec JSON at `/api/docs-json` (NestJS) and `/v3/api-docs` (Spring Boot).
- **Production**: Swagger UI disabled or restricted to internal network.

### GraphQL — Schema & Playground

- Schema file exported as `schema.graphql` at build time.
- GraphQL Playground at `/graphql` (development only).
- Introspection enabled in development, disabled in production.
- Use code generation (`graphql-codegen`) to produce TypeScript types from the schema.

---

## Authentication

### JWT Bearer Tokens

- Include `Authorization: Bearer <token>` header in all authenticated requests.
- Provide a refresh token mechanism for long-lived sessions.
- Never expose tokens in URLs or query parameters.

### SSO — OAuth2 / OIDC (Reserved)

The system reserves **Single Sign-On** support via **OAuth2 / OpenID Connect**:

- Support standard OAuth2 flows: Authorization Code, Authorization Code + PKCE.
- Support OpenID Connect for identity verification (`id_token`).
- SSO provider is pluggable — support any OIDC-compliant provider (Keycloak, Auth0, Casdoor, Azure AD, etc.).
- Auth endpoints:

| Endpoint             | Method     | Description                  |
| -------------------- | ---------- | ---------------------------- |
| `/auth/sso/login`    | `GET`      | Redirect to SSO provider     |
| `/auth/sso/callback` | `GET`      | Handle SSO provider callback |
| `/auth/sso/logout`   | `GET/POST` | End SSO session              |

- After SSO login, issue internal JWT access + refresh tokens.
- SSO provider configuration via environment variables:

```bash
SSO_ENABLED=false
SSO_PROVIDER=keycloak          # keycloak | auth0 | casdoor | custom
SSO_ISSUER_URL=https://sso.example.com/realms/family-os
SSO_CLIENT_ID=family-os
SSO_CLIENT_SECRET=<secret>
SSO_REDIRECT_URI=http://localhost:4000/auth/sso/callback
SSO_SCOPES=openid profile email
```

- When SSO is disabled, fall back to local username/password authentication.

### Versioning

- All REST APIs must be versioned under `/api/v1/`, `/api/v2/`, etc.
- GraphQL schema versioning: use `@deprecated` for field deprecation, introduce new fields/types for major changes.
- Breaking REST changes require a new version.
- Non-breaking changes (additive fields, new endpoints) can be added to the current version.

---

## WebSocket / Subscription (Future)

Real-time communication:

- **GraphQL Subscriptions** for frontend real-time data (via WebSocket transport).
- **REST WebSocket** for device status updates if needed.

```
wss://host/graphql           # GraphQL subscriptions
wss://host/ws/device/:id     # Device WebSocket (if needed)
```

---

## Related Documents

- [Features](./features/) — Feature-by-feature API designs (01-auth through 14-sso)
- [NestJS Standards](./standards/backend/nestjs.md) — GraphQL & REST implementation
- [Spring Boot Standards](./standards/backend/spring-boot.md) — REST & Swagger implementation
- [Frontend Standards](./frontend.md) — GraphQL client conventions
