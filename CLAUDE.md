# Equipment & Asset Management System

## Project Context
Spring Boot backend for managing users and company equipment/assets.

Before changing code, inspect the current source, migrations, configuration, Git branch, and working tree. The repository is the source of truth when this file and the code differ.

## Technology
- Java 21
- Spring Boot with Maven Wrapper
- Spring Web and Spring Data JPA
- Jakarta Bean Validation
- PostgreSQL and Flyway
- Lombok
- Spring Security Crypto with BCrypt
- JUnit, Testcontainers, and Docker Compose

## Commands
```bash
./mvnw spring-boot:run
./mvnw test
./mvnw clean package
git status
git diff
```

Project test skill:

```text
.claude/skills/run-test/SKILL.md
```

## Project Layout
```text
src/main/java/com/hmood/equipmentassetmanagement/
├── common/   # Shared code and global error handling
├── config/   # Application-wide Spring configuration
├── user/     # User feature
└── asset/    # Asset feature

src/main/resources/
├── application.yaml
├── application-dev.yaml
├── application-test.yaml
├── application-prod.yaml
└── db/migration/

src/test/java/
```

Use package-by-feature organization. Feature packages may contain:

```text
controller/
dto/
exception/
model/
repository/
service/
specification/   # Only when needed
```

## Architecture
Use:

```text
Controller → Service → Repository → Database
```

### Controllers
- Handle HTTP concerns only.
- Accept request bodies, path variables, and query parameters.
- Trigger validation with `@Valid` and parameter constraints.
- Call services; never access repositories directly.
- Return DTOs through `ResponseEntity`.
- Do not contain business logic.

### Services
- Contain business rules and orchestration.
- Normalize incoming data where required.
- Use repositories for persistence.
- Convert entities to response DTOs.
- Use `@Transactional` for writes.
- Use `@Transactional(readOnly = true)` for reads.
- Throw feature-specific exceptions for business failures.

### Persistence and DTOs
- Use inherited Spring Data methods when available.
- Use derived queries or specifications for filtering.
- Keep business logic out of repositories.
- Keep entities internal to persistence.
- Use request and response DTOs at API boundaries.
- DTOs use Java records unless existing code requires otherwise.
- Never expose passwords, password hashes, or unnecessary relationships.
- Keep JPA mappings aligned with Flyway migrations.

## Database
PostgreSQL is the application database. Flyway is the only schema-management mechanism.

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: none
```

Migrations:

```text
src/main/resources/db/migration
V1__create_users_table.sql
V2__create_assets_table.sql
```

Rules:

- Never edit an applied migration to change the schema.
- Add a new numbered migration for each schema change.
- Keep constraints, indexes, foreign keys, enums, and entities consistent.
- Use `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
- Never commit real credentials.

## Domain Rules
### Users
- Roles: `MANAGER`, `ADMIN`, `EMPLOYEE`, `IT_SUPPORT`.
- Trim and lowercase email addresses.
- Enforce case-insensitive email uniqueness.
- Hash passwords with BCrypt.
- Never return raw passwords or password hashes.

### Assets
- Statuses: `AVAILABLE`, `ASSIGNED`, `UNDER_MAINTENANCE`, `DAMAGED`.
- Trim and uppercase serial numbers during creation.
- Serial numbers are unique and immutable after creation.
- Generic updates may change only name, category, and purchase date.
- Do not change status or current user through the generic update endpoint.
- List queries support search, filtering, pagination, and deterministic sorting.
- Block deletion when an asset is `ASSIGNED` or `UNDER_MAINTENANCE`.
- After maintenance is implemented, also block deletion when an open maintenance request exists.

## Implemented API
```http
POST /api/users
GET /api/users?role={role}

POST /api/assets
GET /api/assets
GET /api/assets/{id}
PUT /api/assets/{id}
DELETE /api/assets/{id}
```

Response conventions:

- `201 Created`: successful creation.
- `200 OK`: successful reads and updates.
- `204 No Content`: successful deletion.
- `400 Bad Request`: invalid input or query parameters.
- `404 Not Found`: missing resource.
- `409 Conflict`: duplicate value or blocked business operation.

## Error Handling
- Shared response: `common.exception.ApiErrorResponse`.
- Shared handler: `common.exception.GlobalExceptionHandler`.
- Keep feature exceptions inside their feature package.
- Preserve the existing structured error response.
- Map validation failures to `400`, missing resources to `404`, and conflicts to `409`.
- Do not expose stack traces or internal details.

## Workflow
Before changing code:

1. Run `git status` and confirm the branch.
2. Inspect related source files, tests, migrations, and conventions.
3. Make the smallest change that satisfies the task.

After changing code:

1. Review `git diff`.
2. Run `./mvnw test`.
3. Fix failures caused by the change.
4. Confirm `git status`.
5. Do not commit, merge, or push unless explicitly asked.

## Instructions for Claude
- Preserve existing behavior unless the task requires changing it.
- Do not modify unrelated files.
- Do not invent classes, endpoints, tables, or completed behavior.
- Prefer existing project patterns over new abstractions.
- Add tests for meaningful business logic and regressions when practical.
- Explain important architecture or business-rule changes clearly.
- Ask before destructive database or Git operations.
- Update this file only when persistent commands, architecture, domain rules, or project-wide conventions change.
- Do not use this file as a task log, changelog, or temporary branch record.
