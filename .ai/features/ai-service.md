# AI Service Design

> Feature spec for AI/LLM integration.
> For general API standards, see [../api.md](../api.md).
> For NestJS module conventions, see [NestJS Standards](../standards/backend/nestjs.md).

## Overview

The AI module in NestJS provides intelligent analysis and assistance for family scenarios.

### Capabilities

| Capability | Description |
|------------|-------------|
| Health Analysis | Analyze health records with LLM |
| Goal Recommendation | Suggest achievable goals based on history |
| Family Q&A | Answer questions using family context |
| Automation Suggestions | Recommend automation rules |
| Archive Summarization | Generate summaries of family archives |

---

## Architecture

```text
User Request
  ↓
NestJS AI Controller
  ↓
AI Service
  ├── Collect context data (health records, goals, etc.)
  ├── Build prompt with system instruction
  ├── Call LLM API
  └── Parse response
  ↓
Return result / Cache response
```

---

## Data Flow

### Health Analysis Example

```text
1. Client requests health analysis for member X
2. AI Service queries health-records for the time range
3. Aggregates: averages, trends, anomalies
4. Builds structured prompt with data summary
5. Sends to LLM with "family health advisor" persona
6. Receives analysis text
7. Returns to client + stores in archive
```

### Prompt Structure

```
System: You are a family health assistant. Be warm, professional, and concise. Do not give medical diagnosis — recommend consulting a doctor when needed.

Context:
- Member: Zhang San, age 68
- Last 30 days blood pressure readings: avg systolic 138, avg diastolic 88
- One reading above 160/100 on June 1
- History: mild hypertension since 2023

User question: How is grandpa's blood pressure?
```

---

## Configuration

### Environment Variables

```bash
LLM_API_KEY=<key>
LLM_MODEL=gpt-4o
LLM_BASE_URL=https://api.openai.com/v1   # or proxy/custom provider
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2048
LLM_TIMEOUT_MS=30000
```

### Provider Support

Support multiple LLM providers via strategy pattern:

| Provider | SDK | Use Case |
|----------|-----|----------|
| OpenAI | `@anthropic-ai/sdk` / OpenAI SDK | Primary |
| Aliyun DashScope | DashScope SDK | Domestic China |
| Local Ollama | HTTP API | Offline mode |

---

## Module Structure

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

## Response Format

### Structured Analysis

```json
{
  "summary": "Brief overall assessment",
  "details": [
    {
      "metric": "blood_pressure",
      "trend": "slightly_elevated",
      "alert": false,
      "suggestion": "Regular monitoring recommended"
    }
  ],
  "recommendations": ["See a doctor if...", "..."],
  "riskLevel": "low | medium | high"
}
```

### Chat Response

```json
{
  "message": "AI generated response",
  "sources": ["health-record-uuid", "goal-uuid"],
  "model": "gpt-4o"
}
```

---

## Caching Strategy

Cache AI responses to reduce cost and improve latency:

| Scenario | TTL | Key Pattern |
|----------|-----|-------------|
| Health analysis | 24 hours | `ai:health:{memberId}:{date}` |
| Goal recommendation | 7 days | `ai:goal:{memberId}` |
| Chat response | No cache | None |
| Archive summary | Permanent | `ai:archive:{archiveId}` |

---

## Safety & Privacy

| Rule | Measure |
|------|---------|
| PII Protection | Mask names/IDs before sending to LLM |
| Data Minimization | Only send necessary context |
| No Medical Diagnosis | System prompt explicitly restricts |
| Audit Log | Log all AI requests (no content) |
| User Consent | Inform user when AI is generating |

---

## Future Enhancements

- [ ] Multi-model routing (use cheaper model for simple tasks)
- [ ] Streaming responses via SSE
- [ ] Voice interaction via TTS/ASR
- [ ] Local vector store for family knowledge base (RAG)
- [ ] Scheduled auto-analysis (e.g., weekly health report)
