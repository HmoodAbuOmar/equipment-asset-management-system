---
name: test-implementor
description: Implement tests for this project's code according to CLAUDE.md, project requirements, and existing testing conventions. Use when adding or updating unit, integration, controller, service, repository, security, or regression tests for a feature or code change.
disable-model-invocation: true
---

# Test Implementor

Implement tests for the requested code according to this project's specifications and established testing conventions.

## Test Implementation Process

1. Read `CLAUDE.md` first and treat it as the primary project specification.
2. Inspect the code under test and the surrounding implementation needed to understand its behavior.
3. Inspect existing tests to follow the project's established testing patterns, libraries, naming conventions, and setup.
4. Identify the expected behavior, edge cases, validation rules, authorization requirements, and failure scenarios.
5. Implement the smallest set of meaningful tests that provides appropriate coverage for the requested code.
6. Run the relevant tests after implementation and fix test-code issues caused by the new tests.
7. Do not change production code unless the user explicitly asks for production-code fixes.

## Test Coverage Checklist

Consider tests for:

- Happy path: Verify expected behavior for valid input and normal successful flows.
- Validation: Verify invalid, missing, blank, malformed, or out-of-range input where applicable.
- Error handling: Verify expected exceptions, error responses, and failure behavior.
- Authorization: Verify role restrictions and access-control rules for protected operations.
- Business rules: Verify project-specific rules, state transitions, and forbidden operations.
- Persistence: Verify repository behavior, database constraints, entity relationships, and query results when relevant.
- API behavior: Verify status codes, request/response payloads, pagination, and endpoint behavior when relevant.
- Edge cases: Verify important boundary conditions, null-related behavior where applicable, duplicate data, and already-completed operations.
- Regression coverage: Add a regression test when fixing or protecting against a previously identified bug.

## Test Execution and Output

After implementing the tests:

1. Run the relevant test scope first.
2. If appropriate, run the complete project test suite.
3. Report which test files were created or updated.
4. Summarize the scenarios covered.
5. Report the test result, including passed, failed, or skipped tests when available.
6. If a test fails because of an existing production-code defect, explain the failure clearly and do not hide or weaken the test.
7. Do not remove assertions or reduce coverage only to make tests pass.

If tests cannot be executed, clearly state why and describe what remains unverified.