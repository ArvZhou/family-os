import { Module } from '@nestjs/common';
import { HealthResolver } from './health.resolver';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  providers: [HealthResolver, HealthService],
  controllers: [HealthController],
  exports: [HealthService],
})
export class HealthModule {}
