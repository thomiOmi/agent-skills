---
name: code-review
description: 'Use this skill when reviewing pull requests, inspecting code quality, auditing diffs, or conducting peer code reviews. Trigger with "review this code", "code review", "audit PR", "check diff", "find code smells", or before approving merge requests. Do not perform code reviews without this skill loaded.'
license: MIT
metadata:
  version: "1.1.0"
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

## Tech Lead Review Priorities

When reviewing as the tech lead (cross-domain, standards enforcement), check in this order:

1. **Layering**: no business decisions in controllers/handlers; no transport or persistence concerns leaking across layers.
2. **Boundaries**: input validated at every system boundary (routes, consumers); errors explicit, no silent catches.
3. **Duplication**: the same logic must not live in two places; shared code goes to a shared module, not a copy-paste.
4. **Cross-domain consistency**: frontend and backend patterns agree (naming of API fields, error shapes, pagination style).
5. **Scope discipline**: the diff does what the task says - flag drive-by refactors and unrelated changes as out of scope.

A review that only lists style issues is a failed review: style belongs to automated lint, not to the lead's time.

---

## Verification Checklist

```markdown
- [ ] Logic correctness verified against requirements
- [ ] Error paths and boundary edge cases covered
- [ ] No hardcoded secrets, tokens, or PII
- [ ] Unit/integration tests added or updated
- [ ] All functions/classes have descriptive docstrings
```
