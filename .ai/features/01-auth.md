# 01 — 身份认证

> **所属服务:** identity-service（Spring Boot）。此服务承载身份认证、成员管理、设备注册、权限控制等核心数据域。Auth 是其中的一个子域 — 其他子域见 [02-members](./02-members.md)、[07-device-registry](./07-device-registry.md)。identity-service 当前包含 `AuthController`、`MemberController`、`DeviceController`、`PermissionController`。

## 依赖

无。这是第一个 feature，所有其他 feature 都依赖它。

## 用户可感知的交付

- 用户注册时填写邮箱或手机号，系统发送 6 位验证码（开发环境打印到控制台）
- 用户输入验证码激活账号后，才能登录
- 登录成功获得 JWT access token（30 分钟）+ refresh token（7 天）
- Token 过期后可以用 refresh token 换取新的 access token
- 60 秒内不能重复发送验证码

## 数据模型

**服务**: identity-service (Spring Boot + MyBatis-Plus + Flyway + Spring Security)

**表**: `users` (已存在，MyBatis-Plus 管理)

| 列            | 类型      | 说明                                   |
| ------------- | --------- | -------------------------------------- |
| id            | UUID      | 主键                                   |
| username      | VARCHAR   | 登录用户名，唯一                       |
| password_hash | VARCHAR   | bcrypt 密码哈希                        |
| email         | VARCHAR   | 邮箱（用于验证码）                     |
| phone         | VARCHAR   | 手机号（用于验证码）                   |
| name          | VARCHAR   | 显示名称                               |
| verified      | BOOLEAN   | 是否已验证（默认 false）               |
| external_id   | VARCHAR   | SSO 外部 ID（Phase 5 用，当前为 NULL） |
| created_at    | TIMESTAMP | 创建时间（MyBatis-Plus 自动填充）      |
| updated_at    | TIMESTAMP | 更新时间（MyBatis-Plus 自动填充）      |
| deleted_at    | TIMESTAMP | 逻辑删除（MyBatis-Plus @TableLogic）   |

## API 设计

### Spring Boot REST

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/verify
POST /api/v1/auth/resend-code
```

#### POST /api/v1/auth/register

注册时创建未验证用户，自动发送验证码到 email 或 phone。

```json
// Request
{
  "username": "zhangsan",
  "password": "securePassword123",
  "email": "zhangsan@example.com",
  "phone": null,
  "name": "张三"
}
// Response 201 — 用户已创建但 verified=false，验证码已发送
{
  "id": "uuid",
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "name": "张三"
}
```

#### POST /api/v1/auth/verify

验证邮箱或手机号。

```json
// Request
{ "target": "zhangsan@example.com", "code": "123456" }
// Response 200
{ "message": "Account verified successfully" }
// Error 400 — VERIFICATION_CODE_INVALID
// Error 429 — TOO_MANY_REQUESTS（60s 冷却）
```

#### POST /api/v1/auth/resend-code

重新发送验证码（不暴露目标是否存在）。

```json
// Request
{ "target": "zhangsan@example.com" }
// Response 200（无论目标是否存在）
{ "message": "If the account exists, a verification code has been sent" }
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
- **JWT 签发**: 使用 `jjwt` 库，access token 30 分钟，refresh token 7 天
- **JWT 密钥**: 通过 `JWT_SECRET` / `JWT_REFRESH_SECRET` 环境变量注入，开发环境有默认值
- **Security 配置**: Spring Security filter chain + `JwtAuthFilter`，放行 `/api/v1/auth/**`
- **逻辑删除**: User 用 `@TableLogic`，注册时检查 `username` 在未删除用户中的唯一性
- **验证码**: 策略模式（`VerificationCodeService`），开发环境 `ConsoleVerificationCodeService` 打印到日志
- **验证码存储**: 内存 `CodeStore`（ConcurrentHashMap），5 分钟过期，一次性使用，60s 重发冷却
- **时间戳**: MyBatis-Plus `MetaObjectHandler` 自动填充 `created_at`、`updated_at`
- **UUID 主键**: 手动 `UUID.randomUUID()`（MyBatis-Plus `ASSIGN_UUID` 不支持 `java.util.UUID` 类型）
- **验证码 Provider 扩展**: 实现 `VerificationCodeService` 接口，通过 `sms.provider` 配置切换

### 环境变量

```bash
# JWT
JWT_SECRET=<至少 256-bit 密钥>
JWT_REFRESH_SECRET=<至少 256-bit 密钥>

# 验证码 Provider
SMS_PROVIDER=console        # console | aliyun | twilio | smtp
SMS_API_KEY=
SMS_API_SECRET=
SMS_SIGN_NAME=FamilyOS
SMS_TEMPLATE_CODE=
```

## 验收标准

```bash
# 1. 注册（自动发送验证码到控制台）
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234","email":"test@example.com","name":"测试"}'
# 期望: 201, 控制台打印 6 位验证码

# 2. 登录（未验证，应拒绝）
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234"}'
# 期望: 403 ACCOUNT_NOT_VERIFIED

# 3. 验证账号
curl -X POST http://localhost:8080/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"target":"test@example.com","code":"123456"}'
# 期望: 200 "Account verified successfully"

# 4. 登录（已验证）
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test1234"}'
# 期望: 200, 返回 accessToken + refreshToken + user

# 5. 访问受保护端点
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
# 期望: 200

# 6. 无 token 访问 → 401
# 7. 刷新 token → 200 新 accessToken
# 8. 重复注册 → 409 CONFLICT
# 9. 错误密码 → 401 UNAUTHORIZED
# 10. 60s 内重发验证码 → 429 TOO_MANY_REQUESTS
```
