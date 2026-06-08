# 01 — 身份认证

## 依赖

无。这是第一个 feature，所有其他 feature 都依赖它。

## 用户可感知的交付

- 用户访问登录页，输入用户名和密码，登录成功获得 JWT token
- 登录后可以访问受保护的页面和 API
- Token 过期后可以用 refresh token 换取新的 access token
- 登出后 token 失效

## 数据模型

**服务**: Spring Boot (identity-service)

**表**: `users` (已存在，MyBatis-Plus 管理)

| 列            | 类型      | 说明                                   |
| ------------- | --------- | -------------------------------------- |
| id            | UUID      | 主键                                   |
| username      | VARCHAR   | 登录用户名，唯一                       |
| password_hash | VARCHAR   | bcrypt 密码哈希                        |
| email         | VARCHAR   | 邮箱                                   |
| name          | VARCHAR   | 显示名称                               |
| external_id   | VARCHAR   | SSO 外部 ID（Phase 5 用，当前为 NULL） |
| created_at    | TIMESTAMP | 创建时间                               |
| updated_at    | TIMESTAMP | 更新时间                               |
| deleted_at    | TIMESTAMP | 逻辑删除（MyBatis-Plus @TableLogic）   |

## API 设计

### Spring Boot REST

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

#### POST /api/v1/auth/register

```json
// Request
{
  "username": "zhangsan",
  "password": "securePassword123",
  "email": "zhangsan@example.com",
  "name": "张三"
}
// Response 201
{
  "id": "uuid",
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "name": "张三",
  "createdAt": "2026-06-08T10:00:00Z"
}
```

#### POST /api/v1/auth/login

```json
// Request
{
  "username": "zhangsan",
  "password": "securePassword123"
}
// Response 200
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 1800,
  "user": {
    "id": "uuid",
    "name": "张三",
    "email": "zhangsan@example.com"
  }
}
```

#### POST /api/v1/auth/refresh

```json
// Request
{ "refreshToken": "eyJ..." }
// Response 200
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 1800
}
```

#### POST /api/v1/auth/logout

```json
// Request: empty body, Authorization header required
// Response 200
{ "message": "Logged out" }
```

#### GET /api/v1/auth/me

```json
// Response 200 (requires Authorization header)
{
  "id": "uuid",
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "name": "张三",
  "createdAt": "2026-06-08T10:00:00Z"
}
```

## 关键实现要点

- **密码哈希**: 使用 `BCryptPasswordEncoder`，Spring Security 内置
- **JWT 签发**: 使用 `jjwt` 库，access token 15-30 分钟，refresh token 7 天
- **JWT 密钥**: 通过 `JWT_SECRET` / `JWT_REFRESH_SECRET` 环境变量注入
- **Security 配置**: Spring Security filter chain 放行 `/api/v1/auth/**`，其他端点需要认证
- **逻辑删除**: User 已有 `@TableLogic`，注册时检查 `username` 在未删除用户中的唯一性
- **Refresh token 处理**: 可以存在内存（MVP）或 Redis（Phase 2），登出时加入黑名单

## 验收标准

```bash
# 1. 注册
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234","email":"test@example.com","name":"测试"}'
# 期望: 201, 返回用户信息

# 2. 登录
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234"}'
# 期望: 200, 返回 accessToken + refreshToken

# 3. 访问受保护端点
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
# 期望: 200, 返回当前用户信息

# 4. 无 token 访问
curl http://localhost:8080/api/v1/auth/me
# 期望: 401

# 5. 刷新 token
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
# 期望: 200, 返回新的 accessToken + refreshToken
```
