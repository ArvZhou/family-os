# Spring Boot Standards

> Framework-specific conventions for Spring Boot backend services.
> For general engineering conventions, see [../../conventions.md](../../conventions.md).

---

## Role

Spring Boot serves as the **data layer** — the system's single source of truth for identity, permissions, and core data.

```text
Identity
Permissions
Core Data
```

Spring Boot owns:
- Users and authentication
- Permissions and authorization
- Device registry and metadata
- Family member base data

Other services (e.g., NestJS) communicate with Spring Boot via HTTP API — never direct database writes.

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
│   └── dto/
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

- **Avoid technical-layer-first packages** — don't group all controllers together, all services together, etc.
- Each feature package is self-contained with its own controller → service → repository → entity → dto.
- Shared utilities go in `common/`.

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Controller | `<Feature>Controller` | `MemberController` |
| Service | `<Feature>Service` | `MemberService` |
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
Controller → Service → Repository → Database
```

### Controller

- Handles HTTP request parsing and response formatting.
- Uses `@RequestBody`, `@PathVariable`, `@RequestParam` for input.
- Delegates all logic to the service.
- Returns `ResponseEntity<T>` for proper HTTP status control.

### Service

- Contains all business logic.
- Uses interfaces for testability and loose coupling.
- Methods modifying multiple entities should be `@Transactional`.

### Repository

- Extends `JpaRepository` or `CrudRepository`.
- Complex queries use `@Query` (JPQL) or QueryDSL.
- Never expose raw entities to the controller — use DTOs.

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

## Database Access

### Ownership

Spring Boot is the **sole owner** of these tables:

- `users` — authentication and identity
- `permissions` — access control
- `devices` — device registry and metadata
- `members` — family member base data

### Rules

- Only Spring Boot writes to these tables.
- Other services read via Spring Boot's REST API.
- Database migrations managed by **Flyway** in Spring Boot.
- Migration files: `src/main/resources/db/migration/V1__create_members.sql`

### Migration Naming

```text
V<version>__<description>.sql
```

Examples:

```text
V1__create_members.sql
V2__create_devices.sql
V3__add_member_avatar_url.sql
```

---

## Error Handling

Use a global exception handler:

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
        // Extract field errors
    }
}
```

### Rules

- Use appropriate HTTP status codes.
- Return consistent `ErrorResponse` format (see [API Design Standards](../../api.md)).
- Log all unexpected exceptions with full stack trace.

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
        // given
        var request = new CreateMemberRequest("Alice", LocalDate.of(1990, 1, 1), RelationType.SPOUSE);
        when(memberRepository.save(any())).thenReturn(new Member("uuid", "Alice", ...));

        // when
        var result = memberService.create(request);

        // then
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
- [API Design Standards](../../api.md) — REST API conventions
- [API Endpoints](../../features/api.md) — Specific endpoint definitions
