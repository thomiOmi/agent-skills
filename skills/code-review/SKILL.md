---
name: code-review
description: 'Use this skill when reviewing pull requests, inspecting code quality, auditing diffs, or conducting peer code reviews. Trigger with "review this code", "code review", "audit PR", "check diff", "find code smells", or before approving merge requests. Do not perform code reviews without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Code Review

Guidelines for auditing code changes, detecting code smells, and conducting constructive peer reviews.

---

## Code Review Framework

1. **Scope & Intent**: Read the PR description and understand *what* the change is trying to achieve.
2. **Correctness & Edge Cases**: Verify logic handles invalid input, missing parameters, nulls, and error paths.
3. **Security**: Check for unvalidated user input, secrets, hardcoded values, and authorization gaps.
4. **Testing**: Confirm new logic has corresponding unit/integration tests covering happy and error paths.
5. **Maintainability**: Identify code smells (duplicated logic, monolithic functions, unclear variable names).

---

## Severity Ratings

- `[CRITICAL]`: Security vulnerability, data corruption, or crash in production. Must fix before merge.
- `[HIGH]`: Incorrect logic, missing error handling, or performance regression.
- `[MEDIUM]`: Code smell, missing test coverage, or unhandled edge case.
- `[LOW]`: Naming clarification or minor readability improvement.

---

## Verification Checklist

```markdown
- [ ] Logic correctness verified against requirements
- [ ] Error paths and boundary edge cases covered
- [ ] No hardcoded secrets, tokens, or PII
- [ ] Unit/integration tests added or updated
- [ ] All functions/classes have descriptive docstrings
```
