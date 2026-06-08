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
│   ├── mapper/
│   ├── entity/
│   ├── dto/
│   └── security/              # Spring Security config, OAuth2/OIDC
├── member/
│   ├── controller/
│   ├── service/
│   ├── mapper/
│   ├── entity/
│   └── dto/
├── device/
│   ├── controller/
│   ├── service/
│   ├── mapper/
│   ├── entity/
│   └── dto/
├── permission/
│   ├── controller/
│   ├── service/
│   ├── mapper/
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

| Type                   | Convention                 | Example               |
| ---------------------- | -------------------------- | --------------------- |
| Controller             | `<Feature>Controller`      | `MemberController`    |
| Service Interface      | `<Feature>Service`         | `MemberService`       |
| Service Implementation | `<Feature>ServiceImpl`     | `MemberServiceImpl`   |
| Mapper                 | `<Feature>Mapper`          | `MemberMapper`        |
| Entity                 | `<Feature>`                | `Member`              |
| DTO (Request)          | `<Action><Feature>Request` | `CreateMemberRequest` |
| DTO (Response)         | `<Feature>Response`        | `MemberResponse`      |
| DTO Mapper             | `<Feature>DtoMapper`       | `MemberDtoMapper`     |

---

## Layer Pattern

```text
Controller → Service → Mapper → PostgreSQL
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

### Mapper

- MyBatis-Plus `@Mapper` interface — 继承 `BaseMapper<T>` 即可获得标准 CRUD。
- 无需 XML mapper 文件，除非有复杂联表查询。
- 自定义查询使用 MyBatis-Plus `LambdaQueryWrapper` 或在接口上添加 `@Select` 注解。
- 逻辑删除用 `@TableLogic` 注解，自动处理 SELECT/DELETE。
- Never expose raw entities to the controller — use DTOs.

```java
@Mapper
public interface MemberMapper extends BaseMapper<Member> {
    // BaseMapper 自动提供: selectById, selectList, insert, updateById, deleteById
    // 自定义查询可在此添加
}
```

### Entity

- Entity 使用 MyBatis-Plus 注解映射数据库表。
- `@TableId(type = IdType.ASSIGN_UUID)` — 注意：`java.util.UUID` 类型需手动 `UUID.randomUUID()`，因为 MyBatis-Plus 的 ASSIGN_UUID 只支持 String。
- `@TableLogic` — 标记逻辑删除字段（`deleted_at`），MyBatis-Plus 自动改写 DELETE 为 UPDATE，SELECT 自动追加 `WHERE deleted_at IS NULL`。
- `@TableField(fill = FieldFill.INSERT)` / `FieldFill.INSERT_UPDATE` — 配合 `MetaObjectHandler` 自动填充时间戳。

```java
@Data
@TableName("members")
public class Member {
    @TableId(type = IdType.ASSIGN_UUID)
    private UUID id;                    // Service 层手动 UUID.randomUUID()

    private String name;

    @TableField("relation_type")
    private String relationType;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    @TableField("deleted_at")
    private LocalDateTime deletedAt;
}
```

### MetaObjectHandler

MyBatis-Plus 自动填充 created_at / updated_at：

```java
@Component
public class MetaObjectHandlerConfig implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createdAt", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updatedAt", LocalDateTime.class, LocalDateTime.now());
    }
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updatedAt", LocalDateTime.class, LocalDateTime.now());
    }
}
```

### UUID TypeHandler

MyBatis 3.5.x 不含 `UUIDTypeHandler`，需要自定义：

```java
@MappedTypes(UUID.class)
public class UUIDTypeHandler extends BaseTypeHandler<UUID> {
    // setNonNullParameter → ps.setObject(i, uuid)
    // getNullableResult → rs.getObject(col, UUID.class)
}
```

在 `application.yml` 注册：`mybatis-plus.type-handlers-package: com.family.common.type`

    <insert id="insert">
        INSERT INTO members (id, name, birthday, relation_type, avatar_url, created_at, updated_at)
        VALUES (#{id}, #{name}, #{birthday}, #{relationType}, #{avatarUrl},
                COALESCE(#{createdAt}, NOW()), COALESCE(#{updatedAt}, NOW()))
    </insert>

    <update id="update">
        UPDATE members SET name = #{name}, birthday = #{birthday},
            relation_type = #{relationType}, avatar_url = #{avatarUrl}, updated_at = NOW()
        WHERE id = #{id} AND deleted_at IS NULL
    </update>

    <update id="deleteById">
        UPDATE members SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = #{id} AND deleted_at IS NULL
    </update>

</mapper>
```

---

## Swagger / OpenAPI Documentation

### Setup — SpringDoc OpenAPI

Add `springdoc-openapi-starter-webmvc-ui` dependency:

```kotlin
// build.gradle.kts
implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.7.0")
```

### Configuration

```yaml
# application.yml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    enabled: true # Disable in production or restrict to internal
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

| Endpoint            | Description                      |
| ------------------- | -------------------------------- |
| `/swagger-ui.html`  | Interactive API documentation UI |
| `/v3/api-docs`      | OpenAPI 3.0 spec in JSON         |
| `/v3/api-docs.yaml` | OpenAPI 3.0 spec in YAML         |

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

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

# MyBatis-Plus
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml # XML mapper（如需要复杂查询）
  type-aliases-package: com.family
  type-handlers-package: com.family.common.type # UUIDTypeHandler
  global-config:
    db-config:
      id-type: ASSIGN_UUID
      logic-delete-field: deletedAt
      logic-delete-value: 'now()'
      logic-not-delete-value: 'null'
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
```

### Conventions

- **UUID primary keys**: MyBatis-Plus `ASSIGN_UUID` 不支持 `java.util.UUID` 类型，需在 Service 层手动 `UUID.randomUUID()`。
- **Snake case columns**: `map-underscore-to-camel-case: true` 自动映射（如 `relation_type` ↔ `relationType`）。
- **逻辑删除**: `@TableLogic` + `logic-delete-field: deletedAt` 自动处理 DELETE → UPDATE + SELECT 过滤。
- **时间戳**: `MetaObjectHandler` + `@TableField(fill = ...)` 自动填充，无需手写 SQL。
- **XML mapper**: BaseMapper 提供标准 CRUD，无需 XML。只有复杂联表查询才需要手写 XML。
- **类型转换**: `@TableField("column_name")` 显式指定列名（如 `password_hash`、`external_id`）。

### Flyway Migrations

```text
src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__add_verified_and_phone.sql
├── V3__create_members_table.sql
└── ...
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
        return userMapper.findByExternalId(externalId)
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
    private MemberMapper memberMapper;

    @InjectMocks
    private MemberServiceImpl memberService;

    @Test
    void shouldCreateMember() {
        var request = new CreateMemberRequest("Alice", LocalDate.of(1990, 1, 1), RelationType.SPOUSE);
        when(memberMapper.insert(any())).thenReturn(1);

        var result = memberService.create(request);

        assertThat(result.getName()).isEqualTo("Alice");
        verify(memberMapper).insert(any());
    }
}
```

### Rules

- Unit test services with `@Mock` dependencies.
- Integration test controllers with `@SpringBootTest` + `MockMvc`.
- Use `@MybatisTest` for mapper tests.
- Focus on domain logic and edge cases.

---

## Related Documents

- [Engineering Conventions](../../conventions.md) — General conventions
- [API Design Standards](../../api.md) — GraphQL & REST conventions
- [Features](../../features/) — Feature-by-feature designs (01-auth through 14-sso)
