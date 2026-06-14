import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoalService } from './goal.service';
import {
  CreateGoalInput,
  Goal,
  GoalConnection,
  GoalListInput,
  UpdateGoalProgressInput,
} from './goal.types';

@ApiTags('goals')
@Controller('api/v1/goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Get()
  @ApiOperation({ summary: 'List goals' })
  @ApiResponse({ status: 200, description: 'Paginated goal collection.', type: GoalConnection })
  listGoals(@Query() query: GoalListInput): Promise<GoalConnection> {
    return this.goalService.listGoals(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal by ID' })
  @ApiParam({ name: 'id', description: 'Goal identifier' })
  @ApiResponse({ status: 200, description: 'Goal record.', type: Goal })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  getGoal(@Param('id') id: string): Promise<Goal | null> {
    return this.goalService.getGoal(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a goal' })
  @ApiResponse({ status: 201, description: 'Created goal.', type: Goal })
  createGoal(@Body() input: CreateGoalInput): Promise<Goal> {
    return this.goalService.createGoal(input);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update goal progress' })
  @ApiParam({ name: 'id', description: 'Goal identifier' })
  @ApiResponse({ status: 200, description: 'Updated goal.', type: Goal })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  updateGoalProgress(
    @Param('id') id: string,
    @Body() input: UpdateGoalProgressInput,
  ): Promise<Goal | null> {
    return this.goalService.updateGoalProgress(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiParam({ name: 'id', description: 'Goal identifier' })
  @ApiResponse({ status: 200, description: 'Whether deletion succeeded.', type: Boolean })
  deleteGoal(@Param('id') id: string): Promise<boolean> {
    return this.goalService.deleteGoal(id);
  }
}
