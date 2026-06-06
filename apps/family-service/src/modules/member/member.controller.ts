import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MemberService } from './member.service';

@ApiTags('member')
@Controller('api/v1/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
}
