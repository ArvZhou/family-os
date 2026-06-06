import { Module } from '@nestjs/common';
import { DeviceResolver } from './device.resolver';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
  providers: [DeviceResolver, DeviceService],
  controllers: [DeviceController],
  exports: [DeviceService],
})
export class DeviceModule {}
