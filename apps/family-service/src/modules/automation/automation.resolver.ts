import { Resolver } from '@nestjs/graphql';
import { AutomationService } from './automation.service';

@Resolver()
export class AutomationResolver {
  constructor(private readonly automationService: AutomationService) {}
}
