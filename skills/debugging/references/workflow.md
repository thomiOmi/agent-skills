# Debugging Workflow

## STEP 1 — Reproduce

Before touching any code, confirm the bug exists and understand the exact conditions that trigger it.

Questions to answer:

- What exact input, action, or state triggers the bug?
- Does it happen every time, or only under certain conditions?
- What environment does it occur in? (operating system, runtime version, browser, deployment target)
- When did it first appear? What changed around that time? (recent deploy, config change, dependency update)

**Do not attempt to fix a bug that cannot be reproduced.**
Write a failing test that reproduces the bug before making any changes.
This ensures the fix is verifiable and prevents regression.

---

## STEP 2 — Read the Error

Extract maximum information before looking at any code.

- Read the full error message — not just the first line.
- Read the full stack trace — identify which line in your codebase triggered it (skip framework internals).
- Note the error type or error code.
- Check the application logs for events that occurred immediately before the error.
- Check recent deployment logs or changelogs if the error appeared after a deploy.

---

## STEP 3 — Locate the Failure Point

Find the exact location in the code where the incorrect behavior originates.

**Bisection approach:**
Divide the execution path in half. Determine whether the error occurs in the first half or the second half.
Continue halving until the failure point is identified.
This works for both code paths and data pipelines.

**Temporary logging:**
Insert log statements at key points to observe the actual state of the system at runtime.
Log the value of variables before and after suspicious transformations.
Remove all temporary log statements before committing the fix.

**Commenting out sections:**
Temporarily disable blocks of code to isolate which section is responsible.
Re-enable sections one by one until the bug reappears.

---

## STEP 4 — Trace the Root Cause

Understand **why** the failure happens — not just where.

Apply the "five whys" technique. Start with the symptom and ask why it occurred.
Continue asking why for each answer until you reach a cause that cannot be traced further back.

Example chain:

```text
Symptom: the API returned a 500 error
Why?    The query returned no results
Why?    The user ID in the query was null
Why?    The JWT was decoded with the wrong signing key
Why?    The key rotation was applied to production but not to the auth service config
Root cause: missing config update during key rotation
```

Stop at the root cause — not at a symptom.

**Common root cause patterns:**

| Symptom | Likely root cause |
| --------- | ----------------- |
| Wrong value stored in database | Bug in the write path — creation or update logic |
| Intermittent failure | Race condition, timeout, or flaky external dependency |
| Works locally, fails in production | Environment difference — env vars, runtime version, seed data |
| Fails for one user, works for another | Permission, tenancy, or data isolation bug |
| Fails after a recent deploy | Regression — review the diff |
| Fails after a dependency update | Breaking change in the upstream package |

---

## STEP 5 — Fix

State the fix clearly before writing any code:

```text
Root cause:   [what was actually wrong and why it happened]
Fix:          [what will change and why this addresses the root cause]
Side effects: [what else might be affected by this change]
```

Rules:

- Fix the root cause — not a symptom.
- Make the smallest change that corrects the behavior.
- Do not refactor surrounding code in the same commit as a bug fix.
- Do not add null checks or exception catches to hide a bug without understanding why it occurs.
- Do not change multiple things at once — you will not know which change fixed the bug.

---

## STEP 6 — Verify

- Confirm that the original reproduction case no longer triggers the bug.
- Confirm that the failing test now passes.
- Run the full test suite to confirm no regressions were introduced.
- Test manually in the environment where the bug was observed.
- Test boundary conditions around the fix — values just above and below the affected range.

---

## STEP 7 — Prevent Recurrence

- Write a regression test that would have caught this bug before it reached production.
- Add an explanatory comment if the fix is non-obvious and future developers might revert it.
- Search the codebase for the same pattern in other locations and fix them proactively.
- If the bug was caused by unexpected input, add input validation at the boundary.
- If the bug was caught late, consider what monitoring or alerting would have surfaced it earlier.
