import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@Controller('api/v1/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
}
