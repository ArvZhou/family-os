import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  providers: [MemberResolver, MemberService],
  controllers: [MemberController],
  exports: [MemberService],
})
export class MemberModule {}
