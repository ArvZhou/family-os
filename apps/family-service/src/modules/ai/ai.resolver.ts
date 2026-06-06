import { Resolver } from '@nestjs/graphql';
import { AiService } from './ai.service';

@Resolver()
export class AiResolver {
  constructor(private readonly aiService: AiService) {}
}
