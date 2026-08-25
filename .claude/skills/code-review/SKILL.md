---
name: code-review
description: Review this project's code against CLAUDE.md, project requirements, and existing code conventions. Use when reviewing a feature, implementation, branch, diff, or code changes for correctness, architecture, security, maintainability, and compliance with the project specification.
disable-model-invocation: true
---

# Project Code Review

Review the requested code against this project's specifications and established conventions.

## Review Process

1. Read `CLAUDE.md` first and treat it as the primary project specification.
2. Inspect the relevant implementation and surrounding code needed to understand the change.
3. Compare the implementation with existing project patterns and requirements.
4. Report concrete issues only. Do not modify code unless the user explicitly asks for fixes.

## Review Checklist

Check the code for:

- Project specification compliance: Verify that the implementation follows `CLAUDE.md` and the stated task requirements.
- Correctness: Look for logic errors, incorrect assumptions, broken edge cases, and behavior that does not match the requirements.
- Architecture: Verify that responsibilities are placed in the appropriate controller, service, repository, mapper, DTO, entity, and configuration layers.
- Security and authorization: Check authentication, role restrictions, method-level authorization, and exposure of sensitive operations or data.
- Validation and error handling: Check request validation, exception handling, invalid states, and meaningful API behavior.
- Database and persistence: Check entity relationships, constraints, migrations, repository queries, transaction behavior, and potential data consistency issues.
- API design: Check HTTP methods, status codes, request/response DTOs, endpoint structure, pagination, and consistency with existing APIs.
- Maintainability: Identify unnecessary duplication, overly complex code, unclear responsibilities, and deviations from established project conventions.
- Tests: Identify important behavior or edge cases that are missing test coverage.

## Review Output

For each issue found, report:

1. Severity: Critical, High, Medium, or Low.
2. Location: File path and relevant class, method, or line when available.
3. Issue: Clearly explain what is wrong.
4. Why it matters: Explain the impact on correctness, security, maintainability, or project compliance.
5. Recommendation: Describe the smallest appropriate fix.

Do not report speculative or purely stylistic issues unless they violate the project specification or an established project convention.

If no concrete issues are found, state that the reviewed code complies with the checked project requirements and mention any remaining test coverage gaps or areas that could not be verified.