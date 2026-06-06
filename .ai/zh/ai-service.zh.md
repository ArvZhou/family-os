# Family OS AI 服务设计

## 概述

NestJS 中的 AI 模块为家庭场景提供智能分析和辅助功能。

### 核心能力

| 能力 | 说明 |
|------|------|
| 健康分析 | 结合 LLM 分析健康记录 |
| 目标推荐 | 基于历史数据推荐可达成的目标 |
| 家庭问答 | 结合家庭上下文回答问题 |
| 自动化建议 | 推荐合适的自动化规则 |
| 档案摘要 | 生成家庭档案摘要 |

---

## 架构设计

```text
用户请求
  ↓
NestJS AI 控制器
  ↓
AI 服务
  ├── 收集上下文数据（健康记录、目标等）
  ├── 构建包含系统指令的提示词
  ├── 调用 LLM API
  └── 解析响应结果
  ↓
返回结果 / 缓存响应
```

---

## 数据流程

### 健康分析示例

```text
1. 客户端请求对成员 X 进行健康分析
2. AI 服务查询该时间段的健康记录
3. 聚合：平均值、趋势、异常值
4. 构建包含数据摘要的结构化提示词
5. 使用"家庭健康顾问"角色发送给 LLM
6. 接收分析文本
7. 返回给客户端 + 存储在档案中
```

### 提示词结构

```
系统指令: 你是一个家庭健康助手。请温暖、专业且简洁地回答。不要给出医学诊断，需要时建议就医。

上下文:
- 成员: 张三，68 岁
- 最近 30 天血压读数：收缩压平均 138，舒张压平均 88
- 6 月 1 日有一次超过 160/100
- 病史：2023 年起轻度高血压

用户问题: 爷爷的血压怎么样？
```

---

## 配置说明

### 环境变量

```bash
LLM_API_KEY=<密钥>
LLM_MODEL=gpt-4o
LLM_BASE_URL=https://api.openai.com/v1   # 或代理/自定义提供商
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2048
LLM_TIMEOUT_MS=30000
```

### 提供商支持

通过策略模式支持多种 LLM 提供商：

| 提供商 | SDK | 使用场景 |
|--------|-----|----------|
| OpenAI | `@anthropic-ai/sdk` / OpenAI SDK | 主要 |
| 阿里云百炼 | 百炼 SDK | 国内部署 |
| 本地 Ollama | HTTP API | 离线模式 |

---

## 模块结构

```
apps/api-nest/src/modules/ai/
├── ai.controller.ts
├── ai.service.ts
├── prompts/
│   ├── health-analyzer.prompt.ts
│   ├── goal-recommender.prompt.ts
│   └── family-chat.prompt.ts
├── strategies/
│   ├── openai.strategy.ts
│   ├── dashscope.strategy.ts
│   └── llm-strategy.interface.ts
├── dtos/
│   ├── analyze-health.dto.ts
│   ├── chat.dto.ts
│   └── recommend-goal.dto.ts
└── ai.module.ts
```

---

## 响应格式

### 结构化分析报告

```json
{
  "summary": "总体评估摘要",
  "details": [
    {
      "metric": "blood_pressure",
      "trend": "slightly_elevated",
      "alert": false,
      "suggestion": "建议定期监测"
    }
  ],
  "recommendations": ["如果...请就医", "..."],
  "riskLevel": "低 | 中 | 高"
}
```

### 对话响应

```json
{
  "message": "AI 生成的回复",
  "sources": ["健康记录-uuid", "目标-uuid"],
  "model": "gpt-4o"
}
```

---

## 缓存策略

为降低成本和提高响应速度，对 AI 响应进行缓存：

| 场景 | 过期时间 | 缓存键模式 |
|------|----------|-----------|
| 健康分析 | 24 小时 | `ai:health:{memberId}:{date}` |
| 目标推荐 | 7 天 | `ai:goal:{memberId}` |
| 对话响应 | 不缓存 | 无 |
| 档案摘要 | 永久 | `ai:archive:{archiveId}` |

---

## 安全与隐私

| 原则 | 措施 |
|------|------|
| 个人信息保护 | 发送 LLM 前隐藏姓名/ID |
| 最小化数据 | 仅发送必要上下文 |
| 非医疗诊断 | 系统提示词明确限制 |
| 审计日志 | 记录所有 AI 请求（不含内容） |
| 用户知情 | 告知用户 AI 正在生成中 |

---

## 未来增强方向

- [ ] 多模型路由（简单任务使用低成本模型）
- [ ] 通过 SSE 流式响应
- [ ] 语音交互（TTS/ASR）
- [ ] 本地向量存储用于家庭知识库（RAG）
- [ ] 定时自动分析（如每周健康报告）
