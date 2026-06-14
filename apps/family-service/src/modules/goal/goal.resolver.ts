import { Args, Context, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GoalService } from './goal.service';
import {
  CreateGoalInput,
  Goal,
  GoalConnection,
  GoalListInput,
  GoalStatus,
  GoalType,
  UpdateGoalProgressInput,
} from './goal.types';

@Resolver(() => Goal)
export class GoalResolver {
  constructor(private readonly goalService: GoalService) {}

  @Query(() => GoalConnection, {
    description: 'List goals with optional member, type, and status filters.',
  })
  async goals(
    @Args('memberId', { type: () => ID, nullable: true }) memberId?: string,
    @Args('type', { type: () => GoalType, nullable: true }) type?: GoalType,
    @Args('status', { type: () => GoalStatus, nullable: true }) status?: GoalStatus,
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('after', { nullable: true }) after?: string,
    @Context() ctx?: { req?: { headers?: Record<string, string | undefined> } },
  ): Promise<GoalConnection> {
    const token = ctx?.req?.headers?.authorization;
    return this.goalService.listGoals(
      { memberId, type, status, first, after } satisfies GoalListInput,
      token,
    );
  }

  @Query(() => Goal, { nullable: true, description: 'Get a single goal by ID.' })
  async goal(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx?: { req?: { headers?: Record<string, string | undefined> } },
  ): Promise<Goal | null> {
    const token = ctx?.req?.headers?.authorization;
    return this.goalService.getGoal(id, token);
  }

  @Mutation(() => Goal, { description: 'Create a new goal.' })
  async createGoal(
    @Args('input') input: CreateGoalInput,
    @Context() ctx?: { req?: { headers?: Record<string, string | undefined> } },
  ): Promise<Goal> {
    const token = ctx?.req?.headers?.authorization;
    return this.goalService.createGoal(input, token);
  }

  @Mutation(() => Goal, { nullable: true, description: 'Update the progress of an existing goal.' })
  async updateGoalProgress(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGoalProgressInput,
    @Context() ctx?: { req?: { headers?: Record<string, string | undefined> } },
  ): Promise<Goal | null> {
    const token = ctx?.req?.headers?.authorization;
    return this.goalService.updateGoalProgress(id, input, token);
  }

  @Mutation(() => Boolean, { description: 'Delete a goal.' })
  async deleteGoal(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx?: { req?: { headers?: Record<string, string | undefined> } },
  ): Promise<boolean> {
    const token = ctx?.req?.headers?.authorization;
    return this.goalService.deleteGoal(id, token);
  }
}
