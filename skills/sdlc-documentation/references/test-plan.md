# Test Plan

```markdown
# Test Plan: [Feature / Release Name]

**Version:** 1.0
**Date:** YYYY-MM-DD
**Related:** PRD v[X], SDD v[X]

## Scope
[What will and will not be tested]

## Test Types

| Type | Tool | Owner | Target |
|------|------|-------|--------|
| Unit | [framework] | Dev | 80%+ coverage |
| Integration | [framework] | Dev | All endpoints |
| E2E | [tool] | QA | Critical user flows |
| Performance | [tool] | Dev/Ops | p95 < 200ms |
| Security | OWASP ZAP | Security | OWASP Top 10 |

## Test Cases

### TC-01: [Test case name]
- **Type:** Unit | Integration | E2E
- **Precondition:** [state before test]
- **Steps:** [numbered steps]
- **Expected result:** [what should happen]
- **Priority:** Critical | High | Medium | Low

## Entry Criteria
- [ ] Feature implementation complete
- [ ] Unit tests passing
- [ ] Deployed to test environment

## Exit Criteria
- [ ] All Critical and High test cases pass
- [ ] No open Critical bugs
- [ ] Performance targets met
```
