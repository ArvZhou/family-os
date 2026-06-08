import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthPayload, LoginInput, RefreshTokenInput } from './models/auth.model';

@Injectable()
export class AuthService {
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

  private mapAuthPayload(data: any): AuthPayload {
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      user: {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
      },
    };
  }
}
