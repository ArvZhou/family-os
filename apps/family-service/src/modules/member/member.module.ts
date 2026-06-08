import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MemberResolver } from './member.resolver';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [HttpModule],
  providers: [MemberResolver, MemberService],
  controllers: [MemberController],
  exports: [MemberService],
})
export class MemberModule {}
