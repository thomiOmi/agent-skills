---
name: debugging
description: Use this skill when diagnosing bugs, unexpected errors, or incorrect behavior. Triggers: "ada bug", "error ini", "kenapa gagal", "fix this", "something is wrong", "tests are failing", "unexpected output", "crash", "exception". Never guess the cause — always diagnose systematically before proposing a fix.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# Debugging

Systematic approach to diagnosing and fixing bugs.
**Never guess the cause. Diagnose first, fix second.**

## Workflow

```
STEP 1 — Reproduce
STEP 2 — Read the error
STEP 3 — Locate the failure point
STEP 4 — Trace the root cause
STEP 5 — Fix
STEP 6 — Verify
STEP 7 — Prevent recurrence
```

See `references/workflow.md` for full step-by-step guide.
See `references/error-types.md` for common error signals and root causes.
See `references/scenarios.md` for debugging flaky tests, prod-only failures, and performance issues.

---

## Core Rule

```
❌ Wrong: "The bug is probably X, let me fix it."
✅ Right: "Let me reproduce it, read the error, trace the cause, then fix it."
```

## Checklist

```
- [ ] Bug is reproduced consistently
- [ ] Full error message and stack trace read
- [ ] Failure point located in the code
- [ ] Root cause identified (not just the symptom)
- [ ] Fix addresses the root cause
- [ ] Fix is minimal and isolated
- [ ] Original reproduction case verified as fixed
- [ ] Full test suite passes
- [ ] Regression test written
- [ ] Debug logs removed from committed code
```
