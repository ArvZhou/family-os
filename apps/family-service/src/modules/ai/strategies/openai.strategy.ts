import { Injectable } from '@nestjs/common';
import { LlmStrategy } from './llm-strategy.interface';

@Injectable()
export class OpenAiStrategy implements LlmStrategy {
  readonly provider = 'openai';

  async chat(prompt: string, context?: Record<string, unknown>): Promise<string> {
    throw new Error('OpenAI strategy not implemented');
  }
}
