---
name: run-test
description: Run the complete Maven test suite for this Spring Boot project and summarize the results.
disable-model-invocation: true
allowed-tools: Bash(./mvnw test)
---

# Run Project Tests

## Test output

!`./mvnw test`

## Instructions

Analyze the test output above and report:

- Whether the build succeeded or failed.
- The number of tests run, failed, errored, and skipped.
- The names and causes of any failing tests.
- Whether each failure is caused by application code or by the environment, including Docker, Testcontainers, PostgreSQL, or configuration.

Do not modify production code or test code unless the user explicitly asks you to fix the failures.