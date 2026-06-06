import { Module } from '@nestjs/common';
import { ArchiveResolver } from './archive.resolver';
import { ArchiveController } from './archive.controller';
import { ArchiveService } from './archive.service';

@Module({
  providers: [ArchiveResolver, ArchiveService],
  controllers: [ArchiveController],
  exports: [ArchiveService],
})
export class ArchiveModule {}
