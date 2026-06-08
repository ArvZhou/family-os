import { Field, ID, ObjectType, InputType, registerEnumType } from '@nestjs/graphql';

export enum Relation {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER',
}

registerEnumType(Relation, {
  name: 'Relation',
  description: 'Family relationship type',
});

@ObjectType({ description: 'A family member profile' })
export class Member {
  @Field(() => ID, { description: 'Unique identifier' })
  id!: string;

  @Field({ description: 'Display name' })
  name!: string;

  @Field({ description: 'Date of birth (ISO format)' })
  birthday!: string;

  @Field(() => Relation, { description: 'Relationship to the account owner' })
  relation!: Relation;

  @Field({ nullable: true, description: 'Avatar URL' })
  avatarUrl?: string;
}

@InputType({ description: 'Input for creating a family member' })
export class CreateMemberInput {
  @Field({ description: 'Display name' })
  name!: string;

  @Field({ description: 'Date of birth (ISO format, yyyy-MM-dd)' })
  birthday!: string;

  @Field(() => Relation, { description: 'Relationship type' })
  relation!: Relation;

  @Field({ nullable: true, description: 'Avatar URL' })
  avatarUrl?: string;
}

@InputType({ description: 'Input for updating a family member' })
export class UpdateMemberInput {
  @Field({ nullable: true, description: 'Display name' })
  name?: string;

  @Field({ nullable: true, description: 'Date of birth (ISO format, yyyy-MM-dd)' })
  birthday?: string;

  @Field(() => Relation, { nullable: true, description: 'Relationship type' })
  relation?: Relation;

  @Field({ nullable: true, description: 'Avatar URL' })
  avatarUrl?: string;
}
