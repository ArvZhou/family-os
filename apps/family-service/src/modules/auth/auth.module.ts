import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [HttpModule],
  providers: [AuthResolver, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
