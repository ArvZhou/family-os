import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
}
