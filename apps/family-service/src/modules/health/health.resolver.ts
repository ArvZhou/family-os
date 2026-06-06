import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { HealthService } from './health.service';

@Resolver('HealthRecord')
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}
}
