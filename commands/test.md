---
description: Run and improve tests for the given scope
agent: qa-engineer
---

Handle testing for: $ARGUMENTS

If no scope is given, run the project's default test suite and report results.

Workflow:
1. Detect the test runner from project config (package.json, composer.json, pyproject, etc.).
2. Load the `testing` skill.
3. Run the relevant tests.
4. If failures: diagnose root cause and propose/fix with minimal changes.
5. If pass but coverage is thin for new logic: add focused tests.
6. Report pass/fail, what was added, and residual risk.
