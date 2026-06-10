import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'A user account' })
export class User {
  @Field(() => ID, { description: 'Unique identifier' })
  id!: string;

  @Field({ description: 'Username' })
  username!: string;

  @Field({ nullable: true, description: 'Email address' })
  email?: string;

  @Field({ nullable: true, description: 'Phone number' })
  phone?: string;

  @Field({ description: 'Display name' })
  name!: string;
}
