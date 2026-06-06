# Spring Boot Standards

> Framework-specific conventions for Spring Boot backend services.
> For general engineering conventions, see [../../conventions.md](../../conventions.md).

---

## Role

Spring Boot serves as the **Identity & Core Data Layer** — the system's single source of truth.

```text
Identity (users, authentication, SSO)
Permissions (authorization, RBAC)
Core Data (members, device registry)
```

Spring Boot owns:
- Users and authentication (local + SSO/OAuth2)
- Permissions and role-based access control
- Device registry and metadata
- Family member base data

Other services (NestJS) communicate with Spring Boot via **REST API** — never direct database writes.

---

## Package Structure

Organize by **feature/domain**, not by technical layer:

```text
src/main/java/com/family/
├── auth/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   └── security/              # Spring Security config, OAuth2/OIDC
├── member/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
├── device/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
├── permission/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
└── common/
    ├── config/
    ├── exception/
    ├── security/
    └── util/
```

### Rules

- **Avoid technical-layer-first packages** — don't group all controllers together.
- Each feature package is self-contained.
- Shared utilities go in `common/`.

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Controller | `<Feature>Controller` | `MemberController` |
| Service Interface | `<Feature>Service` | `MemberService` |
| Service Implementation | `<Feature>ServiceImpl` | `MemberServiceImpl` |
| Repository | `<Feature>Repository` | `MemberRepository` |
| Entity | `<Feature>` | `Member` |
| DTO (Request) | `<Action><Feature>Request` | `CreateMemberRequest` |
| DTO (Response) | `<Feature>Response` | `MemberResponse` |
| Mapper | `<Feature>Mapper` | `MemberMapper` |

---

## Layer Pattern

```text
Controller → Service → Repository → PostgreSQL
```

### Controller

- Handles HTTP request parsing and response formatting.
- Uses `@RequestBody`, `@PathVariable`, `@RequestParam` for input.
- Delegates all logic to the service.
- Returns `ResponseEntity<T>`.

### Service

- Contains all business logic.
- Uses interfaces for testability.
- `@Transactional` for methods modifying multiple entities.

### Repository

- Extends `JpaRepository` or `CrudRepository`.
- Complex queries use `@Query` (JPQL) or QueryDSL.
- Never expose raw entities to the controller — use DTOs.

---

## Swagger / OpenAPI Documentation

### Setup — SpringDoc OpenAPI

Add `springdoc-openapi-starter-webmvc-ui` dependency:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.x.x</version>
</dependency>
```

### Configuration

```yaml
# application.yml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    enabled: true              # Disable in production or restrict to internal
    tags-sorter: alpha
    operations-sorter: alpha
  default-produces-media-type: application/json
```

### Controller Annotations

```java
@Tag(name = "Members", description = "Family member management")
@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

    @Operation(summary = "List all members", description = "Returns a paginated list of family members")
    @ApiResponse(responseCode = "200", description = "Success",
        content = @Content(mediaType = "application/json",
            array = @ArraySchema(schema = @Schema(implementation = MemberResponse.class))))
    @GetMapping
    public ResponseEntity<Page<MemberResponse>> findAll(
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size
    ) { ... }

    @Operation(summary = "Create a member")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @PostMapping
    public ResponseEntity<MemberResponse> create(
        @Valid @RequestBody CreateMemberRequest request
    ) { ... }
}
```

### DTO Annotations

```java
@Schema(description = "Request to create a family member")
public class CreateMemberRequest {
    @Schema(description = "Display name", example = "Alice", required = true)
    @NotBlank
    private String name;

    @Schema(description = "Date of birth", example = "1990-01-15", required = true)
    @NotNull
    private LocalDate birthday;

    @Schema(description = "Relationship type", example = "SPOUSE")
    @NotNull
    private RelationType relation;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
    private String avatarUrl;
}
```

### Swagger UI Endpoints

| Endpoint | Description |
|----------|-------------|
| `/swagger-ui.html` | Interactive API documentation UI |
| `/v3/api-docs` | OpenAPI 3.0 spec in JSON |
| `/v3/api-docs.yaml` | OpenAPI 3.0 spec in YAML |

**Production**: disable Swagger UI or restrict to internal network.

---

## PostgreSQL Configuration

### Application Properties

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:family_os}
    username: ${DB_USER:family_user}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000

  jpa:
    hibernate:
      ddl-auto: validate          # Never use 'update' in production
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: false               # Disable in production

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

### Conventions

- **UUID primary keys**: `@GeneratedValue(strategy = GenerationType.UUID)`
- **Snake case columns**: configure via `@Column(name = "column_name")` or naming strategy.
- **JSONB columns**: use `@JdbcTypeCode(SqlTypes.JSON)` for JSON fields.
- **Timestamps**: `@CreationTimestamp` and `@UpdateTimestamp` for `created_at` / `updated_at`.
- **Soft delete**: `@SQLDelete` + `@Where(clause = "deleted_at IS NULL")` for important data.

### Flyway Migrations

```text
src/main/resources/db/migration/
├── V1__create_users.sql
├── V2__create_members.sql
├── V3__create_devices.sql
├── V4__create_permissions.sql
└── V5__add_member_avatar_url.sql
```

Naming: `V<version>__<description>.sql`

---

## SSO / OAuth2 Security

### Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder()))
            );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Local JWT verification
        return NimbusJwtDecoder.withSecretKey(secretKey).build();
    }
}
```

### SSO / OAuth2 Configuration (Reserved)

When SSO is enabled, configure as an OAuth2 Resource Server:

```yaml
# application-sso.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${SSO_ISSUER_URL}
          jwk-set-uri: ${SSO_ISSUER_URL}/protocol/openid-connect/certs
      client:
        registration:
          sso:
            client-id: ${SSO_CLIENT_ID}
            client-secret: ${SSO_CLIENT_SECRET}
            scope: ${SSO_SCOPES:openid,profile,email}
            authorization-grant-type: authorization_code
            redirect-uri: ${SSO_REDIRECT_URI}
        provider:
          sso:
            issuer-uri: ${SSO_ISSUER_URL}
```

### SSO User Sync

When a user logs in via SSO, sync their identity to the local database:

```java
@Service
public class SsoUserService {

    /**
     * Sync SSO user to local database.
     * Creates a new user if not found, updates if exists.
     */
    public User syncSsoUser(OAuth2User oAuth2User) {
        String externalId = oAuth2User.getAttribute("sub");
        return userRepository.findByExternalId(externalId)
            .map(existing -> updateFromSso(existing, oAuth2User))
            .orElseGet(() -> createFromSso(oAuth2User));
    }
}
```

### Environment Variables

```bash
# JWT
JWT_SECRET=<generate strong secret>
JWT_REFRESH_SECRET=<generate strong refresh secret>
JWT_EXPIRATION=1800           # 30 minutes
JWT_REFRESH_EXPIRATION=604800 # 7 days

# SSO (when enabled)
SSO_ENABLED=false
SSO_PROVIDER=keycloak
SSO_ISSUER_URL=https://sso.example.com/realms/family-os
SSO_CLIENT_ID=family-os
SSO_CLIENT_SECRET=<secret>
SSO_REDIRECT_URI=http://localhost:8080/api/v1/auth/sso/callback
SSO_SCOPES=openid,profile,email
```

---

## Validation

Use **Jakarta Validation** annotations on request DTOs:

```java
public class CreateMemberRequest {
    @NotBlank
    private String name;

    @NotNull
    private LocalDate birthday;

    @NotNull
    private RelationType relation;

    private String avatarUrl;
}
```

Enable validation in controllers:

```java
@PostMapping("/members")
public ResponseEntity<MemberResponse> create(
    @Valid @RequestBody CreateMemberRequest request
) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(memberService.create(request));
}
```

---

## Error Handling

Global exception handler:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_ERROR", "Validation failed", errors));
    }
}
```

---

## Testing

Use **JUnit 5** + **Mockito**:

```java
@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private MemberServiceImpl memberService;

    @Test
    void shouldCreateMember() {
        var request = new CreateMemberRequest("Alice", LocalDate.of(1990, 1, 1), RelationType.SPOUSE);
        when(memberRepository.save(any())).thenReturn(new Member("uuid", "Alice", ...));

        var result = memberService.create(request);

        assertThat(result.getName()).isEqualTo("Alice");
        verify(memberRepository).save(any());
    }
}
```

### Rules

- Unit test services with `@Mock` dependencies.
- Integration test controllers with `@SpringBootTest` + `MockMvc`.
- Use `@DataJpaTest` for repository tests.
- Focus on domain logic and edge cases.

---

## Related Documents

- [Engineering Conventions](../../conventions.md) — General conventions
- [API Design Standards](../../api.md) — GraphQL & REST conventions
- [API Endpoints](../../features/api.md) — Specific endpoint definitions
