# 10 — AI 智能分析

## 依赖

- [05-health-records](./05-health-records.md) — 健康数据是 AI 分析的输入
- [06-goals](./06-goals.md) — 目标数据用于推荐

## 用户可感知的交付

- 在成员健康页看到 AI 生成的健康分析摘要
- AI 根据历史数据推荐合适的目标
- 家庭对话助手：用自然语言询问家庭成员情况

## API 设计 (GraphQL)

```graphql
type Query {
  healthAnalysis(input: HealthAnalysisInput!): HealthAnalysisResult!
  goalRecommendations(memberId: ID!, context: String): [GoalRecommendation!]!
}

type Mutation {
  aiChat(input: AIChatInput!): AIChatResponse!
}
```

## 关键实现要点

- LLM 调用在 NestJS 服务层，支持多 provider（OpenAI、DashScope、Ollama）
- **PII 保护**: 发送给 LLM 前脱敏成员姓名和 ID
- **System prompt**: 健康顾问 persona，禁止医疗诊断声明
- **缓存**: 健康分析结果缓存 24h（Redis），减少 LLM 调用成本
- 使用 strategy pattern 切换 LLM provider

## 验收标准

- 输入 30 天血压数据，AI 返回趋势分析 + 建议
- AI 推荐的目标类型、目标值有依据说明
- 聊天对话能回答"妈妈最近血压怎么样"（引用真实数据）
