# Equipment & Asset Management System

## Project Overview

This project is an Equipment and Asset Management System built with Spring Boot.

## Technology Stack

- Java 21
- Spring Boot 4.1.0
- Maven
- Spring Web
- Spring Data JPA
- Bean Validation
- PostgreSQL
- Flyway
- Lombok
- JUnit
- Testcontainers
- Docker Compose

## Project Structure

- Application source code: `src/main/java`
- Configuration files: `src/main/resources`
- Tests: `src/test/java`
- Flyway migrations: `src/main/resources/db/migration`
- Docker configuration: `docker-compose.yaml`

## Spring Profiles

- `dev`: Local development using PostgreSQL in Docker
- `test`: Automated testing
- `prod`: Production configuration using environment variables

The development database connection uses:

- Host: `localhost`
- Host port: `5433`
- Database: `equipment_db`
- PostgreSQL port inside Docker: `5432`

## Development Commands

Start PostgreSQL:

```bash
docker compose up -d
```

Stop PostgreSQL:

```bash
docker compose down
```

Run the application:

```bash
./mvnw spring-boot:run
```

Run tests:

```bash
./mvnw test
```

## Development Rules

- Use layered architecture.
- Keep controllers focused on HTTP request and response handling.
- Put business logic in service classes.
- Use repositories only for database access.
- Use DTOs for API requests and responses when appropriate.
- Validate incoming data using Jakarta Validation.
- Use Flyway migrations for every database schema change.
- Do not let Hibernate create or modify database tables.
- Do not hard-code production credentials.
- Do not commit secrets, tokens, `.env`, `.idea`, or `target`.
- Add or update tests when implementing features.
- Follow the existing package structure and naming conventions.

## Database Rules

- Use PostgreSQL.
- Store Flyway migrations in `src/main/resources/db/migration`.
- Use this naming format:

```text
V<number>__<description>.sql
```

Example:

```text
V1__create_assets_table.sql
```

## Git Rules

- Review changed files before committing.
- Write clear commit messages.
- Do not commit generated files or sensitive information.