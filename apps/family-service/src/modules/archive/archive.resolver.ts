import { Resolver } from '@nestjs/graphql';
import { ArchiveService } from './archive.service';

@Resolver()
export class ArchiveResolver {
  constructor(private readonly archiveService: ArchiveService) {}
}
