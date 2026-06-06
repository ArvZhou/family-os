import { Module } from '@nestjs/common';
import { GoalResolver } from './goal.resolver';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

@Module({
  providers: [GoalResolver, GoalService],
  controllers: [GoalController],
  exports: [GoalService],
})
export class GoalModule {}
