import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';

@ApiTags('device')
@Controller('api/v1/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}
}
