# 02 — 家庭成员管理

## 依赖

- [01-auth](./01-auth.md) — 需要认证才能管理成员

## 用户可感知的交付

- 登录后在"家庭成员"页面看到成员列表
- 可以添加、编辑、删除家庭成员
- 每个成员有姓名、生日、与户主的关系（配偶/父母/子女/兄弟姐妹/其他）

## 数据模型

**服务**: Spring Boot (identity-service)

**表**: `members` (已存在)

| 列            | 类型      | 说明                                        |
| ------------- | --------- | ------------------------------------------- |
| id            | UUID      | 主键                                        |
| name          | VARCHAR   | 姓名                                        |
| birthday      | DATE      | 生日                                        |
| relation_type | VARCHAR   | 关系: SPOUSE, PARENT, CHILD, SIBLING, OTHER |
| avatar_url    | VARCHAR   | 头像 URL，可为空                            |
| created_at    | TIMESTAMP | 创建时间                                    |
| updated_at    | TIMESTAMP | 更新时间                                    |
| deleted_at    | TIMESTAMP | 逻辑删除                                    |

## API 设计

### Spring Boot REST

```
GET    /api/v1/members          # 列表（需认证）
GET    /api/v1/members/:id      # 详情
POST   /api/v1/members          # 创建
PUT    /api/v1/members/:id      # 更新
DELETE /api/v1/members/:id      # 逻辑删除
```

#### GET /api/v1/members

```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "name": "张三",
      "birthday": "1950-03-15",
      "relationType": "PARENT",
      "avatarUrl": null,
      "createdAt": "2026-06-08T10:00:00Z",
      "updatedAt": "2026-06-08T10:00:00Z"
    }
  ]
}
```

#### POST /api/v1/members

```json
// Request
{
  "name": "李四",
  "birthday": "1980-07-20",
  "relationType": "SPOUSE",
  "avatarUrl": null
}
// Response 201 — created member object
```

#### PUT /api/v1/members/:id

```json
// Request (部分字段可选)
{
  "name": "李四(更新)",
  "birthday": "1980-07-20",
  "relationType": "SPOUSE"
}
// Response 200 — updated member object
```

#### DELETE /api/v1/members/:id

```json
// Response 200
{ "message": "Member deleted" }
// 实际执行逻辑删除: SET deleted_at = now()
```

## 关键实现要点

- **数据归属**: 成员数据属于 Spring Boot，NestJS 通过 REST 读取
- **逻辑删除**: MyBatis-Plus `@TableLogic` 自动处理，DELETE → `SET deleted_at = now()`
- **关系枚举**: `relation_type` 存储为字符串枚举值，Java 侧映射到 `RelationType` enum
- **输入校验**: `name` 必填（1-50字符），`birthday` 必填（不能是未来日期），`relationType` 必须是枚举值之一
- **全局异常处理**: 使用已有的 `GlobalExceptionHandler` + `EntityNotFoundException`

## 验收标准

```bash
# 1. 创建成员
curl -X POST http://localhost:8080/api/v1/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"妈妈","birthday":"1955-03-15","relationType":"PARENT"}'
# 期望: 201

# 2. 列表
curl http://localhost:8080/api/v1/members \
  -H "Authorization: Bearer <token>"
# 期望: 200, data 数组包含刚创建的成员

# 3. 更新
curl -X PUT http://localhost:8080/api/v1/members/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"妈妈(更新)"}'
# 期望: 200

# 4. 删除
curl -X DELETE http://localhost:8080/api/v1/members/<id> \
  -H "Authorization: Bearer <token>"
# 期望: 200, 再次列表时该成员消失（逻辑删除）
```
