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
