import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType({ description: 'Authentication response with tokens and user info' })
export class AuthPayload {
  @Field({ description: 'JWT access token' })
  accessToken!: string;

  @Field({ description: 'JWT refresh token' })
  refreshToken!: string;

  @Field(() => Int, { description: 'Token expiry in seconds' })
  expiresIn!: number;

  @Field(() => User, { description: 'Authenticated user' })
  user!: User;
}

@InputType({ description: 'Login credentials' })
export class LoginInput {
  @Field({ description: 'Username' })
  username!: string;

  @Field({ description: 'Password' })
  password!: string;
}

@InputType({ description: 'Refresh token input' })
export class RefreshTokenInput {
  @Field({ description: 'Refresh token' })
  refreshToken!: string;
}

@InputType({ description: 'Registration input' })
export class RegisterInput {
  @Field({ description: 'Username' })
  username!: string;

  @Field({ description: 'Password' })
  password!: string;

  @Field({ nullable: true, description: 'Email address' })
  email?: string;

  @Field({ nullable: true, description: 'Phone number' })
  phone?: string;

  @Field({ description: 'Display name' })
  name!: string;
}

@InputType({ description: 'Verify account with code' })
export class VerifyInput {
  @Field({ description: 'Email or phone used during registration' })
  target!: string;

  @Field({ description: '6-digit verification code' })
  code!: string;
}

@InputType({ description: 'Resend verification code' })
export class ResendCodeInput {
  @Field({ description: 'Email or phone to resend code to' })
  target!: string;
}

@ObjectType({ description: 'Verification result' })
export class VerificationResult {
  @Field({ description: 'Whether the operation succeeded' })
  success!: boolean;

  @Field({ description: 'Human-readable message' })
  message!: string;
}
