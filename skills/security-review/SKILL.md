---
name: security-review
description: Use this skill when auditing, reviewing, or improving security in any codebase. Triggers: "audit security", "security review", "OWASP", "check auth", "input validation", "SQL injection", "XSS", "sensitive data", "is this secure", "review permissions", "check for vulnerabilities". Apply before shipping any feature that handles auth, user data, payments, or external input.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Security Review

Systematic approach to identifying and fixing security vulnerabilities.
Language-agnostic — applies to any framework or stack.

---

## Before Reviewing

1. What data does this feature handle? (user data, payments, credentials, PII)
2. Which OWASP Top 10 categories are most relevant to this feature?
3. Are there compliance requirements? (GDPR, PCI-DSS, HIPAA)
4. What is the attack surface? (public API, internal API, file upload, user input)

---

## References

- `references/owasp.md` — OWASP Top 10 checklist with examples
- `references/auth.md` — authentication and authorization review checklist
- `references/input-validation.md` — injection prevention and sanitization
- `references/data-exposure.md` — sensitive data handling and encryption

See `assets/templates.md` for security review report template.

---

## Hard Rules

```
❌ Never store passwords in plain text — always hash with a strong algorithm
❌ Never log sensitive data (passwords, tokens, PII, card numbers)
❌ Never trust user input — validate and sanitize at every boundary
❌ Never expose internal error details to the client
❌ Never hardcode credentials, API keys, or secrets in source code
❌ Never disable security controls (CSRF, rate limiting) without documented justification
✅ Authenticate every request that accesses protected resources
✅ Authorize after authenticating — check permissions, not just identity
✅ Use parameterized queries or ORM for all database operations
✅ Encrypt sensitive data at rest and in transit
```

---

## Security Review Checklist

```
Authentication and Authorization:
- [ ] All protected routes require authentication
- [ ] Authorization checked after authentication (not just identity)
- [ ] Privilege escalation not possible through parameter manipulation
- [ ] Session tokens are invalidated on logout

Input Handling:
- [ ] All user input is validated before use
- [ ] Parameterized queries used for all database operations
- [ ] File uploads validated for type, size, and content
- [ ] Output is encoded before rendering to prevent XSS

Data Protection:
- [ ] Sensitive data is not logged
- [ ] Passwords are hashed — not stored in plain text or reversibly encrypted
- [ ] API keys and credentials stored in environment variables
- [ ] Sensitive data encrypted at rest

Error Handling:
- [ ] Internal error details not exposed to clients
- [ ] Error responses do not leak stack traces or file paths
- [ ] Consistent error responses for auth failures (no user enumeration)

Transport:
- [ ] HTTPS enforced for all endpoints
- [ ] Sensitive data not passed in URL query parameters
- [ ] Security headers configured (CORS, CSP, HSTS)

Rate Limiting:
- [ ] Authentication endpoints are rate limited
- [ ] Sensitive operations have rate limiting applied
```
