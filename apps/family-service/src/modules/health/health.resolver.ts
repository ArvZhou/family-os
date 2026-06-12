import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { HealthService } from './health.service';
import {
  CreateHealthRecordInput,
  HealthRecord,
  HealthRecordConnection,
  HealthRecordListInput,
  HealthTrend,
  HealthTrendInput,
} from './health.types';

@Resolver(() => HealthRecord)
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => HealthRecordConnection, {
    description: 'List health records for one family member.',
  })
  async healthRecords(
    @Args('input') input: HealthRecordListInput,
    @Context() ctx: any,
  ): Promise<HealthRecordConnection> {
    const token = ctx?.req?.headers?.authorization;
    return this.healthService.listRecords(input, token);
  }

  @Query(() => HealthRecord, {
    nullable: true,
    description: 'Get a single health record by ID.',
  })
  async healthRecord(@Args('id') id: string, @Context() ctx: any): Promise<HealthRecord | null> {
    const token = ctx?.req?.headers?.authorization;
    return this.healthService.getRecord(id, token);
  }

  @Query(() => HealthTrend, {
    description: 'Get trend data for a family member and health metric.',
  })
  async healthTrend(
    @Args('input') input: HealthTrendInput,
    @Context() ctx: any,
  ): Promise<HealthTrend> {
    const token = ctx?.req?.headers?.authorization;
    return this.healthService.getTrend(input.memberId, input.type, input.period, token);
  }

  @Mutation(() => HealthRecord, {
    description: 'Create a new health record.',
  })
  async createHealthRecord(
    @Args('input') input: CreateHealthRecordInput,
    @Context() ctx: any,
  ): Promise<HealthRecord> {
    const token = ctx?.req?.headers?.authorization;
    return this.healthService.createRecord(input, token);
  }
}
