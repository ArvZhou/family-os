import { Module } from '@nestjs/common';
import { AutomationResolver } from './automation.resolver';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';

@Module({
  providers: [AutomationResolver, AutomationService],
  controllers: [AutomationController],
  exports: [AutomationService],
})
export class AutomationModule {}
