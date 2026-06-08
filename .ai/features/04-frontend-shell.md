# 04 — 前端壳

## 依赖

- [01-auth](./01-auth.md) — 登录/注册 API
- [02-members](./02-members.md) — 成员数据 API
- [03-graphql-gateway](./03-graphql-gateway.md) — GraphQL 端点

## 用户可感知的交付

- 访问网站看到登录页
- 输入用户名密码登录后进入主界面
- 主界面左侧有导航栏（成员、健康、目标、设备）
- "成员"页面展示家庭成员列表，可以添加/编辑/删除成员
- Token 过期自动刷新
- 支持中英文切换（zh/en）

## 路由设计

```
/                     → 重定向到 /members（已登录）或 /login
/login                → 登录页
/members              → 成员列表
/members/:id          → 成员详情
/health               → 健康记录（feature 05）
/goals                → 目标管理（feature 06）
/devices              → 设备管理（feature 07）
```

## 组件树

```
RootLayout
├── AuthProvider (JWT 管理 + 自动刷新)
├── I18nProvider (中英文切换)
└── AppShell
    ├── Sidebar (导航: 成员/健康/目标/设备)
    ├── Header (当前用户 + 语言切换 + 登出)
    └── MainContent (路由出口)

LoginPage
├── LoginForm (用户名 + 密码)
└── SSOButton (Phase 5 启用)

MemberListPage (Feature 04 交付)
├── MemberCard[] (头像 + 姓名 + 关系标签)
├── AddMemberDialog (Feature 02 API)
└── EditMemberDialog

MemberDetailPage
├── MemberProfile (基本信息)
└── (预留: HealthRecords, Goals 子组件 — Phase 2)
```

## 技术选型

| 项             | 选择                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| 框架           | Next.js 15 (App Router)                                                      |
| GraphQL 客户端 | Apollo Client (`@apollo/client` + `@apollo/experimental-nextjs-app-support`) |
| 样式           | Tailwind CSS                                                                 |
| 组件库         | shadcn/ui                                                                    |
| 国际化         | next-intl                                                                    |
| 表单           | React Hook Form + Zod                                                        |
| 类型生成       | graphql-codegen → 从 `schema.graphql` 生成 TypeScript                        |

## 关键实现要点

- **Apollo Client 配置**: 使用 `ApolloClient` + `InMemoryCache`，`Authorization: Bearer <token>` 通过 Apollo Link middleware 自动附加
- **Token 管理**: 登录后 access token 存内存，refresh token 存 httpOnly cookie。Apollo Link 拦截 401，自动 refresh 后重试
- **路由守卫**: Next.js middleware 检查 cookie，未登录重定向到 `/login`
- **Server Components 优先**: 页面用 RSC，交互组件用 `"use client"`
- **i18n**: 默认中文，支持英文。翻译 key 按 domain 组织 (`members.*`, `auth.*`, `common.*`)

## GraphQL 操作

### 登录

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    expiresIn
    user {
      id
      name
      email
    }
  }
}
```

### 成员列表

```graphql
query GetMembers {
  members {
    id
    name
    birthday
    relation
    avatarUrl
  }
}
```

### 创建成员

```graphql
mutation CreateMember($input: CreateMemberInput!) {
  createMember(input: $input) {
    id
    name
    birthday
    relation
  }
}
```

### 删除成员

```graphql
mutation DeleteMember($id: ID!) {
  deleteMember(id: $id)
}
```

## 验收标准

```bash
# 1. 开发服务器启动
cd apps/family-portal && pnpm dev
# 期望: Next.js 启动在 localhost:3000

# 2. 登录流程
# 浏览器打开 http://localhost:3000
# 期望: 未登录 → 重定向到 /login
# 输入 test / Test1234 → 登录成功 → 跳转到 /members

# 3. 成员列表
# 期望: 看到家庭成员卡片列表（从 GraphQL 加载）

# 4. 添加成员
# 点击"添加成员" → 填写表单 → 提交
# 期望: 列表刷新，新成员出现

# 5. 删除成员
# 点击成员卡片的删除按钮 → 确认
# 期望: 该成员从列表消失

# 6. Token 过期
# 等待 access token 过期（或手动清除）
# 期望: 自动 refresh，用户无感知

# 7. 语言切换
# 点击语言切换按钮
# 期望: 界面文字在中文/英文间切换
```
