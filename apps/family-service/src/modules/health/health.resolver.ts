import { Resolver, Query } from '@nestjs/graphql';
import { HealthService } from './health.service';

@Resolver('HealthRecord')
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => String, {
    description: 'Returns a lightweight health check response.',
  })
  ping(): string {
    return 'ok';
  }
}
