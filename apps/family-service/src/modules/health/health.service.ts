import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  CreateHealthRecordInput,
  HealthRecord,
  HealthRecordConnection,
  HealthRecordListInput,
  HealthRecordType,
  HealthRecordValues,
  HealthTrend,
  HealthTrendPoint,
  TrendPeriod,
} from './health.types';

/**
 * Health service — follows the same REST proxy pattern as auth and member modules.
 *
 * Architecture: family-service calls identity-service REST API for all health record
 * persistence. This service NEVER connects to PostgreSQL directly.
 *
 * Identity-service endpoints expected (to be implemented):
 *   GET    /api/v1/health-records?memberId=&type=&first=&after=
 *   GET    /api/v1/health-records/:id
 *   GET    /api/v1/health-records/trend?memberId=&type=&period=
 *   POST   /api/v1/health-records
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly identityBaseUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:8080';

  constructor(private readonly httpService: HttpService) {}

  async listRecords(input: HealthRecordListInput, token?: string): Promise<HealthRecordConnection> {
    try {
      const params: Record<string, string> = { memberId: input.memberId };
      if (input.type) params.type = input.type;
      if (input.first) params.first = String(input.first);
      if (input.after) params.after = input.after;

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = token;

      const { data } = await firstValueFrom(
        this.httpService.get(`${this.identityBaseUrl}/api/v1/health-records`, { params, headers }),
      );
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to list health records — identity-service: ${error.message}`);
      throw error;
    }
  }

  async getRecord(id: string, token?: string): Promise<HealthRecord | null> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = token;

      const { data } = await firstValueFrom(
        this.httpService.get(`${this.identityBaseUrl}/api/v1/health-records/${id}`, { headers }),
      );
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      this.logger.error(`Failed to get health record ${id} — identity-service: ${error.message}`);
      throw error;
    }
  }

  async createRecord(input: CreateHealthRecordInput, token?: string): Promise<HealthRecord> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = token;

      const { data } = await firstValueFrom(
        this.httpService.post(`${this.identityBaseUrl}/api/v1/health-records`, input, { headers }),
      );
      return data;
    } catch (error: any) {
      this.logger.error(`Failed to create health record — identity-service: ${error.message}`);
      throw error;
    }
  }

  async getTrend(
    memberId: string,
    type: HealthRecordType,
    period: TrendPeriod,
    token?: string,
  ): Promise<HealthTrend> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = token;

      const { data } = await firstValueFrom(
        this.httpService.get(`${this.identityBaseUrl}/api/v1/health-records/trend`, {
          params: { memberId, type, period },
          headers,
        }),
      );

      // If identity-service returns raw records, compute trend client-side.
      // If identity-service returns a pre-computed trend, pass it through.
      if (data.points) return data;

      // Fallback: compute trend from raw records returned by identity-service
      const records: HealthRecord[] = Array.isArray(data) ? data : [];
      return this.computeTrend(memberId, type, period, records);
    } catch (error: any) {
      this.logger.error(`Failed to get health trend — identity-service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compute trend data from raw records — pure business logic, no DB access.
   */
  private computeTrend(
    memberId: string,
    type: HealthRecordType,
    period: TrendPeriod,
    records: HealthRecord[],
  ): HealthTrend {
    const points: HealthTrendPoint[] = records.map((record) => {
      const values = record.values ?? ({} as HealthRecordValues);
      const value = this.extractMainValue(type, values);
      return {
        label: record.recordedAt.slice(0, 10),
        value,
        recordedAt: record.recordedAt,
        type: record.type,
        values,
      } satisfies HealthTrendPoint;
    });

    const numericValues = points.map((p) => p.value).filter((v) => Number.isFinite(v));
    const count = points.length;

    return {
      memberId,
      type,
      period,
      points,
      count,
      minValue: numericValues.length ? Math.min(...numericValues) : undefined,
      maxValue: numericValues.length ? Math.max(...numericValues) : undefined,
      averageValue: numericValues.length
        ? Number((numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length).toFixed(2))
        : undefined,
    };
  }

  private extractMainValue(type: HealthRecordType, values: HealthRecordValues): number {
    switch (type) {
      case HealthRecordType.BLOOD_PRESSURE:
        return values.systolic ?? 0;
      case HealthRecordType.BLOOD_SUGAR:
        return values.glucose ?? 0;
      case HealthRecordType.WEIGHT:
        return values.weight ?? 0;
      case HealthRecordType.TEMPERATURE:
        return values.temperature ?? 0;
      default:
        return values.systolic ?? values.glucose ?? values.weight ?? values.temperature ?? 0;
    }
  }
}
