# Security Review Templates

## Security Review Report

```markdown
# Security Review: [Feature / Module Name]

**Date:** YYYY-MM-DD
**Reviewer:** [name or agent]
**Scope:** [what was reviewed]
**Risk level:** Critical | High | Medium | Low

---

## Findings

### [CRITICAL] [Finding title]

**Location:** [file path, line number]
**Category:** [OWASP category]
**Description:** [What the vulnerability is]
**Impact:** [What an attacker could do]
**Recommendation:** [How to fix it]

---

### [HIGH] [Finding title]

[same structure as above]

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |

## Checklist Results

- [x] Authentication reviewed
- [x] Authorization reviewed
- [x] Input validation reviewed
- [ ] Data exposure reviewed — findings above
- [x] Error handling reviewed
- [x] Rate limiting reviewed
```

---

## Security Checklist (quick reference)

```markdown
Authentication:
- [ ] Passwords hashed with strong algorithm
- [ ] Brute-force protection in place
- [ ] Tokens expire and are invalidated on logout

Authorization:
- [ ] Every endpoint checks permissions
- [ ] Object-level access control enforced

Input:
- [ ] Parameterized queries used everywhere
- [ ] User input validated before use
- [ ] File uploads validated

Data:
- [ ] No sensitive data in logs
- [ ] Secrets in environment variables
- [ ] HTTPS enforced

Errors:
- [ ] No stack traces exposed to clients
- [ ] Consistent error responses for auth failures
```
