import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  AuthPayload,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResendCodeInput,
  VerificationResult,
  VerifyInput,
} from './models/auth.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload, { description: 'Login with username and password' })
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayload, { description: 'Refresh access token' })
  async refreshToken(@Args('input') input: RefreshTokenInput): Promise<AuthPayload> {
    return this.authService.refresh(input);
  }

  @Mutation(() => AuthPayload, { description: 'Register a new account' })
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Mutation(() => VerificationResult, {
    description: 'Verify account with code sent to email or phone',
  })
  async verify(@Args('input') input: VerifyInput): Promise<VerificationResult> {
    return this.authService.verify(input);
  }

  @Mutation(() => VerificationResult, { description: 'Resend verification code' })
  async resendCode(@Args('input') input: ResendCodeInput): Promise<VerificationResult> {
    return this.authService.resendCode(input);
  }
}
