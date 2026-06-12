import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { HealthService } from './health.service';
import {
  CreateHealthRecordInput,
  HealthRecord,
  HealthRecordConnection,
  HealthRecordListInput,
  HealthTrend,
  HealthTrendInput,
} from './health.types';

@ApiTags('health')
@Controller('api/v1/health-records')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'List health records' })
  @ApiOkResponse({ type: HealthRecordConnection })
  @ApiQuery({ name: 'memberId', required: true })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'first', required: false, type: Number })
  @ApiQuery({ name: 'after', required: false })
  async list(
    @Query('memberId') memberId: string,
    @Query('type') type?: HealthRecordListInput['type'],
    @Query('first') first?: string,
    @Query('after') after?: string,
  ): Promise<HealthRecordConnection> {
    return this.healthService.listRecords({
      memberId,
      type,
      first: first ? Number(first) : undefined,
      after,
    });
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get health trend' })
  @ApiOkResponse({ type: HealthTrend })
  @ApiQuery({ name: 'memberId', required: true })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'period', required: true })
  async trend(
    @Query('memberId') memberId: string,
    @Query('type') type: HealthTrendInput['type'],
    @Query('period') period: HealthTrendInput['period'],
  ): Promise<HealthTrend> {
    return this.healthService.getTrend(memberId, type, period);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a health record by ID' })
  @ApiOkResponse({ type: HealthRecord })
  @ApiParam({ name: 'id' })
  async getById(@Param('id') id: string): Promise<HealthRecord | null> {
    return this.healthService.getRecord(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a health record' })
  @ApiCreatedResponse({ type: HealthRecord })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() input: CreateHealthRecordInput): Promise<HealthRecord> {
    return this.healthService.createRecord(input);
  }
}
