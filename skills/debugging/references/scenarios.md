# Debugging Specific Scenarios

## Flaky Tests (fails sometimes, passes sometimes)

Likely causes:

- **Shared state** between tests — one test pollutes another
- **Time dependency** — assumes specific clock time or duration
- **Race condition** — async operations in different orders
- **Real network calls** — inherently unreliable in tests

Fix: isolate the test, mock time/network, reset state between tests.

## Works Locally, Fails in CI/Prod

Checklist:

```markdown
- [ ] All env vars set in target environment?
- [ ] Runtime/language version the same?
- [ ] All dependencies installed at the same version?
- [ ] Hardcoded paths or local-only assumptions?
- [ ] DB/service available and seeded correctly?
```

## Performance Bug (too slow)

Do not guess — measure first:

```text
1. Profile the code (cProfile, Chrome DevTools, go pprof, etc.)
2. Identify the top hotspot
3. Fix only that hotspot
4. Measure again to confirm improvement
```

## Anti-Patterns — Never Do These

```text
❌ Guess and check: changing random things until it works
❌ Hiding the bug: catching exceptions silently, adding null checks blindly
❌ Fixing the wrong layer: symptom in UI when bug is in the API
❌ Big-bang changes: changing 10 things at once
❌ No regression test: fixing without preventing recurrence
```
