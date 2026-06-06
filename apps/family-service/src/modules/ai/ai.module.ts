import { Module } from '@nestjs/common';
import { AiResolver } from './ai.resolver';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  providers: [AiResolver, AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
