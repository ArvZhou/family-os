import { Resolver } from '@nestjs/graphql';
import { GoalService } from './goal.service';

@Resolver()
export class GoalResolver {
  constructor(private readonly goalService: GoalService) {}
}
