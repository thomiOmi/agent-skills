# Test Templates

## Unit Test Structure

```markdown
TEST: [unit]_[scenario]_[expected result]

  ARRANGE
    [input variable] = [value]
    [dependency] = [test double if needed]

  ACT
    [result] = [function under test]([input variable])

  ASSERT
    [result] equals [expected value]
    [or: error of type [ErrorType] was raised]
    [or: [side effect] occurred exactly once]
```

---

## Integration Test Structure

```markdown
TEST: [endpoint or operation]_[scenario]_[expected result]

  ARRANGE
    [entity] = create [entity type] in test database with [attributes]
    [auth token] = authenticate as [role] if required

  ACT
    [response] = send [METHOD] request to [path] with [body if any]

  ASSERT
    [response status] equals [expected status code]
    [response body field] equals [expected value]
    [database state] reflects [expected change] if applicable

  CLEANUP
    Remove [entity] from test database
    [or: rollback transaction]
```

---

## Test Case Documentation

```mardown
TEST CASE: TC-[number] — [Descriptive title]

Type:         Unit | Integration | E2E | Performance | Security
Priority:     Critical | High | Medium | Low

Precondition: [State that must exist before the test runs]

Steps:
  1. [First action]
  2. [Second action]
  3. [Observe result]

Expected:     [What should happen]
Actual:       [Filled in when test fails]

Notes:        [Any relevant context or known limitations]
```

---

## Test Suite Checklist Template

```markdown
FEATURE: [Feature or module name]

Coverage targets:
  [ ] Happy path — valid input returns expected output
  [ ] Boundary — empty, zero, maximum, null
  [ ] Error — invalid input raises correct error
  [ ] Business rules — [list specific rules for this feature]
  [ ] Side effects — [list expected DB changes, events, notifications]
  [ ] Permissions — unauthorized access is rejected

Test types needed:
  [ ] Unit tests
  [ ] Integration tests
  [ ] E2E tests (if user-facing)
  [ ] Contract tests (if cross-service)
  [ ] Performance tests (if latency-sensitive)
```
