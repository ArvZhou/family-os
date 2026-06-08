# 14 — OAuth2/OIDC 单点登录

## 依赖

- [01-auth](./01-auth.md) — 本地登录已就绪，SSO 作为补充

## 用户可感知的交付

- 登录页出现"通过 Keycloak/Google 登录"按钮
- 点击后跳转到 SSO provider 授权页
- 授权后自动创建/关联本地 User，签发 JWT

## 关键实现要点

- Spring Boot 作为 OAuth2 Client（通过 `spring-boot-starter-oauth2-client`）
- SSO provider 配置通过环境变量切换（`SSO_ENABLED`, `SSO_PROVIDER`, `SSO_ISSUER_URL`）
- SSO 用户首次登录时，根据 `external_id` 匹配已有 User；不匹配则自动创建
- 已有的 `users.external_id` 列存储 SSO 用户标识
- 本地登录和 SSO 登录并存 — 同一个 User 可以绑定 SSO（通过 `external_id`）

## SSO 流程

```text
1. 前端 "SSO 登录" → 跳转 GET /api/v1/auth/sso/login?provider=keycloak
2. Spring Boot 重定向到 SSO provider 授权页
3. 用户在 SSO provider 完成认证
4. SSO provider 回调 GET /api/v1/auth/sso/callback?code=...&state=...
5. Spring Boot 用 code 换 token，获取用户信息
6. 匹配或创建本地 User，签发 JWT
7. 重定向回前端（带 JWT token）
```

## 验收标准

- 配置 Keycloak（或任意 OIDC provider）后，SSO 登录流程走通
- SSO 用户首次登录自动创建 User
- 再次登录关联到同一个 User
- 本地账号和 SSO 账号可以共存
