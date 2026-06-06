import { Injectable } from '@nestjs/common';
import { LlmStrategy } from './llm-strategy.interface';

@Injectable()
export class DashScopeStrategy implements LlmStrategy {
  readonly provider = 'dashscope';

  async chat(prompt: string, context?: Record<string, unknown>): Promise<string> {
    throw new Error('DashScope strategy not implemented');
  }
}
