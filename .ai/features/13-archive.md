# 13 — 家庭档案

## 依赖

- [04-frontend-shell](./04-frontend-shell.md) — 前端壳

## 用户可感知的交付

- 上传照片、文档到家庭档案
- 按分类浏览（照片/文档/事件/其他）
- 下载或预览文件

## 数据模型

**服务**: NestJS (family-service)

**表**: `archive_files`

| 列          | 类型      | 说明                             |
| ----------- | --------- | -------------------------------- |
| id          | UUID      | 主键                             |
| name        | VARCHAR   | 文件名                           |
| category    | VARCHAR   | PHOTO / DOCUMENT / EVENT / OTHER |
| size        | BIGINT    | 文件大小 (bytes)                 |
| mime_type   | VARCHAR   | MIME 类型                        |
| storage_key | VARCHAR   | 对象存储 key（MinIO/S3）         |
| uploaded_by | UUID      | 上传者 user id                   |
| created_at  | TIMESTAMP |                                  |

## 关键实现要点

- 文件存储在 MinIO（兼容 S3），本地开发用 Docker Compose
- 上传通过 GraphQL multipart 或 REST `POST /api/v1/archive/upload`
- 下载生成预签名 URL，有时效性
- 缩略图: 照片类型自动生成缩略图

## 验收标准

- 上传一张照片，在列表中能看到缩略图
- 点击下载后能获得原图
- 删除后文件不可访问
