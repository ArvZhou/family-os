# NestJS Standards

> Framework-specific conventions for NestJS backend services.
> For general engineering conventions, see [../../conventions.md](../../conventions.md).

---

## Role

NestJS serves as the **GraphQL Gateway** and **Application Layer** — the BFF (Backend for Frontend) and business logic coordinator.

```text
GraphQL Gateway (frontend API)
Business Layer (health, goals, archive)
IoT Layer (MQTT)
AI Layer (LLM)
BFF (Backend for Frontend)
```

NestJS is **not** the source of truth for identity, permissions, or core data — those belong to Spring Boot.

---

## Module Structure

Each feature follows a consistent module layout:

```text
health/
├── health.resolver.ts        # GraphQL resolver
├── health.controller.ts      # REST controller (internal)
├── health.service.ts         # Business logic
├── health.module.ts          # Module declaration
├── dto/
│   ├── create-health-record.dto.ts
│   └── query-health-records.dto.ts
├── entities/
│   └── health-record.entity.ts
├── models/
│   └── health-record.model.ts    # GraphQL object type
├── inputs/
│   └── create-health-record.input.ts  # GraphQL input type
├── events/
│   └── health-recorded.event.ts
├── dataloaders/
│   └── health-record.loader.ts   # DataLoader for N+1 prevention
└── __tests__/
    ├── health.resolver.spec.ts
    └── health.service.spec.ts
```

### Rules

- Each module must have a `*.module.ts` file.
- **Resolvers** handle GraphQL queries/mutations — delegate to service.
- **Controllers** handle REST requests — delegate to service.
- **Services** contain all business logic.
- **DTOs** use `class-validator` for validation.
- **Models** define GraphQL object types.
- **DataLoaders** batch and cache related entity loading.

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Resolver | `<Feature>Resolver` | `HealthResolver` |
| Controller | `<Feature>Controller` | `HealthController` |
| Service | `<Feature>Service` | `HealthService` |
| DTO | `<Action><Feature>Dto` | `CreateHealthRecordDto` |
| Entity | `<Feature><Type>Entity` | `HealthRecordEntity` |
| GraphQL Model | `<Feature>` (same as type name) | `HealthRecord` |
| GraphQL Input | `<Action><Feature>Input` | `CreateHealthRecordInput` |
| Event | `<Feature><Action>Event` | `HealthRecordedEvent` |
| DataLoader | `<Feature>Loader` | `HealthRecordLoader` |
| Module | `<Feature>Module` | `HealthModule` |
| Guard | `<Feature>Guard` | `AuthGuard`, `SsoGuard` |
| Interceptor | `<Feature>Interceptor` | `LoggingInterceptor` |

---

## GraphQL

### Setup

Use `@nestjs/graphql` with code-first approach:

```ts
// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'schema.graphql'),
  sortSchema: true,
  playground: process.env.NODE_ENV !== 'production',
  introspection: process.env.NODE_ENV !== 'production',
  subscriptions: {
    'graphql-ws': true,
  },
  context: ({ req }) => ({ req }),
}),
```

### Resolver Conventions

```ts
@Resolver(() => Member)
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Query(() => [Member], { description: 'List all family members' })
  async members(): Promise<Member[]> {
    return this.memberService.findAll();
  }

  @Query(() => Member, { nullable: true, description: 'Get member by ID' })
  async member(@Args('id', { type: () => ID }) id: string): Promise<Member | null> {
    return this.memberService.findOne(id);
  }

  @Mutation(() => Member, { description: 'Create a new family member' })
  async createMember(@Args('input') input: CreateMemberInput): Promise<Member> {
    return this.memberService.create(input);
  }

  @ResolveField(() => HealthRecordConnection, { description: 'Health records for this member' })
  async healthRecords(
    @Parent() member: Member,
    @Args() pagination: PaginationArgs,
  ): Promise<HealthRecordConnection> {
    return this.memberService.getHealthRecords(member.id, pagination);
  }
}
```

### GraphQL Model (Object Type)

```ts
@ObjectType({ description: 'A family member profile' })
export class Member {
  @Field(() => ID, { description: 'Unique identifier' })
  id: string;

  @Field({ description: 'Display name' })
  name: string;

  @Field(() => Date, { description: 'Date of birth' })
  birthday: Date;

  @Field(() => Relation, { description: 'Relationship to account owner' })
  relation: Relation;

  @Field({ nullable: true, description: 'Avatar URL' })
  avatarUrl?: string;

  @Field(() => DateTime, { description: 'Created timestamp' })
  createdAt: Date;
}
```

### GraphQL Input Type

```ts
@InputType({ description: 'Input for creating a member' })
export class CreateMemberInput {
  @Field({ description: 'Display name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Date, { description: 'Date of birth' })
  @IsDate()
  birthday: Date;

  @Field(() => Relation, { description: 'Relationship type' })
  @IsEnum(Relation)
  relation: Relation;

  @Field({ nullable: true, description: 'Avatar URL' })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
```

### Enum

```ts
registerEnumType(Relation, {
  name: 'Relation',
  description: 'Family relationship type',
});

export enum Relation {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER',
}
```

### DataLoaders (N+1 Prevention)

```ts
@Injectable()
export class MemberLoader {
  constructor(private readonly memberService: MemberService) {}

  createByIdLoader(): DataLoader<string, Member> {
    return new DataLoader(async (ids: readonly string[]) => {
      const members = await this.memberService.findByIds([...ids]);
      const memberMap = new Map(members.map(m => [m.id, m]));
      return ids.map(id => memberMap.get(id) ?? new Error(`Member ${id} not found`));
    });
  }
}
```

Register loaders in the GraphQL context and use them in resolvers:

```ts
@ResolveField(() => Member)
async member(@Parent() record: HealthRecord, @Context() ctx: any): Promise<Member> {
  return ctx.loaders.memberById.load(record.memberId);
}
```

### Subscriptions

```ts
@Subscription(() => DeviceStatusEvent, {
  description: 'Subscribe to device status changes',
})
deviceStatusChanged(
  @Args('deviceId', { type: () => ID, nullable: true }) deviceId?: string,
) {
  return this.pubSub.asyncIterator('deviceStatusChanged');
}
```

### Schema Export

- The generated `schema.graphql` is committed to the repository.
- Frontend uses `graphql-codegen` to generate TypeScript types from this schema.

---

## Swagger (REST Documentation)

### Setup

```ts
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Family OS API')
  .setDescription('REST API for internal service communication')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('members', 'Family member management')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Controller Decorators

```ts
@ApiTags('members')
@Controller('api/v1/members')
export class MemberController {
  @Get()
  @ApiOperation({ summary: 'List all members' })
  @ApiResponse({ status: 200, type: [MemberResponseDto] })
  async findAll(): Promise<MemberResponseDto[]> { ... }

  @Post()
  @ApiOperation({ summary: 'Create a member' })
  @ApiResponse({ status: 201, type: MemberResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateMemberDto): Promise<MemberResponseDto> { ... }
}
```

### DTO Decorators

```ts
export class CreateMemberDto {
  @ApiProperty({ description: 'Display name', example: 'Alice' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-15' })
  @IsDateString()
  birthday: string;
}
```

### Swagger UI

- Development: available at `/api/docs`
- Production: disabled or restricted to internal network (`/api/docs` returns 404)

---

## Validation

All DTOs must use `class-validator` and `class-transformer`:

```ts
export class CreateHealthRecordDto {
  @IsUUID()
  memberId: string;

  @IsEnum(HealthRecordType)
  type: HealthRecordType;

  @IsObject()
  values: Record<string, number>;
}
```

Enable global validation:

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
handleHealthRecorded(event: HealthRecordedEvent) { ... }
```

### When to Use Events

- Device status updates
- Notifications (WeChat, email, push)
- Automation rule triggers
- Cross-module side effects

---

## MQTT Integration

All device communication goes through MQTT:

```ts
@SubscribeMessage('device/+/telemetry')
handleTelemetry(@MessagePayload() payload: TelemetryDto) { ... }

this.mqttService.publish('device/device-xyz/command', { action: 'turn_on' });
```

See [MQTT Design](../../features/mqtt.md) for topic conventions and message formats.

---

## PostgreSQL / ORM

### Recommended: Prisma or TypeORM

Choose one ORM per project and stick with it:

| ORM | Strengths |
|-----|-----------|
| **Prisma** | Type-safe queries, auto-generated types, schema-first migrations |
| **TypeORM** | Decorator-based entities, tight NestJS integration, Active Record + Data Mapper |

### Entity Example (TypeORM)

```ts
@Entity('health_records')
export class HealthRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'member_id' })
  memberId: string;

  @Column({ type: 'enum', enum: HealthRecordType })
  type: HealthRecordType;

  @Column({ type: 'jsonb' })
  values: Record<string, number>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => MemberEntity, member => member.healthRecords)
  member: MemberEntity;
}
```

### Rules

- Table names: `snake_case` plural.
- Column names: `snake_case`.
- Primary keys: `UUID`.
- Every table: `created_at`, `updated_at` timestamps.

---

## SSO / Authentication

### Guards

```ts
// JWT Auth Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// SSO Guard (OAuth2/OIDC)
@Injectable()
export class SsoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Verify SSO token or redirect to SSO provider
  }
}
```

### Passport Strategies

```ts
// Local strategy (username/password)
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  async validate(username: string, password: string): Promise<User> { ... }
}

// OAuth2/OIDC strategy (SSO)
@Injectable()
export class SsoStrategy extends PassportStrategy(Strategy, 'sso') {
  constructor() {
    super({
      issuer: process.env.SSO_ISSUER_URL,
      clientID: process.env.SSO_CLIENT_ID,
      clientSecret: process.env.SSO_CLIENT_SECRET,
      callbackURL: process.env.SSO_REDIRECT_URI,
      scope: process.env.SSO_SCOPES?.split(' ') ?? ['openid', 'profile', 'email'],
    });
  }

  async validate(issuer: string, profile: any): Promise<SsoUser> { ... }
}
```

### SSO Controller

```ts
@Controller('api/v1/auth/sso')
export class SsoController {
  @Get('login')
  @UseGuards(AuthGuard('sso'))
  login() {
    // Redirects to SSO provider
  }

  @Get('callback')
  @UseGuards(AuthGuard('sso'))
  async callback(@Req() req: Request) {
    // Exchange SSO identity for internal JWT
    return this.authService.ssoLogin(req.user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request) {
    // End SSO session
    return this.authService.ssoLogout(req.user);
  }
}
```

### Configuration

```bash
SSO_ENABLED=false
SSO_PROVIDER=keycloak
SSO_ISSUER_URL=https://sso.example.com/realms/family-os
SSO_CLIENT_ID=family-os
SSO_CLIENT_SECRET=<secret>
SSO_REDIRECT_URI=http://localhost:4000/api/v1/auth/sso/callback
SSO_SCOPES=openid profile email
```

---

## Error Handling

Use NestJS built-in exception classes:

```ts
throw new NotFoundException('Member not found');
throw new BadRequestException('Invalid health record type');
throw new ForbiddenException('No permission to access this record');
```

For GraphQL, errors are automatically formatted:

```json
{
  "errors": [{
    "message": "Member not found",
    "extensions": { "code": "NOT_FOUND" }
  }]
}
```

---

## Testing

Use **Jest** with NestJS testing utilities:

```ts
describe('HealthResolver', () => {
  let resolver: HealthResolver;
  let service: HealthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HealthResolver,
        { provide: HealthService, useClass: MockHealthService },
      ],
    }).compile();

    resolver = module.get(HealthResolver);
  });

  it('should return members', async () => {
    const result = await resolver.members();
    expect(result).toBeDefined();
  });
});
```

---

## Related Documents

- [Engineering Conventions](../../conventions.md) — General conventions
- [API Design Standards](../../api.md) — GraphQL & REST conventions
- [API Endpoints](../../features/api.md) — Specific GraphQL operations
- [MQTT Design](../../features/mqtt.md) — IoT communication protocol
- [AI Service Design](../../features/ai-service.md) — AI/LLM integration
