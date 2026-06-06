import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AutomationService } from './automation.service';

@ApiTags('automation')
@Controller('api/v1/automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}
}
