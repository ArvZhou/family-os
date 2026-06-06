import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoalService } from './goal.service';

@ApiTags('goal')
@Controller('api/v1/goal')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}
}
