import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArchiveService } from './archive.service';

@ApiTags('archive')
@Controller('api/v1/archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}
}
