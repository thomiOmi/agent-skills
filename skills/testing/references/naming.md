# Test Naming

A test name should make the failure message self-explanatory — without reading the code.

---

## Pattern

```
[unit under test]_[scenario or condition]_[expected result]
```

Or in sentence form:
```
[scenario] should [expected result]
```

Both are acceptable. Choose one and apply it consistently across the project.

---

## Components

**Unit under test**
The function, method, or module being tested.
Use the actual name — do not abbreviate or rephrase.

**Scenario or condition**
The specific input, state, or circumstance being tested.
Be precise: `withNegativeAttempt` not `badInput` · `whenRateLimitExceeded` not `errorCase`

**Expected result**
What the test asserts will happen.
Be observable: `returnsEmptyList` not `works` · `throwsValidationError` not `fails`

---

## Examples by Pattern

| Subject | Scenario | Expected result | Full name |
|---------|----------|----------------|-----------|
| `calculateRetryDelay` | zero-indexed first attempt | returns base delay | `calculateRetryDelay_firstAttempt_returnsBaseDelay` |
| `calculateRetryDelay` | attempt count is negative | raises error | `calculateRetryDelay_negativeAttempt_raisesError` |
| `calculateRetryDelay` | very high attempt count | caps at maximum | `calculateRetryDelay_highAttempt_capsAtMaximum` |
| `mergePermissions` | deny in base, allow in overrides | deny wins | `mergePermissions_denyInBase_denyWinsOverAllow` |

---

## Anti-Patterns

| Bad | Why | Better |
|-----|-----|--------|
| `test_1`, `test_2` | No information about what is tested | Use the full pattern |
| `testWorks`, `testOk` | No information about the scenario | Specify what "works" means |
| `testError` | Does not say which error or when | `createUser_duplicateEmail_throwsConflictError` |
| `testLogin` | Does not say which login scenario | `login_expiredToken_returnsUnauthorized` |
| `testCalculateRetryDelayUsesExponentialFormula` | Describes implementation, not behavior | `calculateRetryDelay_secondAttempt_doublesBaseDelay` |

---

## Grouping (describe / context blocks)

When the language supports test grouping, group by unit under test:

```
[ClassName or module name]
  [method or function name]
    [scenario 1] should [expected result]
    [scenario 2] should [expected result]
```

Nest no more than two levels — deeper nesting makes tests hard to navigate.
