# Test Structure and What to Test

## AAA Pattern

Every test: **Arrange → Act → Assert**

```python
def test_merge_permissions_deny_wins_over_allow():
    # Arrange
    base      = {"read": "allow", "write": "deny"}
    overrides = {"write": "allow"}

    # Act
    result = merge_permissions(base, overrides)

    # Assert
    assert result["write"] == "deny"
```

## What to Test

**Always:**
- Happy path (valid input → expected output)
- Boundary values (empty, zero, max, None/null, empty string)
- Error cases (invalid input → correct exception or error response)
- Business rule enforcement (quotas, permissions, state transitions)

**For each function, ask:**
- What happens with valid input?
- What happens at the boundary?
- What happens when a dependency fails?
- What side effects should occur — and what must NOT occur?

## What NOT to Test

- Private methods or internal state
- Framework or library behavior
- Trivial getters/setters with no logic
- Exact log message strings

## Integration Tests

- Use a real test database, not mocks, for DB integration tests
- Clean up state after each test — tests must not depend on order
- Use transactions rolled back after each test where possible

## File Organization

Match test files to source files or co-locate — follow whatever convention exists in the project.
