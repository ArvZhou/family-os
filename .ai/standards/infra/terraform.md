# Terraform — Infrastructure as Code Standards

> **⚠️ Future / Planning:** There is currently no `infra/terraform/` directory in the repository. This document describes the target standard for when Terraform is introduced. Do not attempt to locate Terraform configurations — they do not exist yet.
>
> Framework-agnostic conventions for provisioning cloud infrastructure with Terraform.
> For general deployment standards, see [../../deployment.md](../../deployment.md).

---

## Purpose

Terraform is used to provision and manage all cloud infrastructure resources for Family OS — networking, databases, Kubernetes clusters, managed services, DNS, and SSL certificates. Kubernetes (Helm) handles application deployment; Terraform handles everything beneath it.

**Layer separation:**

```text
Application Layer — Helm charts (apps deployed on K8s)
  ↓
Platform Layer — Kubernetes cluster (EKS / GKE / AKS)
  ↓
Infrastructure Layer — Terraform (VPC, DB, Redis, S3, IAM, DNS)
```

---

## Repository Structure

Following the monorepo layout defined in `infra/`:

```text
infra/
├── docker/                         # Local dev (Docker Compose)
├── k8s/charts/                     # Application deployment (Helm)
├── terraform/                      # Cloud infrastructure (Terraform)
│   ├── modules/                    # Reusable Terraform modules
│   │   ├── networking/             # VPC, subnets, NAT, firewall
│   │   ├── database/               # PostgreSQL (RDS / Cloud SQL)
│   │   ├── kubernetes/             # K8s cluster (EKS / GKE / AKS)
│   │   ├── redis/                  # Managed Redis (ElastiCache / Memorystore)
│   │   ├── storage/                # Object storage (S3 / GCS / Blob)
│   │   ├── dns/                    # DNS zones & records (Route 53 / Cloud DNS)
│   │   └── iam/                    # Service accounts & permissions
│   ├── environments/               # Per-environment configurations
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── terraform.tfvars
│   │   ├── staging/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── terraform.tfvars
│   │   └── prod/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       ├── outputs.tf
│   │       └── terraform.tfvars
│   ├── backend.tf                  # Remote state backend configuration
│   └── providers.tf                # Provider versions & configuration
├── nginx/                          # Reverse proxy config
├── mqtt/                           # MQTT broker config
└── database/                       # Flyway migration scripts
```

---

## Provider Strategy

### Primary Provider

| Provider                               | Purpose                               |
| -------------------------------------- | ------------------------------------- |
| **Cloud provider** (AWS / GCP / Azure) | Compute, networking, managed services |

Family OS is designed to be cloud-agnostic. Choose one primary cloud provider per deployment. The Terraform modules abstract provider-specific resources behind a consistent interface.

### Recommended: AWS

AWS is the default recommendation for its mature service ecosystem:

| Resource         | AWS Service                      |
| ---------------- | -------------------------------- |
| Kubernetes       | EKS (Elastic Kubernetes Service) |
| PostgreSQL       | RDS for PostgreSQL               |
| Redis            | ElastiCache for Redis            |
| Object Storage   | S3                               |
| DNS              | Route 53                         |
| SSL Certificates | ACM (AWS Certificate Manager)    |
| Secrets          | Secrets Manager                  |
| CDN              | CloudFront                       |

### Alternative Providers

| Resource       | GCP                            | Azure                          |
| -------------- | ------------------------------ | ------------------------------ |
| Kubernetes     | GKE (Google Kubernetes Engine) | AKS (Azure Kubernetes Service) |
| PostgreSQL     | Cloud SQL for PostgreSQL       | Azure Database for PostgreSQL  |
| Redis          | Memorystore for Redis          | Azure Cache for Redis          |
| Object Storage | Cloud Storage                  | Blob Storage                   |
| DNS            | Cloud DNS                      | Azure DNS                      |
| SSL / Secrets  | Secret Manager                 | Key Vault                      |

---

## Remote State Management

### Backend Configuration

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

| Provider | Backend      | Lock Table         |
| -------- | ------------ | ------------------ |
| AWS      | S3           | DynamoDB           |
| GCP      | GCS          | (built-in lock)    |
| Azure    | Blob Storage | (lease-based lock) |

### Rules

- **Never store state locally** — always use a remote backend.
- **State file per environment** — separate state for `dev`, `staging`, `prod`.
- **Enable state locking** — prevent concurrent modifications.
- **Encrypt state at rest** — state files may contain sensitive values.
- **Use `terraform.tfvars`** for environment-specific values; never commit secrets.

---

## Terraform Configuration

### providers.tf

```hcl
# providers.tf
terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.32"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.15"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
```

### variables.tf

```hcl
# variables.tf
variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "family-os"
}

# --- Networking ---
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for high availability"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"]
}

# --- Database ---
variable "db_instance_class" {
  description = "PostgreSQL instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "family_os"
}

variable "db_multi_az" {
  description = "Enable multi-AZ for production databases"
  type        = bool
  default     = false
}

# --- Kubernetes ---
variable "cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.31"
}

variable "node_instance_types" {
  description = "Worker node instance types"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 6
}

# --- Redis ---
variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t4g.micro"
}

# --- DNS ---
variable "domain_name" {
  description = "Base domain for the application"
  type        = string
  default     = "familyos.com"
}
```

### terraform.tfvars (per environment)

```hcl
# environments/dev/terraform.tfvars
environment = "dev"
aws_region  = "ap-southeast-1"

vpc_cidr            = "10.1.0.0/16"
availability_zones  = ["ap-southeast-1a", "ap-southeast-1b"]

db_instance_class   = "db.t4g.small"
db_multi_az         = false
db_backup_retention = 7

node_instance_types = ["t3.small"]
node_desired_size   = 1
node_min_size       = 1
node_max_size       = 3

redis_node_type     = "cache.t4g.micro"

domain_name         = "dev.familyos.dev"
enable_ssl          = false
```

```hcl
# environments/prod/terraform.tfvars
environment = "prod"
aws_region  = "ap-southeast-1"

vpc_cidr            = "10.0.0.0/16"
availability_zones  = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"]

db_instance_class   = "db.t4g.large"
db_multi_az         = true
db_backup_retention = 30

node_instance_types = ["t3.large"]
node_desired_size   = 3
node_min_size       = 3
node_max_size       = 12

redis_node_type     = "cache.t4g.small"

domain_name         = "familyos.com"
enable_ssl          = true
```

---

## Module Standards

### Naming Convention

```
terraform-<provider>-<resource>
```

Examples:

- `terraform-aws-vpc` — networking
- `terraform-aws-rds-postgresql` — managed PostgreSQL
- `terraform-aws-eks` — Kubernetes cluster
- `terraform-aws-elasticache-redis` — managed Redis
- `terraform-aws-s3` — object storage

### Module Structure

Each module must include:

```text
modules/networking/
├── main.tf              # Resource definitions
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── versions.tf          # Provider version constraints
└── README.md            # Module documentation
```

### Resource Tagging

All resources must use consistent tags:

```hcl
locals {
  common_tags = {
    Project     = "family-os"
    Environment = var.environment
    ManagedBy   = "terraform"
    Team        = "family-os"
  }
}
```

---

## Key Modules

### 1. Networking

Provisions the VPC with public and private subnets:

```hcl
# modules/networking/main.tf (representative)
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-vpc"
  })
}

resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-public-${count.index}"
  })
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-private-${count.index}"
  })
}

resource "aws_nat_gateway" "main" {
  count         = var.environment == "prod" ? length(var.availability_zones) : 1
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-nat-${count.index}"
  })
}

resource "aws_eip" "nat" {
  count = var.environment == "prod" ? length(var.availability_zones) : 1
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-nat-eip-${count.index}"
  })
}
```

### 2. PostgreSQL Database

```hcl
# modules/database/main.tf (representative)
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet"
  subnet_ids = var.private_subnet_ids

  tags = local.common_tags
}

resource "aws_db_instance" "postgresql" {
  identifier = "${var.project_name}-${var.environment}-db"

  engine         = "postgres"
  engine_version = "16.3"
  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  allocated_storage     = var.environment == "prod" ? 100 : 20
  max_allocated_storage = 200
  storage_encrypted     = true

  multi_az               = var.db_multi_az
  backup_retention_period = var.db_backup_retention
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:05:00-sun:06:00"

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-db-final-${formatdate("YYYYMMDD-hhmmss", timestamp())}"

  tags = local.common_tags
}

resource "aws_db_parameter_group" "postgresql" {
  name   = "${var.project_name}-${var.environment}-pg-params"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  tags = local.common_tags
}
```

### 3. Redis (ElastiCache)

```hcl
# modules/redis/main.tf (representative)
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-redis-subnet"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id = "${var.project_name}-${var.environment}-redis"

  engine         = "redis"
  engine_version = "7.1"
  node_type      = var.redis_node_type
  num_cache_nodes = var.environment == "prod" ? 3 : 1

  port                    = 6379
  parameter_group_name   = "default.redis7"
  subnet_group_name      = aws_elasticache_subnet_group.main.name
  security_group_ids     = [aws_security_group.redis.id]

  maintenance_window = "sun:06:00-sun:07:00"
  snapshot_window    = "05:00-06:00"
  snapshot_retention_limit = var.environment == "prod" ? 7 : 0

  tags = local.common_tags
}
```

### 4. Object Storage (S3)

```hcl
# modules/storage/main.tf (representative)
resource "aws_s3_bucket" "archive" {
  bucket = "${var.project_name}-${var.environment}-archive"

  tags = local.common_tags
}

resource "aws_s3_bucket_versioning" "archive" {
  bucket = aws_s3_bucket.archive.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "archive" {
  bucket = aws_s3_bucket.archive.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "archive" {
  bucket = aws_s3_bucket.archive.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "archive" {
  bucket = aws_s3_bucket.archive.id

  rule {
    id     = "archive-to-glacier"
    status = "Enabled"

    transition {
      days          = var.environment == "prod" ? 30 : 7
      storage_class = "GLACIER"
    }

    expiration {
      days = var.environment == "prod" ? 365 : 90
    }
  }
}
```

### 5. Kubernetes Cluster (EKS)

```hcl
# modules/kubernetes/main.tf (representative)
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.24"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = var.cluster_version

  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  cluster_endpoint_public_access = true

  cluster_addons = {
    coredns = { most_recent = true }
    kube-proxy = { most_recent = true }
    vpc-cni = { most_recent = true }
  }

  eks_managed_node_groups = {
    main = {
      instance_types = var.node_instance_types
      desired_size   = var.node_desired_size
      min_size       = var.node_min_size
      max_size       = var.node_max_size

      tags = local.common_tags
    }
  }

  tags = local.common_tags
}
```

### 6. DNS & SSL

```hcl
# modules/dns/main.tf (representative)
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = local.common_tags
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.alb_dns_name]
}

resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}",
    "api.${var.domain_name}",
  ]

  tags = local.common_tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}
```

---

## Per-Environment Configuration

### Environment Mapping

| Environment | Purpose                      | Resource Sizing                | Multi-AZ | Backups | SSL      |
| ----------- | ---------------------------- | ------------------------------ | -------- | ------- | -------- |
| **dev**     | Local dev / feature branches | Small (t4g.small, t3.small)    | No       | 7 days  | No       |
| **staging** | Pre-release QA               | Medium (t4g.medium, t3.medium) | Optional | 14 days | Optional |
| **prod**    | Live production              | Large (t4g.large, t3.large)    | Yes      | 30 days | Yes      |

### Applying Terraform

```bash
# 1. Initialize
cd infra/terraform/environments/dev
terraform init

# 2. Plan
terraform plan -var-file="terraform.tfvars" -out=tfplan

# 3. Apply
terraform apply tfplan

# 4. Verify
terraform output

# 5. Destroy (dev only!)
terraform destroy -var-file="terraform.tfvars"
```

---

## Security

| Rule     | Measure                                                                     |
| -------- | --------------------------------------------------------------------------- |
| Secrets  | Store in Secrets Manager / SSM Parameter Store, never in `terraform.tfvars` |
| State    | Remote backend with encryption at rest + state locking                      |
| Database | `storage_encrypted = true`, no public accessibility                         |
| S3       | Block public access, SSE enabled, versioning enabled                        |
| Network  | Private subnets for databases, NAT gateways for egress                      |
| IAM      | Least-privilege service accounts per environment                            |
| Audit    | Enable CloudTrail / Audit Logs for all API calls                            |

---

## CI/CD Integration

Terraform runs as part of the CI/CD pipeline:

```yaml
# .github/workflows/terraform.yml (representative)
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
        with:
          terraform_version: '1.9'

      - name: Terraform Format
        run: terraform fmt -check -recursive infra/terraform/

      - name: Terraform Init
        run: terraform init -backend-config="environments/dev/backend.hcl"

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        run: terraform plan -var-file="environments/dev/terraform.tfvars"
```

---

## Git Workflow

```text
1. Developer creates branch: feat/add-redis-cluster
2. Modifies infra/terraform/modules/redis/main.tf
3. Opens PR → CI runs: terraform fmt → validate → plan
4. Plan output posted as PR comment
5. Approved → merge to main
6. CI runs: terraform apply on main
```

---

## Related Documents

- [Deployment Standards](../../deployment.md) — Docker, K8s Helm, reverse proxy
- [Architecture Standards](../../architecture.md) — System architecture overview
- [Engineering Conventions](../../conventions.md) — General conventions
