import { Module } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationResolver, NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
