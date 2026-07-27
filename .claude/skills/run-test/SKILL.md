---
name: run-test
description: Run the complete automated test suite for this Spring Boot project and clearly report the results. Use this skill when the user asks to run tests, verify changes, validate the project, or check whether the build works correctly.
---

# Run Project Tests

Run the complete automated test suite from the project root.

## Steps

1. Confirm that the current directory is the project root and contains `pom.xml`.

2. Run the tests using the Maven Wrapper:

   ```bash
   ./mvnw test
   ```

3. Do not skip any tests.

4. After the test execution, clearly report:

   - Whether all tests passed.
   - The number of tests run.
   - The number of passed, failed, errored, and skipped tests.
   - The names of any failing tests.
   - The likely cause of each failure.

5. If the tests fail because of Docker, PostgreSQL, Testcontainers, configuration, or another environment problem, explain that separately from code failures.

6. Do not modify production code or test code unless the user explicitly asks to fix the failures.

7. After making any requested fix, run the complete test suite again and report the final result.