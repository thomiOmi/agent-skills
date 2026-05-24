---
name: debugging
description: Use this skill when diagnosing bugs, unexpected errors, or incorrect behavior. Triggers: "ada bug", "error ini", "kenapa gagal", "tidak berfungsi", "fix this", "something is wrong", "tests are failing", "unexpected output", "crash", "exception". Never guess the cause — always diagnose systematically before proposing a fix.
license: MIT
compatibility: Designed for OpenCode, Claude Code, Cursor, and similar AI coding agents. No system dependencies required.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Debugging

Systematic approach to diagnosing and fixing bugs.
**Never guess the cause. Diagnose first, fix second.**

---

## Core Rule

```
❌ Wrong: "The bug is probably X, let me fix it."
✅ Right: "Let me reproduce it, read the error, trace the cause, then fix it."
```

Guessing wastes time and introduces new bugs. Always follow the diagnostic workflow.

---

## Diagnostic Workflow

```
STEP 1 — Reproduce
STEP 2 — Read the error
STEP 3 — Locate the failure point
STEP 4 — Trace the cause
STEP 5 — Fix
STEP 6 — Verify
STEP 7 — Prevent recurrence
```

---

## STEP 1 — Reproduce

**Goal:** Confirm the bug exists and understand the exact conditions that trigger it.

Questions to answer:
```
- What exact input or action triggers the bug?
- Does it happen every time, or only sometimes?
- What environment? (OS, runtime version, browser, device)
- Does it happen in a fresh environment too?
- When did it start? What changed recently?
```

If the bug cannot be reproduced → do not fix it. Find the reproduction case first.

```
❌ Do not fix an unreproduced bug — you may fix the wrong thing
✅ Write a failing test that reproduces the bug before fixing it
```

---

## STEP 2 — Read the Error

**Goal:** Extract maximum information from the error message and stack trace.

Checklist:
```
- [ ] Read the full error message — not just the first line
- [ ] Read the full stack trace — identify which line in your code triggered it
- [ ] Note the error type (TypeError, KeyError, NullPointerException, etc.)
- [ ] Note any error codes (HTTP 500, ECONNREFUSED, etc.)
- [ ] Check the logs — look for events that happened before the error
```

Common error signals:

| Error type | Usually means |
|-----------|---------------|
| `NullPointerException` / `TypeError: Cannot read property of undefined` | Something is null/undefined that should not be |
| `KeyError` / `IndexError` | Accessing a key or index that does not exist |
| `ECONNREFUSED` | Service or port is not running |
| `ETIMEDOUT` | Network call took too long — check latency or firewall |
| `PermissionError` | File or resource access denied |
| `SyntaxError` | Code cannot be parsed — check recent edits |
| HTTP 401 | Auth token missing, expired, or invalid |
| HTTP 403 | Authenticated but not authorized |
| HTTP 500 | Server-side error — check server logs |

---

## STEP 3 — Locate the Failure Point

**Goal:** Find the exact line or function where the incorrect behavior originates.

Techniques:

**Binary search / bisect**
Narrow down by halving the search space:
```
Does the bug happen before or after line 50?
→ Before: look at lines 1–50
→ After: look at lines 50–100
Repeat until you find the exact line.
```

**Add logging at key points**
```python
print(f"[DEBUG] value before transform: {value}")
result = transform(value)
print(f"[DEBUG] value after transform: {result}")
```
Remove all debug logs after fixing.

**Comment out code**
Temporarily disable sections to isolate which part causes the issue.

**Read the code, not just the error**
Read the function that threw the error. Then read what calls it. Trace backwards.

---

## STEP 4 — Trace the Cause

**Goal:** Understand **why** the failure happens, not just **where**.

Ask at each level:
```
Why did this value become null?
  → Because the caller passed null.
Why did the caller pass null?
  → Because the DB query returned no results.
Why did the DB query return no results?
  → Because the user_id was wrong.
Why was the user_id wrong?
  → Because the JWT was decoded with the wrong key.
```

Keep asking "why" until you reach the root cause — not just a symptom.

**Common root causes:**

| Symptom | Common root cause |
|---------|------------------|
| Wrong value in DB | Bug in write path (creation/update logic) |
| Intermittent failures | Race condition, timeout, or flaky network |
| Works locally, fails in prod | Environment difference (env vars, versions, data) |
| Works for one user, fails for another | Permission or data isolation bug |
| Fails after a recent deploy | Regression — check the diff |
| Fails after dependency update | Breaking change in upstream library |

---

## STEP 5 — Fix

**Goal:** Fix the root cause, not the symptom.

Rules:
```
✅ Fix the root cause identified in Step 4
✅ Make the smallest change that fixes the bug
✅ Keep the fix isolated — do not refactor surrounding code at the same time
❌ Do not add null checks to hide a bug without understanding why it's null
❌ Do not catch and swallow exceptions without logging or handling them
❌ Do not change multiple things at once — you won't know which one fixed it
```

**Before writing the fix, state it clearly:**
```
Root cause: [what was wrong and why]
Fix: [what exactly will change and why this fixes the root cause]
Side effects: [what else might be affected]
```

---

## STEP 6 — Verify

**Goal:** Confirm the bug is gone and nothing else broke.

Checklist:
```
- [ ] Original reproduction case no longer triggers the bug
- [ ] Failing test (from Step 1) now passes
- [ ] Full test suite passes
- [ ] Manually tested in the same environment where the bug occurred
- [ ] Edge cases around the fix tested (null input, empty list, max value, etc.)
```

---

## STEP 7 — Prevent Recurrence

**Goal:** Make sure this class of bug cannot silently happen again.

Actions:
```
- [ ] Write a regression test that would have caught this bug
- [ ] Add a comment explaining why the fix works (if non-obvious)
- [ ] Check if the same bug pattern exists elsewhere in the codebase
- [ ] Update docs or type definitions if a misunderstanding caused the bug
- [ ] Add input validation or a guard if the root cause was unexpected input
```

---

## Debugging Specific Scenarios

### Flaky tests (fails sometimes, passes sometimes)

Likely causes:
- **Shared state** between tests — one test pollutes another's environment
- **Time dependency** — test assumes a specific clock time or duration
- **Race condition** — async operations completing in different orders
- **Network calls** — real network calls in tests are inherently unreliable

Fix pattern: isolate the test, mock time/network, reset state between tests.

### Works locally, fails in CI/prod

Checklist:
```
- [ ] Are all env vars set in the target environment?
- [ ] Is the runtime/language version the same?
- [ ] Are all dependencies installed (and at the same version)?
- [ ] Are there any hardcoded paths or local-only assumptions?
- [ ] Is the DB/service available and seeded correctly?
```

### Performance bug (too slow)

Do not guess where the bottleneck is — measure first:
```
1. Profile the code (cProfile, Chrome DevTools, go pprof, etc.)
2. Identify the top hotspot
3. Fix only that hotspot
4. Measure again to confirm improvement
```

---

## Anti-Patterns — Never Do These

```
❌ Guess and check: changing random things until it works
❌ Hiding the bug: catching exceptions silently, adding null checks without understanding why
❌ Fixing the wrong layer: fixing a symptom in the UI when the bug is in the API
❌ Big-bang changes: changing 10 things at once and not knowing what fixed it
❌ Skipping verification: assuming the fix worked without testing it
❌ No regression test: fixing the bug without preventing it from coming back
```

---

## Debugging Checklist

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
