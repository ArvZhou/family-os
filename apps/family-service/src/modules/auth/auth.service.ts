import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  AuthPayload,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResendCodeInput,
  VerificationResult,
  VerifyInput,
} from './models/auth.model';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Spring Boot identity-service base URL
  private readonly identityBaseUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:8080';

  constructor(private readonly httpService: HttpService) {}

  async login(input: LoginInput): Promise<AuthPayload> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.identityBaseUrl}/api/v1/auth/login`, {
        username: input.username,
        password: input.password,
      }),
    );
    return this.mapAuthPayload(data);
  }

  async refresh(input: RefreshTokenInput): Promise<AuthPayload> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.identityBaseUrl}/api/v1/auth/refresh`, {
        refreshToken: input.refreshToken,
      }),
    );
    return this.mapAuthPayload(data);
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.identityBaseUrl}/api/v1/auth/register`, {
          username: input.username,
          password: input.password,
          email: input.email,
          phone: input.phone,
          name: input.name,
        }),
      );
      return this.mapAuthPayload(data);
    } catch (error: any) {
      const status = error.response?.status;
      const body = error.response?.data;
      // Extract the message from the identity-service error response body
      const message = body?.message || error.message;
      this.logger.error(
        `Registration failed — identity-service responded with ${status}: ${JSON.stringify(body)}`,
      );
      throw new Error(message);
    }
  }

  async getMe(
    token: string,
  ): Promise<{ id: string; username: string; email?: string; name: string }> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.identityBaseUrl}/api/v1/auth/me`, {
        headers: { Authorization: token },
      }),
    );
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name,
    };
  }

  async verify(input: VerifyInput): Promise<VerificationResult> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.identityBaseUrl}/api/v1/auth/verify`, {
          target: input.target,
          code: input.code,
        }),
      );
      return { success: true, message: data.message || 'Account verified successfully' };
    } catch (error: any) {
      const body = error.response?.data;
      const message = body?.message || error.message;
      this.logger.error(
        `Verification failed — identity-service responded with ${error.response?.status}: ${JSON.stringify(body)}`,
      );
      return { success: false, message };
    }
  }

  async resendCode(input: ResendCodeInput): Promise<VerificationResult> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.identityBaseUrl}/api/v1/auth/resend-code`, {
          target: input.target,
        }),
      );
      return { success: true, message: data.message || 'Verification code sent' };
    } catch (error: any) {
      const body = error.response?.data;
      const message = body?.message || error.message;
      this.logger.error(
        `Resend code failed — identity-service responded with ${error.response?.status}: ${JSON.stringify(body)}`,
      );
      return { success: false, message };
    }
  }

  private mapAuthPayload(data: any): AuthPayload {
    const user = data.user ?? data;
    return {
      accessToken: data.accessToken ?? '',
      refreshToken: data.refreshToken ?? '',
      expiresIn: data.expiresIn ?? 0,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        name: user.name,
      },
    };
  }
}
