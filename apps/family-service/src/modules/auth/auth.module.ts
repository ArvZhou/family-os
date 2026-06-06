import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthResolver, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
