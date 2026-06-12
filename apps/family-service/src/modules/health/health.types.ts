import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum HealthRecordType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  BLOOD_SUGAR = 'BLOOD_SUGAR',
  WEIGHT = 'WEIGHT',
  TEMPERATURE = 'TEMPERATURE',
  OTHER = 'OTHER',
}

export enum TrendPeriod {
  D7 = 'D7',
  D30 = 'D30',
  D90 = 'D90',
}

registerEnumType(HealthRecordType, {
  name: 'HealthRecordType',
  description: 'Health metric category.',
});

registerEnumType(TrendPeriod, {
  name: 'TrendPeriod',
  description: 'Rolling time window used for health trend queries.',
});

@ObjectType({ description: 'Structured values for a health record.' })
export class HealthRecordValues {
  @Field({ nullable: true, description: 'Systolic pressure in mmHg.' })
  systolic?: number;

  @Field({ nullable: true, description: 'Diastolic pressure in mmHg.' })
  diastolic?: number;

  @Field({ nullable: true, description: 'Blood glucose value.' })
  glucose?: number;

  @Field({ nullable: true, description: 'Body weight.' })
  weight?: number;

  @Field({ nullable: true, description: 'Body temperature.' })
  temperature?: number;

  @Field({ nullable: true, description: 'Measurement unit.' })
  unit?: string;

  @Field({ nullable: true, description: 'Optional notes.' })
  notes?: string;
}

@InputType({ description: 'Structured values for a health record.' })
export class HealthRecordValuesInput {
  @Field({ nullable: true, description: 'Systolic pressure in mmHg.' })
  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  systolic?: number;

  @Field({ nullable: true, description: 'Diastolic pressure in mmHg.' })
  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  diastolic?: number;

  @Field({ nullable: true, description: 'Blood glucose value.' })
  @ApiPropertyOptional({ example: 5.6 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  glucose?: number;

  @Field({ nullable: true, description: 'Body weight.' })
  @ApiPropertyOptional({ example: 62.3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @Field({ nullable: true, description: 'Body temperature.' })
  @ApiPropertyOptional({ example: 36.6 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperature?: number;

  @Field({ nullable: true, description: 'Measurement unit.' })
  @ApiPropertyOptional({ example: 'mmHg' })
  @IsOptional()
  @IsString()
  unit?: string;

  @Field({ nullable: true, description: 'Optional notes.' })
  @ApiPropertyOptional({ example: 'Morning measurement' })
  @IsOptional()
  @IsString()
  notes?: string;
}

@ObjectType({ description: 'A single health record.' })
export class HealthRecord {
  @Field(() => ID, { description: 'Unique identifier.' })
  id!: string;

  @Field(() => ID, { description: 'Associated family member identifier.' })
  memberId!: string;

  @Field(() => HealthRecordType, { description: 'Metric category.' })
  type!: HealthRecordType;

  @Field(() => HealthRecordValues, { description: 'Structured measurement values.' })
  values!: HealthRecordValues;

  @Field({ description: 'Record timestamp in ISO 8601 format.' })
  recordedAt!: string;

  @Field({ description: 'Creation timestamp in ISO 8601 format.' })
  createdAt!: string;
}

@ObjectType({ description: 'Health record edge for cursor pagination.' })
export class HealthRecordEdge {
  @Field(() => HealthRecord, { description: 'Health record node.' })
  node!: HealthRecord;

  @Field({ description: 'Opaque cursor for pagination.' })
  cursor!: string;
}

@ObjectType({ description: 'Pagination state for health record queries.' })
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

@ObjectType({ description: 'Paginated health record connection.' })
export class HealthRecordConnection {
  @Field(() => [HealthRecordEdge], { description: 'Paginated record edges.' })
  edges!: HealthRecordEdge[];

  @Field(() => PageInfo, { description: 'Pagination metadata.' })
  pageInfo!: PageInfo;

  @Field(() => Int, { description: 'Total matching records.' })
  totalCount!: number;
}

@ObjectType({ description: 'A single point in a health trend series.' })
export class HealthTrendPoint {
  @Field({ description: 'Point label suitable for chart axes.' })
  label!: string;

  @Field({ description: 'Numeric value used in charts.' })
  value!: number;

  @Field({ description: 'Original record timestamp in ISO 8601 format.' })
  recordedAt!: string;

  @Field(() => HealthRecordType, { description: 'Metric category.' })
  type!: HealthRecordType;

  @Field(() => HealthRecordValues, { description: 'Structured measurement values.' })
  values!: HealthRecordValues;
}

@ObjectType({ description: 'Trend data for a health metric.' })
export class HealthTrend {
  @Field(() => ID, { description: 'Associated family member identifier.' })
  memberId!: string;

  @Field(() => HealthRecordType, { description: 'Metric category.' })
  type!: HealthRecordType;

  @Field(() => TrendPeriod, { description: 'Requested time window.' })
  period!: TrendPeriod;

  @Field(() => [HealthTrendPoint], { description: 'Trend points ordered by time.' })
  points!: HealthTrendPoint[];

  @Field(() => Int, { description: 'Number of data points in the trend.' })
  count!: number;

  @Field({ nullable: true, description: 'Minimum numeric value across the trend.' })
  minValue?: number;

  @Field({ nullable: true, description: 'Maximum numeric value across the trend.' })
  maxValue?: number;

  @Field({ nullable: true, description: 'Average numeric value across the trend.' })
  averageValue?: number;
}

@InputType({ description: 'Input for creating a health record.' })
export class CreateHealthRecordInput {
  @Field(() => ID, { description: 'Associated family member identifier.' })
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  memberId!: string;

  @Field(() => HealthRecordType, { description: 'Metric category.' })
  @ApiProperty({ enum: HealthRecordType })
  @IsEnum(HealthRecordType)
  type!: HealthRecordType;

  @Field(() => HealthRecordValuesInput, { description: 'Structured measurement values.' })
  @ApiProperty({ type: () => HealthRecordValuesInput })
  @ValidateNested()
  @Type(() => HealthRecordValuesInput)
  values!: HealthRecordValuesInput;

  @Field({ nullable: true, description: 'Record timestamp in ISO 8601 format.' })
  @ApiPropertyOptional({ example: '2026-06-12T08:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  recordedAt?: string;
}

@InputType({ description: 'Filters for listing health records.' })
export class HealthRecordListInput {
  @Field(() => ID, { description: 'Associated family member identifier.' })
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  memberId!: string;

  @Field(() => HealthRecordType, {
    nullable: true,
    description: 'Optional metric category filter.',
  })
  @ApiPropertyOptional({ enum: HealthRecordType })
  @IsOptional()
  @IsEnum(HealthRecordType)
  type?: HealthRecordType;

  @Field(() => Int, { nullable: true, description: 'Number of records to fetch.' })
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  first?: number;

  @Field({ nullable: true, description: 'Opaque cursor of the last seen record.' })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  after?: string;
}

@InputType({ description: 'Filters for health trend queries.' })
export class HealthTrendInput {
  @Field(() => ID, { description: 'Associated family member identifier.' })
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  memberId!: string;

  @Field(() => HealthRecordType, { description: 'Metric category.' })
  @ApiProperty({ enum: HealthRecordType })
  @IsEnum(HealthRecordType)
  type!: HealthRecordType;

  @Field(() => TrendPeriod, { description: 'Requested time window.' })
  @ApiProperty({ enum: TrendPeriod, default: TrendPeriod.D30 })
  @IsEnum(TrendPeriod)
  period!: TrendPeriod;
}
