import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('api/v1/health-records')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
}
