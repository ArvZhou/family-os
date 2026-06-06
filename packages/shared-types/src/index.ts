// =============================================================================
// Family OS — Shared TypeScript Type Definitions
// Business logic does NOT go here.
// =============================================================================

// --- Enums (shared across frontend + backend) ---

export enum Relation {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER',
}

export enum HealthRecordType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  BLOOD_SUGAR = 'BLOOD_SUGAR',
  WEIGHT = 'WEIGHT',
  TEMPERATURE = 'TEMPERATURE',
}

export enum GoalType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum DeviceType {
  SENSOR = 'SENSOR',
  ACTUATOR = 'ACTUATOR',
  CAMERA = 'CAMERA',
  OTHER = 'OTHER',
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
}

export enum TriggerType {
  DEVICE_EVENT = 'DEVICE_EVENT',
  SCHEDULE = 'SCHEDULE',
  HEALTH_THRESHOLD = 'HEALTH_THRESHOLD',
}

export enum ActionType {
  CONTROL_DEVICE = 'CONTROL_DEVICE',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  EXECUTE_SCRIPT = 'EXECUTE_SCRIPT',
}

export enum NotificationChannel {
  WECHAT = 'WECHAT',
  EMAIL = 'EMAIL',
  APP_PUSH = 'APP_PUSH',
}

export enum ArchiveCategory {
  PHOTO = 'PHOTO',
  DOCUMENT = 'DOCUMENT',
  EVENT = 'EVENT',
  OTHER = 'OTHER',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TrendPeriod {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum AnalysisTimeRange {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
}

// --- Common Interfaces ---

export interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface ConnectionEdge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: ConnectionEdge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}
