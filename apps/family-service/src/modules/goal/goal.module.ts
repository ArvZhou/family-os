import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoalResolver } from './goal.resolver';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

@Module({
  imports: [HttpModule],
  providers: [GoalResolver, GoalService],
  controllers: [GoalController],
  exports: [GoalService],
})
export class GoalModule {}
