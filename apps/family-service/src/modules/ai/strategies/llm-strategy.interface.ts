/**
 * LLM provider strategy interface.
 * Implementations: openai.strategy.ts, dashscope.strategy.ts
 */
export interface LlmStrategy {
  /** Send a prompt and return the response */
  chat(prompt: string, context?: Record<string, unknown>): Promise<string>;
  /** Provider name */
  readonly provider: string;
}
