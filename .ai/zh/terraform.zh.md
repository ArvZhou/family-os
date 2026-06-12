# Terraform — 基礎設施即代碼標準

> **⚠️ 未來 / 規劃中：** 倉庫中目前沒有 `infra/terraform/` 目錄。此文件描述的是引入 Terraform 後的目標標準。請勿嘗試查找 Terraform 配置——它們尚不存在。
>
> 使用 Terraform 管理雲端基礎設施的通用規範。
> 通用部署標準請參考 [../deployment.zh.md](../deployment.zh.md)。

---

## 目的

Terraform 用於配置和管理 Family OS 的所有雲端基礎設施資源——網絡、數據庫、Kubernetes 集群、托管服務、DNS 和 SSL 證書。Kubernetes（Helm）負責應用部署；Terraform 負責其下層的一切。

**分層關係：**

```text
應用層 — Helm charts（應用部署於 K8s）
  ↓
平台層 — Kubernetes 集群 (EKS / GKE / AKS)
  ↓
基礎設施層 — Terraform (VPC、DB、Redis、S3、IAM、DNS)
```

---

## 目錄結構

遵循 `infra/` 中定義的 monorepo 佈局：

```text
infra/
├── terraform/                      # 雲端基礎設施 (Terraform)
│   ├── modules/                    # 可復用的 Terraform 模塊
│   │   ├── networking/             # VPC、子網、NAT、防火牆
│   │   ├── database/               # PostgreSQL (RDS / Cloud SQL)
│   │   ├── kubernetes/             # K8s 集群 (EKS / GKE / AKS)
│   │   ├── redis/                  # 托管 Redis (ElastiCache / Memorystore)
│   │   ├── storage/                # 對象存儲 (S3 / GCS / Blob)
│   │   ├── dns/                    # DNS 區域與記錄 (Route 53 / Cloud DNS)
│   │   └── iam/                    # 服務帳號與權限
│   ├── environments/               # 按環境配置
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   ├── backend.tf                  # 遠程狀態後端配置
│   └── providers.tf                # Provider 版本與配置
```

---

## Provider 策略

### 主要 Provider

Family OS 設計為雲端無關。每次部署選擇一個主要的雲服務商。Terraform 模塊通過一致的接口封裝不同 Provider 的資源。

### 推薦：AWS

| 資源       | AWS 服務                         |
| ---------- | -------------------------------- |
| Kubernetes | EKS (Elastic Kubernetes Service) |
| PostgreSQL | RDS for PostgreSQL               |
| Redis      | ElastiCache for Redis            |
| 對象存儲   | S3                               |
| DNS        | Route 53                         |
| SSL 證書   | ACM (AWS Certificate Manager)    |
| 密鑰管理   | Secrets Manager                  |

### 替代方案

| 資源       | GCP           | Azure                         |
| ---------- | ------------- | ----------------------------- |
| Kubernetes | GKE           | AKS                           |
| PostgreSQL | Cloud SQL     | Azure Database for PostgreSQL |
| Redis      | Memorystore   | Azure Cache for Redis         |
| 對象存儲   | Cloud Storage | Blob Storage                  |
| DNS        | Cloud DNS     | Azure DNS                     |

---

## 遠程狀態管理

### 規則

- **禁止本地狀態** — 必須使用遠程後端。
- **每個環境獨立狀態文件** — `dev`、`staging`、`prod` 各自獨立。
- **啟用狀態鎖定** — 防止並發修改。
- **加密靜態狀態文件** — 狀態文件可能包含敏感值。
- **使用 `terraform.tfvars`** 存放環境特定值；**永不上傳密鑰到版本控制**。

### AWS 後端示例

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "family-os-terraform-state"
    key            = "environments/dev/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

---

## 關鍵模塊

### 1. 網絡 (Networking)

| 資源             | 說明                        |
| ---------------- | --------------------------- |
| VPC              | 隔離的虛擬私有網絡          |
| 公有子網         | 負載均衡器、NAT 網關        |
| 私有子網         | 數據庫、K8s 工作節點、Redis |
| NAT 網關         | 私有子網的出站流量          |
| Internet Gateway | 公有子網的入站流量          |

### 2. PostgreSQL 數據庫

| 配置項       | dev          | staging       | prod         |
| ------------ | ------------ | ------------- | ------------ |
| 實例類型     | db.t4g.small | db.t4g.medium | db.t4g.large |
| Multi-AZ     | 否           | 可選          | 是           |
| 存儲（初始） | 20 GB        | 50 GB         | 100 GB       |
| 備份保留     | 7 天         | 14 天         | 30 天        |
| 加密         | ✅           | ✅            | ✅           |

### 3. Redis

| 配置項   | dev             | staging         | prod            |
| -------- | --------------- | --------------- | --------------- |
| 節點類型 | cache.t4g.micro | cache.t4g.small | cache.t4g.small |
| 節點數   | 1               | 2               | 3               |
| 快照保留 | 0 天            | 7 天            | 7 天            |

### 4. 對象存儲 (S3)

- **版本控制**：已啟用
- **加密**：AES256 (SSE-S3)
- **公開訪問**：已封鎖
- **生命週期**：30 天後轉移至 Glacier，prod 環境 365 天後過期

### 5. Kubernetes 集群

| 配置項           | dev      | staging   | prod     |
| ---------------- | -------- | --------- | -------- |
| 集群版本         | 1.31     | 1.31      | 1.31     |
| 節點類型         | t3.small | t3.medium | t3.large |
| 節點數 (desired) | 1        | 2         | 3        |
| 節點數範圍       | 1-3      | 1-4       | 3-12     |

### 6. DNS 與 SSL

- Route 53 托管區域管理域名
- ACM 自動簽發/續期 SSL 證書
- 通配符證書覆蓋 `*.familyos.com` 和 `api.familyos.com`

---

## 環境配置

| 環境        | 用途                | 規模 | 多可用區 | 備份  | SSL  |
| ----------- | ------------------- | ---- | -------- | ----- | ---- |
| **dev**     | 本地開發 / 功能分支 | 小   | 否       | 7 天  | 否   |
| **staging** | 發布前 QA           | 中   | 可選     | 14 天 | 可選 |
| **prod**    | 生產環境            | 大   | 是       | 30 天 | 是   |

### 執行命令

```bash
# 初始化
cd infra/terraform/environments/dev
terraform init

# 計劃
terraform plan -var-file="terraform.tfvars" -out=tfplan

# 執行
terraform apply tfplan

# 輸出
terraform output

# 銷毀（僅限 dev！）
terraform destroy -var-file="terraform.tfvars"
```

---

## 安全規則

| 規則   | 措施                                                                      |
| ------ | ------------------------------------------------------------------------- |
| 密鑰   | 存儲於 Secrets Manager / SSM Parameter Store，禁止寫入 `terraform.tfvars` |
| 狀態   | 遠程後端 + 靜態加密 + 狀態鎖定                                            |
| 數據庫 | `storage_encrypted = true`，禁止公開訪問                                  |
| S3     | 封鎖公開訪問，啟用 SSE，啟用版本控制                                      |
| 網絡   | 數據庫置於私有子網，NAT 網關用於出站流量                                  |
| IAM    | 每個環境使用最小權限服務帳號                                              |
| 審計   | 啟用 CloudTrail / Audit Logs 記錄所有 API 調用                            |

---

## CI/CD 整合

```yaml
# .github/workflows/terraform.yml（範例）
name: Terraform

on:
  push:
    branches: [main]
    paths: ['infra/terraform/**']
  pull_request:
    paths: ['infra/terraform/**']

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
      - name: Terraform Format
        run: terraform fmt -check -recursive infra/terraform/
      - name: Terraform Init
        run: terraform init
      - name: Terraform Validate
        run: terraform validate
      - name: Terraform Plan
        run: terraform plan -var-file="environments/dev/terraform.tfvars"
```

---

## Git 工作流

```text
1. 開發者創建分支: feat/add-redis-cluster
2. 修改 infra/terraform/modules/redis/main.tf
3. 發起 PR → CI 執行: terraform fmt → validate → plan
4. Plan 結果以 PR 評論形式發佈
5. 審批通過 → 合併到 main
6. CI 執行: terraform apply
```

---

## 相關文檔

- [部署標準](../deployment.zh.md) — Docker、K8s Helm、反向代理
- [架構標準](../architecture.zh.md) — 系統架構概覽
- [工程規範](../conventions.zh.md) — 通用規範
