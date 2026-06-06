# API Endpoints & GraphQL Operations — Family OS

> Specific API definitions for Family OS.
> For general API design standards, see [../api.md](../api.md).

The frontend consumes the **GraphQL API**. REST endpoints exist for internal service-to-service communication and external integrations.

---

## Authentication

### REST (Internal)

#### Login

```
POST /api/v1/auth/login
```

Request:

```json
{
  "username": "string",
  "password": "string"
}
```

Response:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": "number"
}
```

#### Refresh Token

```
POST /api/v1/auth/refresh
```

Request:

```json
{
  "refreshToken": "string"
}
```

#### SSO Login

```
GET /api/v1/auth/sso/login?provider=keycloak
```

Redirects to the SSO provider's authorization page.

#### SSO Callback

```
GET /api/v1/auth/sso/callback?code=<code>&state=<state>
```

Handles the SSO provider callback, exchanges code for tokens, issues internal JWT.

Response:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": "number",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string"
  }
}
```

#### SSO Logout

```
POST /api/v1/auth/sso/logout
```

Ends the SSO session with the provider.

### GraphQL

```graphql
type Mutation {
  """Login with username and password"""
  login(input: LoginInput!): AuthPayload!

  """Refresh access token"""
  refreshToken(input: RefreshTokenInput!): AuthPayload!

  """Logout current session"""
  logout: Boolean!
}

input LoginInput {
  username: String!
  password: String!
}

input RefreshTokenInput {
  refreshToken: String!
}

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  expiresIn: Int!
  user: User!
}

type User {
  id: ID!
  name: String!
  email: String
  avatarUrl: String
}
```

---

## Members

### REST (Internal)

```
GET    /api/v1/members           # List all members
GET    /api/v1/members/:id       # Get member by ID
POST   /api/v1/members           # Create member
PUT    /api/v1/members/:id       # Update member
DELETE /api/v1/members/:id       # Delete member
```

Create/Update request:

```json
{
  "name": "string",
  "birthday": "ISO date",
  "relation": "spouse | parent | child | other",
  "avatarUrl": "string (optional)"
}
```

### GraphQL

```graphql
type Query {
  """List all family members"""
  members: [Member!]!

  """Get a single member by ID"""
  member(id: ID!): Member
}

type Mutation {
  """Create a new family member"""
  createMember(input: CreateMemberInput!): Member!

  """Update an existing family member"""
  updateMember(id: ID!, input: UpdateMemberInput!): Member!

  """Delete a family member"""
  deleteMember(id: ID!): Boolean!
}

"""A family member profile"""
type Member {
  id: ID!
  name: String!
  birthday: Date!
  relation: Relation!
  avatarUrl: String
  healthRecords(first: Int, after: String): HealthRecordConnection!
  goals(first: Int, after: String): GoalConnection!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum Relation {
  SPOUSE
  PARENT
  CHILD
  SIBLING
  OTHER
}

input CreateMemberInput {
  name: String!
  birthday: Date!
  relation: Relation!
  avatarUrl: String
}

input UpdateMemberInput {
  name: String
  birthday: Date
  relation: Relation
  avatarUrl: String
}
```

---

## Health Records

### REST (Internal)

```
GET  /api/v1/health-records?memberId=:id&startDate=:date&endDate=:date
POST /api/v1/health-records
GET  /api/v1/health-records/trend?memberId=:id&type=:type&period=week|month|year
```

Create request:

```json
{
  "memberId": "uuid",
  "type": "blood_pressure | blood_sugar | weight | temperature",
  "values": {
    "systolic": 120,
    "diastolic": 80,
    "heartRate": 72
  }
}
```

### GraphQL

```graphql
type Query {
  """List health records with filtering"""
  healthRecords(
    memberId: ID!
    type: HealthRecordType
    startDate: Date
    endDate: Date
    first: Int
    after: String
  ): HealthRecordConnection!

  """Get health trend for a member"""
  healthTrend(
    memberId: ID!
    type: HealthRecordType!
    period: TrendPeriod!
  ): HealthTrend!
}

type Mutation {
  """Create a health record"""
  createHealthRecord(input: CreateHealthRecordInput!): HealthRecord!
}

enum HealthRecordType {
  BLOOD_PRESSURE
  BLOOD_SUGAR
  WEIGHT
  TEMPERATURE
}

enum TrendPeriod {
  WEEK
  MONTH
  YEAR
}

type HealthRecord {
  id: ID!
  memberId: ID!
  member: Member!
  type: HealthRecordType!
  values: JSON!
  recordedAt: DateTime!
  createdAt: DateTime!
}

type HealthTrend {
  type: HealthRecordType!
  period: TrendPeriod!
  dataPoints: [TrendDataPoint!]!
  average: Float
  min: Float
  max: Float
}

type TrendDataPoint {
  date: Date!
  value: Float!
}

input CreateHealthRecordInput {
  memberId: ID!
  type: HealthRecordType!
  values: JSON!
}
```

---

## Goals

### REST (Internal)

```
GET   /api/v1/goals
POST  /api/v1/goals
PATCH /api/v1/goals/:id/progress
```

Create request:

```json
{
  "memberId": "uuid",
  "title": "string",
  "type": "daily | weekly | monthly | custom",
  "targetValue": "number",
  "unit": "string",
  "startDate": "ISO date",
  "endDate": "ISO date"
}
```

Update progress:

```json
{
  "value": "number",
  "completed": "boolean"
}
```

### GraphQL

```graphql
type Query {
  """List goals with optional filtering"""
  goals(
    memberId: ID
    type: GoalType
    status: GoalStatus
    first: Int
    after: String
  ): GoalConnection!

  """Get a single goal"""
  goal(id: ID!): Goal
}

type Mutation {
  """Create a new goal"""
  createGoal(input: CreateGoalInput!): Goal!

  """Update goal progress"""
  updateGoalProgress(id: ID!, input: UpdateGoalProgressInput!): Goal!

  """Delete a goal"""
  deleteGoal(id: ID!): Boolean!
}

enum GoalType {
  DAILY
  WEEKLY
  MONTHLY
  CUSTOM
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  EXPIRED
}

type Goal {
  id: ID!
  memberId: ID!
  member: Member!
  title: String!
  type: GoalType!
  status: GoalStatus!
  targetValue: Float!
  currentValue: Float!
  unit: String!
  startDate: Date!
  endDate: Date!
  progress: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateGoalInput {
  memberId: ID!
  title: String!
  type: GoalType!
  targetValue: Float!
  unit: String!
  startDate: Date!
  endDate: Date!
}

input UpdateGoalProgressInput {
  value: Float!
  completed: Boolean
}
```

---

## Devices

### REST (Internal)

```
GET  /api/v1/devices
GET  /api/v1/devices/:id
POST /api/v1/devices
```

Register request:

```json
{
  "deviceId": "string (from device)",
  "name": "string",
  "type": "sensor | actuator | camera | other",
  "protocol": "mqtt"
}
```

### GraphQL

```graphql
type Query {
  """List all registered devices"""
  devices(status: DeviceStatus, first: Int, after: String): DeviceConnection!

  """Get a single device"""
  device(id: ID!): Device
}

type Mutation {
  """Register a new device"""
  registerDevice(input: RegisterDeviceInput!): Device!

  """Send a command to a device"""
  sendDeviceCommand(deviceId: ID!, input: DeviceCommandInput!): DeviceCommandResult!
}

type Subscription {
  """Subscribe to device status changes"""
  deviceStatusChanged(deviceId: ID): DeviceStatusEvent!

  """Subscribe to device telemetry"""
  deviceTelemetry(deviceId: ID!): TelemetryEvent!
}

enum DeviceType {
  SENSOR
  ACTUATOR
  CAMERA
  OTHER
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  ERROR
}

type Device {
  id: ID!
  deviceId: String!
  name: String!
  type: DeviceType!
  protocol: String!
  status: DeviceStatus!
  lastSeenAt: DateTime
  createdAt: DateTime!
}

type DeviceStatusEvent {
  deviceId: ID!
  status: DeviceStatus!
  signalStrength: Int
  batteryLevel: Int
  timestamp: DateTime!
}

type TelemetryEvent {
  deviceId: ID!
  type: String!
  value: Float!
  unit: String!
  timestamp: DateTime!
}

input RegisterDeviceInput {
  deviceId: String!
  name: String!
  type: DeviceType!
  protocol: String!
}

input DeviceCommandInput {
  action: String!
  params: JSON
}

type DeviceCommandResult {
  success: Boolean!
  message: String
}
```

---

## Automation Rules

### REST (Internal)

```
GET  /api/v1/automation/rules
POST /api/v1/automation/rules
```

Create request:

```json
{
  "name": "string",
  "trigger": {
    "type": "device_event | schedule | health_threshold",
    "condition": "object"
  },
  "action": {
    "type": "control_device | send_notification | execute_script",
    "target": "string",
    "params": "object"
  }
}
```

### GraphQL

```graphql
type Query {
  """List automation rules"""
  automationRules(first: Int, after: String): AutomationRuleConnection!

  """Get a single rule"""
  automationRule(id: ID!): AutomationRule
}

type Mutation {
  """Create an automation rule"""
  createAutomationRule(input: CreateAutomationRuleInput!): AutomationRule!

  """Update an automation rule"""
  updateAutomationRule(id: ID!, input: UpdateAutomationRuleInput!): AutomationRule!

  """Delete an automation rule"""
  deleteAutomationRule(id: ID!): Boolean!

  """Toggle an automation rule on/off"""
  toggleAutomationRule(id: ID!, enabled: Boolean!): AutomationRule!
}

type AutomationRule {
  id: ID!
  name: String!
  enabled: Boolean!
  trigger: AutomationTrigger!
  action: AutomationAction!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type AutomationTrigger {
  type: TriggerType!
  condition: JSON!
}

type AutomationAction {
  type: ActionType!
  target: String!
  params: JSON
}

enum TriggerType {
  DEVICE_EVENT
  SCHEDULE
  HEALTH_THRESHOLD
}

enum ActionType {
  CONTROL_DEVICE
  SEND_NOTIFICATION
  EXECUTE_SCRIPT
}

input CreateAutomationRuleInput {
  name: String!
  trigger: AutomationTriggerInput!
  action: AutomationActionInput!
}

input UpdateAutomationRuleInput {
  name: String
  trigger: AutomationTriggerInput
  action: AutomationActionInput
}

input AutomationTriggerInput {
  type: TriggerType!
  condition: JSON!
}

input AutomationActionInput {
  type: ActionType!
  target: String!
  params: JSON
}
```

---

## AI Services

### REST (Internal)

```
POST /api/v1/ai/health/analyze
POST /api/v1/ai/goal/recommend
POST /api/v1/ai/chat
```

### GraphQL

```graphql
type Query {
  """Analyze health data for a member"""
  healthAnalysis(input: HealthAnalysisInput!): HealthAnalysisResult!

  """Get goal recommendations for a member"""
  goalRecommendations(memberId: ID!, context: String): [GoalRecommendation!]!
}

type Mutation {
  """Send a chat message to the AI assistant"""
  aiChat(input: AIChatInput!): AIChatResponse!
}

input HealthAnalysisInput {
  memberId: ID!
  timeRange: AnalysisTimeRange!
  focusAreas: [String!]
}

enum AnalysisTimeRange {
  LAST_7_DAYS
  LAST_30_DAYS
  LAST_90_DAYS
}

type HealthAnalysisResult {
  summary: String!
  details: [HealthMetricAnalysis!]!
  recommendations: [String!]!
  riskLevel: RiskLevel!
  analyzedAt: DateTime!
}

type HealthMetricAnalysis {
  metric: String!
  trend: String!
  alert: Boolean!
  suggestion: String
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
}

type GoalRecommendation {
  title: String!
  type: GoalType!
  targetValue: Float!
  unit: String!
  reason: String!
}

input AIChatInput {
  question: String!
  context: JSON
}

type AIChatResponse {
  message: String!
  sources: [String!]
  model: String!
}
```

---

## Notifications

### REST (Internal)

```
POST /api/v1/notifications/send
```

Request:

```json
{
  "memberIds": ["uuid"],
  "channel": "wechat | email | app_push",
  "title": "string",
  "body": "string"
}
```

### GraphQL

```graphql
type Mutation {
  """Send notifications to members"""
  sendNotification(input: SendNotificationInput!): NotificationResult!
}

enum NotificationChannel {
  WECHAT
  EMAIL
  APP_PUSH
}

input SendNotificationInput {
  memberIds: [ID!]!
  channel: NotificationChannel!
  title: String!
  body: String!
}

type NotificationResult {
  success: Boolean!
  sent: Int!
  failed: Int!
}
```

---

## Archive

### REST (Internal)

```
POST /api/v1/archive/files
GET  /api/v1/archive?category=:category&page=:number
```

### GraphQL

```graphql
type Query {
  """List archive files"""
  archive(
    category: ArchiveCategory
    first: Int
    after: String
  ): ArchiveConnection!

  """Get a single archive file"""
  archiveFile(id: ID!): ArchiveFile
}

type Mutation {
  """Upload a file to archive"""
  uploadArchiveFile(input: UploadArchiveFileInput!): ArchiveFile!

  """Delete an archive file"""
  deleteArchiveFile(id: ID!): Boolean!
}

enum ArchiveCategory {
  PHOTO
  DOCUMENT
  EVENT
  OTHER
}

type ArchiveFile {
  id: ID!
  name: String!
  category: ArchiveCategory!
  size: Int!
  mimeType: String!
  url: String!
  uploadedBy: User!
  createdAt: DateTime!
}

input UploadArchiveFileInput {
  name: String!
  category: ArchiveCategory!
  file: Upload!
}
```

---

## Related Documents

- [API Design Standards](../api.md) — General REST & GraphQL conventions
- [AI Service Design](./ai-service.md) — AI/LLM integration details
- [MQTT Design](./mqtt.md) — IoT device communication protocol
