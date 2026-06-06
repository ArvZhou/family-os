# NestJS Standards

> Framework-specific conventions for NestJS backend services.
> For general engineering conventions, see [../../conventions.md](../../conventions.md).

---

## Role

NestJS serves as the **application layer** — the BFF (Backend for Frontend) and business logic coordinator.

```text
Business Layer
IoT Layer
AI Layer
```

NestJS is **not** the source of truth for identity, permissions, or core data — those belong to the data layer service (e.g., Spring Boot).

---

## Module Structure

Each feature follows a consistent module layout:

```text
health/
├── health.controller.ts
├── health.service.ts
├── health.module.ts
├── dto/
│   ├── create-health-record.dto.ts
│   └── query-health-records.dto.ts
├── entities/
│   └── health-record.entity.ts
├── events/
│   └── health-recorded.event.ts
└── __tests__/
    ├── health.controller.spec.ts
    └── health.service.spec.ts
```

### Rules

- Each module must have a `*.module.ts` file that declares its dependencies.
- Controllers handle HTTP request/response only — no business logic.
- Services contain all business logic.
- DTOs use `class-validator` decorators for input validation.

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Controller | `<Feature>Controller` | `HealthController` |
| Service | `<Feature>Service` | `HealthService` |
| DTO | `<Action><Feature>Dto` | `CreateHealthRecordDto` |
| Entity | `<Feature><Type>Entity` | `HealthRecordEntity` |
| Event | `<Feature><Action>Event` | `HealthRecordedEvent` |
| Module | `<Feature>Module` | `HealthModule` |
| Guard | `<Feature>Guard` | `AuthGuard` |
| Interceptor | `<Feature>Interceptor` | `LoggingInterceptor` |

---

## Layer Pattern

```text
Controller → Service → Repository / External API
```

### Controller

- Handles HTTP request parsing and response formatting.
- Uses `@Body()`, `@Param()`, `@Query()` decorators for input.
- Delegates all logic to the service.
- Returns the service result directly (NestJS handles serialization).

### Service

- Contains all business logic.
- Injects repositories, external API clients, and event emitters.
- Methods should be transactional when modifying multiple entities.

### Repository

- Handles database queries via TypeORM / Prisma / Drizzle.
- Complex queries belong here, not in the service.

---

## Validation

All DTOs must use `class-validator` and `class-transformer`:

```ts
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

export class CreateHealthRecordDto {
  @IsUUID()
  memberId: string;

  @IsEnum(['blood_pressure', 'blood_sugar', 'weight', 'temperature'])
  type: string;

  @IsObject()
  values: Record<string, number>;
}
```

Enable global validation in `main.ts`:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

---

## Event-Driven Architecture

Prefer events for cross-module communication:

```ts
// Emitting
this.eventEmitter.emit('health.recorded', new HealthRecordedEvent(record));

// Listening
@OnEvent('health.recorded')
handleHealthRecorded(event: HealthRecordedEvent) {
  // trigger notification, update analytics, etc.
}
```

### When to Use Events

- Device status updates
- Notifications (WeChat, email, push)
- Automation rule triggers
- Cross-module side effects

---

## MQTT Integration

All device communication goes through MQTT.

```ts
// Subscribing
@SubscribeMessage('device/+/telemetry')
handleTelemetry(@MessagePayload() payload: TelemetryDto) { ... }

// Publishing
this.mqttService.publish(
  'device/device-xyz/command',
  { action: 'turn_on', params: {} },
);
```

- Avoid direct device-to-database communication.
- See [MQTT Design](../../features/mqtt.md) for topic conventions and message formats.

---

## Error Handling

Use NestJS built-in exception classes:

```ts
throw new NotFoundException('Member not found');
throw new BadRequestException('Invalid health record type');
throw new ForbiddenException('No permission to access this record');
```

For custom errors, create a global exception filter:

```ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error, format response
  }
}
```

---

## Testing

Use **Jest** with NestJS testing utilities:

```ts
describe('HealthService', () => {
  let service: HealthService;
  let repository: Repository<HealthRecord>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: getRepositoryToken(HealthRecord), useClass: MockRepository },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('should create a health record', async () => {
    const result = await service.create(dto);
    expect(result).toBeDefined();
  });
});
```

### Rules

- Unit test services with mocked dependencies.
- Integration test controllers with `supertest`.
- Focus on domain logic and edge cases.

---

## Related Documents

- [Engineering Conventions](../../conventions.md) — General conventions
- [API Design Standards](../../api.md) — REST API conventions
- [API Endpoints](../../features/api.md) — Specific endpoint definitions
- [MQTT Design](../../features/mqtt.md) — IoT communication protocol
- [AI Service Design](../../features/ai-service.md) — AI/LLM integration
