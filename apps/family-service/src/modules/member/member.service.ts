import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Member, CreateMemberInput, UpdateMemberInput } from './models/member.model';

@Injectable()
export class MemberService {
  private readonly identityBaseUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:8080';

  constructor(private readonly httpService: HttpService) {}

  async findAll(token: string): Promise<Member[]> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.identityBaseUrl}/api/v1/members`, {
        headers: { Authorization: token },
      }),
    );
    return data.map((m: any) => this.mapMember(m));
  }

  async findById(token: string, id: string): Promise<Member | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.identityBaseUrl}/api/v1/members/${id}`, {
          headers: { Authorization: token },
        }),
      );
      return this.mapMember(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(token: string, input: CreateMemberInput): Promise<Member> {
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.identityBaseUrl}/api/v1/members`,
        {
          name: input.name,
          birthday: input.birthday,
          relationType: input.relation,
          avatarUrl: input.avatarUrl,
        },
        {
          headers: { Authorization: token },
        },
      ),
    );
    return this.mapMember(data);
  }

  async update(token: string, id: string, input: UpdateMemberInput): Promise<Member> {
    const { data } = await firstValueFrom(
      this.httpService.put(
        `${this.identityBaseUrl}/api/v1/members/${id}`,
        {
          name: input.name,
          birthday: input.birthday,
          relationType: input.relation,
          avatarUrl: input.avatarUrl,
        },
        {
          headers: { Authorization: token },
        },
      ),
    );
    return this.mapMember(data);
  }

  async delete(token: string, id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.identityBaseUrl}/api/v1/members/${id}`, {
          headers: { Authorization: token },
        }),
      );
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  private mapMember(data: any): Member {
    return {
      id: data.id,
      name: data.name,
      birthday: data.birthday,
      relation: data.relationType as any,
      avatarUrl: data.avatarUrl,
    };
  }
}
