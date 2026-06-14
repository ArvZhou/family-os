import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GraphQLError } from 'graphql';
import {
  CreateGoalInput,
  Goal,
  GoalConnection,
  GoalEdge,
  GoalListInput,
  GoalStatus,
  PageInfo,
  UpdateGoalProgressInput,
} from './goal.types';

interface IdentityGoalResponse {
  id: string;
  userId: string;
  memberId: string;
  title: string;
  type: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface IdentityGoalListResponse {
  items: IdentityGoalResponse[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);
  private readonly identityBaseUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:8080';

  constructor(private readonly httpService: HttpService) {}

  async listGoals(input: GoalListInput, token?: string): Promise<GoalConnection> {
    try {
      const params = this.buildQueryParams(input);
      const headers = this.buildHeaders(token);

      const { data } = await firstValueFrom(
        this.httpService.get(`${this.identityBaseUrl}/api/v1/goals`, { params, headers }),
      );

      return this.mapListResponse(this.normalizeListResponse(data));
    } catch (error: unknown) {
      this.handleHttpError('list goals', error);
    }
  }

  async getGoal(id: string, token?: string): Promise<Goal | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.identityBaseUrl}/api/v1/goals/${id}`, {
          headers: this.buildHeaders(token),
        }),
      );
      return this.mapGoal(data as IdentityGoalResponse);
    } catch (error: unknown) {
      const status = this.getStatus(error);
      if (status === 404) return null;
      this.handleHttpError(`get goal ${id}`, error);
    }
  }

  async createGoal(input: CreateGoalInput, token?: string): Promise<Goal> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.identityBaseUrl}/api/v1/goals`, input, {
          headers: this.buildHeaders(token),
        }),
      );
      return this.mapGoal(data as IdentityGoalResponse);
    } catch (error: unknown) {
      this.handleHttpError('create goal', error);
    }
  }

  async updateGoalProgress(
    id: string,
    input: UpdateGoalProgressInput,
    token?: string,
  ): Promise<Goal | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(`${this.identityBaseUrl}/api/v1/goals/${id}/progress`, input, {
          headers: this.buildHeaders(token),
        }),
      );
      return this.mapGoal(data as IdentityGoalResponse);
    } catch (error: unknown) {
      const status = this.getStatus(error);
      if (status === 404) return null;
      this.handleHttpError(`update goal progress ${id}`, error);
    }
  }

  async deleteGoal(id: string, token?: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.identityBaseUrl}/api/v1/goals/${id}`, {
          headers: this.buildHeaders(token),
        }),
      );
      return true;
    } catch (error: unknown) {
      const status = this.getStatus(error);
      if (status === 404) return false;
      this.handleHttpError(`delete goal ${id}`, error);
    }
  }

  private buildQueryParams(input: GoalListInput): Record<string, string> {
    const params: Record<string, string> = {};
    if (input.memberId) params.memberId = input.memberId;
    if (input.type) params.type = input.type;
    if (input.status) params.status = input.status;
    if (input.first) params.first = String(input.first);
    if (input.after) params.after = input.after;
    return params;
  }

  private buildHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = token;
    }
    return headers;
  }

  private normalizeListResponse(data: unknown): IdentityGoalListResponse {
    if (data && typeof data === 'object' && 'items' in data) {
      return data as IdentityGoalListResponse;
    }
    if (Array.isArray(data)) {
      const items = data as IdentityGoalResponse[];
      return {
        items,
        totalCount: items.length,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: items[0]?.id,
        endCursor: items.at(-1)?.id,
      };
    }
    return {
      items: [],
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  private mapListResponse(data: IdentityGoalListResponse): GoalConnection {
    return {
      edges: data.items.map((item) => ({
        cursor: item.id,
        node: this.mapGoal(item),
      })),
      pageInfo: {
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage,
        startCursor: data.startCursor ?? data.items[0]?.id,
        endCursor: data.endCursor ?? data.items.at(-1)?.id,
      } satisfies PageInfo,
      totalCount: data.totalCount,
    };
  }

  private mapGoal(data: IdentityGoalResponse): Goal {
    return {
      id: data.id,
      memberId: data.memberId,
      title: data.title,
      type: data.type as Goal['type'],
      targetValue: data.targetValue,
      currentValue: data.currentValue,
      unit: data.unit,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status as GoalStatus,
      progress: data.progress,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private handleHttpError(action: string, error: unknown): never {
    const status = this.getStatus(error);
    const message = this.getErrorMessage(error);
    this.logger.error(`Failed to ${action} — identity-service: ${message}`);

    if (status === 400) {
      throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
    }
    if (status === 401) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    if (status === 403) {
      throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
    }
    if (status === 404) {
      throw new GraphQLError('Goal not found', { extensions: { code: 'NOT_FOUND' } });
    }
    throw new GraphQLError('Goal service unavailable', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = error as { response?: { data?: { message?: string } } };
      return response.response?.data?.message || 'Request failed';
    }
    return error instanceof Error ? error.message : String(error);
  }

  private getStatus(error: unknown): number | undefined {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = error as { response?: { status?: number } };
      return response.response?.status;
    }
    return undefined;
  }
}
