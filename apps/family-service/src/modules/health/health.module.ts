import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthResolver } from './health.resolver';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [HttpModule],
  providers: [HealthResolver, HealthService],
  controllers: [HealthController],
  exports: [HealthService],
})
export class HealthModule {}
