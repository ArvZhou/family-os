import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export enum GoalType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(GoalType, { name: 'GoalType', description: 'Goal cadence and time horizon.' });
registerEnumType(GoalStatus, { name: 'GoalStatus', description: 'Lifecycle state of a goal.' });

@ObjectType({ description: 'A family goal.' })
export class Goal {
  @Field(() => ID, { description: 'Unique identifier.' })
  id!: string;

  @Field(() => ID, { description: 'Associated family member identifier.' })
  memberId!: string;

  @Field({ description: 'Goal title.' })
  title!: string;

  @Field(() => GoalType, { description: 'Goal cadence and time horizon.' })
  type!: GoalType;

  @Field({ description: 'Target value to reach.' })
  targetValue!: number;

  @Field({ description: 'Current progress value.' })
  currentValue!: number;

  @Field({ description: 'Measurement unit.' })
  unit!: string;

  @Field({ description: 'Goal start date in ISO format (yyyy-MM-dd).' })
  startDate!: string;

  @Field({ description: 'Goal end date in ISO format (yyyy-MM-dd).' })
  endDate!: string;

  @Field(() => GoalStatus, { description: 'Goal lifecycle status.' })
  status!: GoalStatus;

  @Field({ description: 'Progress percentage from 0 to 100.' })
  progress!: number;

  @Field({ description: 'Creation timestamp in ISO 8601 format.' })
  createdAt!: string;

  @Field({ description: 'Last update timestamp in ISO 8601 format.' })
  updatedAt!: string;
}

@ObjectType({ description: 'Goal edge for cursor pagination.' })
export class GoalEdge {
  @Field(() => Goal, { description: 'Goal node.' })
  node!: Goal;

  @Field({ description: 'Opaque cursor for pagination.' })
  cursor!: string;
}

@ObjectType({ description: 'Pagination metadata for goal queries.' })
export class PageInfo {
  @Field({ description: 'Whether more pages exist after the current window.' })
  hasNextPage!: boolean;

  @Field({ description: 'Whether previous pages exist before the current window.' })
  hasPreviousPage!: boolean;

  @Field({ nullable: true, description: 'Cursor for the first item in the current window.' })
  startCursor?: string;

  @Field({ nullable: true, description: 'Cursor for the last item in the current window.' })
  endCursor?: string;
}

@ObjectType({ description: 'Paginated goal connection.' })
export class GoalConnection {
  @Field(() => [GoalEdge], { description: 'Paginated goal edges.' })
  edges!: GoalEdge[];

  @Field(() => PageInfo, { description: 'Pagination metadata.' })
  pageInfo!: PageInfo;

  @Field(() => Int, { description: 'Total matching goals.' })
  totalCount!: number;
}

@InputType({ description: 'Input for creating a goal.' })
export class CreateGoalInput {
  @Field(() => ID, { description: 'Associated family member identifier.' })
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  memberId!: string;

  @Field({ description: 'Goal title.' })
  @ApiProperty({ example: '每天走 8000 步' })
  @IsString()
  title!: string;

  @Field(() => GoalType, { description: 'Goal cadence and time horizon.' })
  @ApiProperty({ enum: GoalType })
  @IsEnum(GoalType)
  type!: GoalType;

  @Field({ description: 'Target value to reach.' })
  @ApiProperty({ example: 8000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  targetValue!: number;

  @Field({ nullable: true, description: 'Current progress value.' })
  @ApiPropertyOptional({ example: 1200 })
  @ValidateIf((_, value) => value !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @Field({ description: 'Measurement unit.' })
  @ApiProperty({ example: 'steps' })
  @IsString()
  unit!: string;

  @Field({ description: 'Goal start date in ISO format (yyyy-MM-dd).' })
  @ApiProperty({ example: '2026-06-14' })
  @IsDateString()
  startDate!: string;

  @Field({ description: 'Goal end date in ISO format (yyyy-MM-dd).' })
  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  endDate!: string;
}

@InputType({ description: 'Input for updating goal progress.' })
export class UpdateGoalProgressInput {
  @Field({ description: 'Current progress value.' })
  @ApiProperty({ example: 4200 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentValue!: number;
}

@InputType({ description: 'Filters for listing goals.' })
export class GoalListInput {
  @Field(() => ID, { nullable: true, description: 'Optional family member identifier filter.' })
  @ApiPropertyOptional({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => GoalType, { nullable: true, description: 'Optional goal cadence filter.' })
  @ApiPropertyOptional({ enum: GoalType })
  @IsOptional()
  @IsEnum(GoalType)
  type?: GoalType;

  @Field(() => GoalStatus, { nullable: true, description: 'Optional goal status filter.' })
  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @Field(() => Int, { nullable: true, description: 'Number of goals to fetch.' })
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  first?: number;

  @Field({ nullable: true, description: 'Opaque cursor of the last seen goal.' })
  @ApiPropertyOptional({ example: 'goal_123' })
  @IsOptional()
  @IsString()
  after?: string;
}
