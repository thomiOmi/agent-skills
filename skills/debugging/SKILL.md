---
name: debugging
description: 'Use this skill whenever something is wrong -  bugs, errors, crashes, slow performance, incorrect output, or unexpected behavior. Do NOT guess the cause -  this skill enforces a systematic diagnosis-before-fix workflow. Load this skill proactively whenever the user reports a problem, even if they phrase it casually or in a non-English language. Triggers include: "ada bug", "error ini", "kenapa gagal", "fix this", "something is wrong", "tests are failing", "unexpected output", "crash", "why is this slow", "performance issue", "N+1 query", "this is broken", "this doesnt work", "debug this", "trace this error", "root cause", "regression", "flaky test". Also use when the user reports a problem in any informal way -  "error", "bug", "broken", "not working", "slow", "crash", "fail".'
license: MIT
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Debugging

Systematic approach to diagnosing and fixing bugs.
**Never guess the cause. Diagnose first, fix second.**

## Examples

### Bug: Login fails for users with accented characters in their name

```text
Input:  User "José" tries to log in with correct password
Output: Login fails with "invalid credentials"

STEP 1 -  Reproduce: Successfully reproduced with accented name, works without accent
STEP 2 -  Read the error: The auth API returns 401 for "José" but 200 for "Jose"
STEP 3 -  Locate: The normalization function at src/auth/normalize.ts strips diacritics but the password hash was computed BEFORE normalization
STEP 4 -  Trace root cause: Hash is computed on raw input, then normalized for lookup to mismatch
STEP 5 -  Fix: Normalize input before hashing
STEP 6 -  Verify: "José" now logs in, existing users unaffected
STEP 7 -  Prevent: Add test for diacritic inputs in the auth test suite
```

---

## Core Rule

```text
Wrong: "The bug is probably X, let me fix it."
Right: "Let me reproduce it, read the error, trace the cause, then fix it."
```

## Workflow

```text
STEP 1 -  Reproduce
STEP 2 -  Read the error
STEP 3 -  Locate the failure point
STEP 4 -  Trace the root cause
STEP 5 -  Fix
STEP 6 -  Verify
STEP 7 -  Prevent recurrence
```

---

## References

- `references/workflow.md` -  full step-by-step guide for each step
- `references/error-types.md` -  common error signals and their typical root causes
- `references/scenarios.md` -  flaky tests, prod-only failures, performance bugs, anti-patterns

See `assets/templates.md` for bug report and RCA document templates.

---

## Checklist

```markdown
- [ ] Bug is reproduced consistently
- [ ] Full error message and stack trace read (not just the first line)
- [ ] Failure point located in the code
- [ ] Root cause identified -  not just the symptom
- [ ] Fix addresses the root cause, not a symptom
- [ ] Fix is minimal and isolated from unrelated changes
- [ ] Original reproduction case verified as fixed
- [ ] Full test suite passes
- [ ] Regression test written
- [ ] Debug logs removed from committed code
```
