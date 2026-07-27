# Equipment & Asset Management System

## Project Overview

This project is an Equipment and Asset Management System built with Spring Boot.

This file documents the current implemented project structure, completed tasks, configuration, development rules, and verified behavior.

Claude must read this file and inspect the existing code before making changes.

---

## Technology Stack

- Java 21
- Spring Boot 4.1.0
- Maven
- Spring Web
- Spring Data JPA
- Jakarta Bean Validation
- PostgreSQL
- Flyway
- Lombok
- Spring Security Crypto
- BCrypt
- JUnit
- Testcontainers
- Docker
- Docker Compose

---

## Build Tool

The project uses Maven through the Maven Wrapper.

Run the application:

```bash
./mvnw spring-boot:run
```

Run tests:

```bash
./mvnw test
```

Build the project:

```bash
./mvnw clean package
```

Generated build files are stored inside:

```text
target/
```

The `target` directory is ignored by Git.

---

## Project Structure

Main Java source code:

```text
src/main/java
```

Configuration files:

```text
src/main/resources
```

Tests:

```text
src/test/java
```

Flyway migrations:

```text
src/main/resources/db/migration
```

Docker Compose configuration:

```text
docker-compose.yaml
```

The project uses package-by-feature organization with layers inside each feature.

Current implemented structure:

```text
com.hmood.equipmentassetmanagement/
├── common/
│   └── exception/
│       ├── ApiErrorResponse.java
│       └── GlobalExceptionHandler.java
│
├── config/
│   └── PasswordConfig.java
│
└── user/
    ├── controller/
    │   └── UserController.java
    │
    ├── dto/
    │   ├── CreateUserRequest.java
    │   └── UserResponse.java
    │
    ├── exception/
    │   └── EmailAlreadyExistsException.java
    │
    ├── model/
    │   ├── Role.java
    │   └── User.java
    │
    ├── repository/
    │   └── UserRepository.java
    │
    └── service/
        └── UserService.java
```

Shared code used across the application is stored under:

```text
common/
```

Application-wide Spring configuration is stored under:

```text
config/
```

---

## Architecture

The implemented application flow is:

```text
Controller
→ Service
→ Repository
→ Entity
→ Database
```

### Controller

Controllers:

- Handle HTTP requests and responses.
- Read request bodies and query parameters.
- Trigger Jakarta Validation using `@Valid`.
- Call service methods.
- Return HTTP status codes.
- Do not access repositories directly.

### Service

Services:

- Contain business logic.
- Normalize incoming data.
- Check business rules.
- Hash passwords before storage.
- Use repositories for database operations.
- Convert entities to response DTOs.
- Use transactions.

### Repository

Repositories:

- Handle database access.
- Extend Spring Data JPA repositories.
- Use Spring Data derived query methods.

### Entity

Entities:

- Represent PostgreSQL tables.
- Use JPA annotations.
- Match the schema created by Flyway.

### DTO

DTOs:

- Represent API request and response data.
- Use Java records.
- Prevent sensitive entity fields from being returned by the API.

---

## Spring Profiles

The project contains these Spring profiles:

```text
dev
test
prod
```

### Development Profile

The `dev` profile connects to PostgreSQL.

The datasource configuration supports:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

Current configuration:

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/equipment_db}
    username: ${DB_USERNAME:hmood}
    password: ${DB_PASSWORD:}
```

Current local defaults:

```text
Database: equipment_db
Host: localhost
Port: 5432
Username: hmood
Password: empty
```

The local development database has been successfully connected and used.

### Test Profile

Automated tests use Testcontainers.

Testcontainers starts a temporary PostgreSQL database during tests.

The temporary database is independent of the local development database.

### Production Profile

A production profile configuration exists and uses environment variables for configuration.

---

## Database Management

PostgreSQL is used as the database.

Flyway is responsible for database schema creation and changes.

Hibernate schema creation is disabled:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: none
```

Flyway migrations are stored in:

```text
src/main/resources/db/migration
```

Migration naming format:

```text
V<number>__<description>.sql
```

Current migration:

```text
V1__create_users_table.sql
```

Flyway stores migration execution history inside:

```text
flyway_schema_history
```

The local database currently contains:

```text
users
flyway_schema_history
```

---

## Task 0 — Project Bootstrap

Task 0 is complete.

Implemented setup:

- Spring Boot project initialization.
- Java 21.
- Maven Wrapper.
- Spring Web.
- Spring Data JPA.
- PostgreSQL driver.
- Flyway.
- Jakarta Bean Validation.
- Lombok.
- JUnit.
- Testcontainers.
- Docker Compose.
- Development, test, and production profiles.
- Git repository setup.
- Project documentation through `CLAUDE.md`.

---

## Task 1 — User Foundation

Task 1 is implemented on:

```text
feature/users-foundation
```

---

## User Roles

The implemented roles are:

```text
MANAGER
ADMIN
EMPLOYEE
IT_SUPPORT
```

They are defined in:

```text
user/model/Role.java
```

Roles are stored in PostgreSQL as strings using:

```java
@Enumerated(EnumType.STRING)
```

---

## User Entity

The user entity is defined in:

```text
user/model/User.java
```

It maps to:

```text
users
```

Implemented fields:

```text
id
name
email
passwordHash
role
```

Mappings:

- `id` is the primary key.
- `id` is generated by PostgreSQL.
- `name` is required.
- `email` is required and unique.
- `passwordHash` maps to the `password_hash` database column.
- `role` is required and stored as a string.

The entity uses Lombok:

```text
@Getter
@Setter
@NoArgsConstructor
```

---

## User Database Migration

The migration:

```text
V1__create_users_table.sql
```

creates the `users` table.

Implemented columns:

```text
id BIGINT
name VARCHAR(100)
email VARCHAR(255)
password_hash VARCHAR(255)
role VARCHAR(30)
```

Implemented constraints:

- Primary key on `id`.
- Generated identity value for `id`.
- Required name.
- Required and unique email.
- Required password hash.
- Required role.
- Check constraint for the four supported roles.

The migration was successfully executed on:

- The local PostgreSQL database.
- The temporary PostgreSQL Testcontainer database.

---

## Create User Request

The request DTO is:

```text
CreateUserRequest
```

Implemented fields:

```text
name
email
password
role
```

Implemented validation:

```text
name
→ required
→ maximum 100 characters
```

```text
email
→ required
→ valid email format
→ maximum 255 characters
```

```text
password
→ required
→ between 8 and 72 characters
```

```text
role
→ required
```

Validation is triggered using:

```java
@Valid
```

inside `UserController`.

---

## User Response

The response DTO is:

```text
UserResponse
```

Implemented fields:

```text
id
name
email
role
```

The response does not contain:

```text
password
passwordHash
```

---

## User Repository

The repository is:

```text
UserRepository
```

It extends:

```java
JpaRepository<User, Long>
```

Implemented derived query methods:

```java
boolean existsByEmailIgnoreCase(String email);
```

```java
List<User> findAllByRole(Role role);
```

Inherited repository methods used by the project include:

```text
save
```

---

## User Service

The service is:

```text
UserService
```

Implemented methods:

```java
createUser(CreateUserRequest request)
```

```java
getUsersByRole(Role role)
```

### Create User Logic

The implemented create-user flow is:

```text
Receive CreateUserRequest
→ Trim the name
→ Trim the email
→ Convert the email to lowercase
→ Check whether the email already exists
→ Hash the password
→ Create the User entity
→ Save the user
→ Return UserResponse
```

Email normalization uses:

```java
trim()
```

and:

```java
toLowerCase(Locale.ROOT)
```

Duplicate email checking uses:

```java
existsByEmailIgnoreCase(...)
```

The create operation uses:

```java
@Transactional
```

### Get Users by Role Logic

The service:

- Reads users using `findAllByRole`.
- Converts every `User` entity into `UserResponse`.
- Returns `List<UserResponse>`.
- Does not expose password hashes.

The read operation uses:

```java
@Transactional(readOnly = true)
```

---

## Password Hashing

Password hashing configuration is located in:

```text
config/PasswordConfig.java
```

It creates a Spring Bean of type:

```java
PasswordEncoder
```

The implementation is:

```java
BCryptPasswordEncoder
```

The dependency added to `pom.xml` is:

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

Passwords are hashed before being stored.

The raw password is not saved in the `users` table.

---

## User Controller

The controller is:

```text
UserController
```

Base path:

```text
/api/users
```

The controller uses constructor injection through:

```java
@RequiredArgsConstructor
```

The controller calls `UserService` and does not access `UserRepository` directly.

---

## Implemented API Endpoints

### Create User

```http
POST /api/users
```

Example request:

```json
{
  "name": "Mohammad Abu Omar",
  "email": "hmood@example.com",
  "password": "12345678",
  "role": "ADMIN"
}
```

Successful status:

```text
201 Created
```

Example response:

```json
{
  "id": 1,
  "name": "Mohammad Abu Omar",
  "email": "hmood@example.com",
  "role": "ADMIN"
}
```

This endpoint was tested successfully using Postman.

---

### Get Users by Role

```http
GET /api/users?role=ADMIN
```

Successful status:

```text
200 OK
```

Example response:

```json
[
  {
    "id": 1,
    "name": "Mohammad Abu Omar",
    "email": "hmood@example.com",
    "role": "ADMIN"
  }
]
```

This endpoint was tested successfully using Postman.

---

## Error Handling

Shared error handling is implemented under:

```text
common/exception
```

Implemented shared classes:

```text
ApiErrorResponse
GlobalExceptionHandler
```

The feature-specific duplicate email exception is:

```text
user/exception/EmailAlreadyExistsException.java
```

### API Error Response

`ApiErrorResponse` contains:

```text
timestamp
status
error
message
path
fieldErrors
```

### Duplicate Email

`UserService` throws:

```text
EmailAlreadyExistsException
```

when the email already exists.

`GlobalExceptionHandler` handles this exception and creates:

```text
409 Conflict
```

with the message:

```text
Email already exists
```

### Validation Errors

`GlobalExceptionHandler` handles:

```text
MethodArgumentNotValidException
```

and returns:

```text
400 Bad Request
```

Validation errors are returned inside:

```text
fieldErrors
```

### Invalid Role Query Parameter

`GlobalExceptionHandler` handles:

```text
MethodArgumentTypeMismatchException
```

and returns:

```text
400 Bad Request
```

for invalid values such as:

```http
GET /api/users?role=BOSS
```

---

## Testing

Tests are run using:

```bash
./mvnw test
```

The latest automated test result is:

```text
Tests run: 1
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

The automated test successfully verified:

- Spring Boot application context starts.
- Spring Beans are created.
- `UserRepository` is detected.
- Testcontainers connects to Docker.
- A temporary PostgreSQL container starts.
- Flyway validates one migration.
- Flyway executes `V1__create_users_table.sql`.
- The `users` table migration succeeds.
- Hibernate initializes.
- JPA initializes.
- All current Task 1 Java classes compile successfully.

Manual Postman testing successfully verified:

```text
POST /api/users
→ 201 Created
```

```text
GET /api/users?role=ADMIN
→ 200 OK
```

---

## Security Rules Already Applied

- Raw passwords are not stored.
- Passwords are hashed using BCrypt.
- Password hashes are not returned in API responses.
- Database password configuration supports environment variables.
- The current committed datasource configuration does not contain a real password.
- `.env` is ignored by Git.
- `target/` is ignored by Git.
- `.idea/` is ignored by Git.
- `.DS_Store` is ignored by Git.

---

## Coding Rules

- Use package-by-feature organization.
- Use `Controller → Service → Repository`.
- Keep HTTP handling inside controllers.
- Keep business logic inside services.
- Keep database access inside repositories.
- Use constructor injection.
- Use `final` dependencies.
- Use DTOs for API requests and responses.
- Do not return password hashes.
- Use Jakarta Validation for incoming requests.
- Use Flyway for schema creation and changes.
- Do not let Hibernate create database tables.
- Use transactions in service methods.
- Use shared global exception handling.
- Keep feature-specific exceptions inside their feature.
- Keep shared exception handling inside `common.exception`.
- Do not commit secrets or generated files.

---

## Git Workflow

Task 1 is currently being developed on:

```text
feature/users-foundation
```

Commands used to review changes:

```bash
git status
```

```bash
git diff
```

```bash
git diff --check
```

Tests are run before committing:

```bash
./mvnw test
```

After staging, review using:

```bash
git status
```

and:

```bash
git diff --cached --check
```

Suggested commit message:

```text
feat: implement user foundation
```

---

## Instructions for Claude

Claude must:

1. Read this file before changing the project.
2. Inspect the existing source code.
3. Inspect the current Git branch.
4. Follow the existing package-by-feature structure.
5. Follow `Controller → Service → Repository`.
6. Use DTOs at API boundaries.
7. Use Flyway for database schema changes.
8. Avoid changing unrelated code.
9. Run tests after making changes.
10. Update this file when implemented project behavior or architecture changes.