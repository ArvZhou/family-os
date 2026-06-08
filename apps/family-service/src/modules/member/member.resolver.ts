import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { Member, CreateMemberInput, UpdateMemberInput } from './models/member.model';
import { UnauthorizedException } from '@nestjs/common';

@Resolver(() => Member)
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Query(() => [Member], { description: 'List all family members' })
  async members(@Context() ctx: any): Promise<Member[]> {
    const token = this.extractToken(ctx);
    return this.memberService.findAll(token);
  }

  @Query(() => Member, { nullable: true, description: 'Get a single member by ID' })
  async member(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx: any,
  ): Promise<Member | null> {
    const token = this.extractToken(ctx);
    return this.memberService.findById(token, id);
  }

  @Mutation(() => Member, { description: 'Create a new family member' })
  async createMember(
    @Args('input') input: CreateMemberInput,
    @Context() ctx: any,
  ): Promise<Member> {
    const token = this.extractToken(ctx);
    return this.memberService.create(token, input);
  }

  @Mutation(() => Member, { description: 'Update an existing family member' })
  async updateMember(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMemberInput,
    @Context() ctx: any,
  ): Promise<Member> {
    const token = this.extractToken(ctx);
    return this.memberService.update(token, id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a family member (soft delete)' })
  async deleteMember(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx: any,
  ): Promise<boolean> {
    const token = this.extractToken(ctx);
    return this.memberService.delete(token, id);
  }

  private extractToken(ctx: any): string {
    const authHeader = ctx?.req?.headers?.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authentication required');
    }
    return authHeader; // Already in format "Bearer <token>"
  }
}
