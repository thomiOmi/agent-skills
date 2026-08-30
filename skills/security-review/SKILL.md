---
name: security-review
description: 'Use this skill when auditing, reviewing, or improving security in any codebase. Load this skill proactively before shipping any feature that handles authentication, user data, payments, PII, or external input - do not wait for the user to ask for a security review. Also use when the user mentions compliance, penetration testing, vulnerabilities, or security best practices. Triggers include: "audit security", "security review", "OWASP", "check auth", "input validation", "SQL injection", "XSS", "sensitive data", "is this secure", "review permissions", "check for vulnerabilities", "penetration test", "compliance", "GDPR", "PCI", "SOC2", "threat model", "CVE", "security audit", "authentication review", "authorization check", "data exposure". Apply before shipping any feature that handles auth, user data, payments, or external input - even if the user does not explicitly mention security.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Security Review

Systematic approach to identifying and fixing security vulnerabilities.
Language-agnostic - applies to any framework or stack.

---

## Examples

### Vulnerability finding: User ID in URL allows enumeration

```text
Input:  GET /api/users/123 - returns user profile
Issue:  No authorization check - any authenticated user can access any profile
Risk:   High - user data exposed, competitor could enumerate active users
Fix:    Check req.user.id === requestedUserId before returning data
```

---

## Before Reviewing

1. What data does this feature handle? (user data, payments, credentials, PII)
2. Which OWASP Top 10 categories are most relevant to this feature?
3. Are there compliance requirements? (GDPR, PCI-DSS, HIPAA)
4. What is the attack surface? (public API, internal API, file upload, user input)

---

## References

- `references/owasp.md` - OWASP Top 10 checklist with examples
- `references/auth.md` - authentication and authorization review checklist
- `references/input-validation.md` - injection prevention and sanitization
- `references/data-exposure.md` - sensitive data handling and encryption

See `assets/templates.md` for security review report template.

---

## Hard Rules

```text
Never store passwords in plain text - always hash with a strong algorithm
   Why: A database breach would expose all credentials. Hashing makes them computationally infeasible to reverse.

Never log sensitive data (passwords, tokens, PII, card numbers)
   Why: Logs often leak via misconfigured permissions, monitoring tools, or third-party services - making sensitive data accessible outside the security boundary.

Never trust user input - validate and sanitize at every boundary
   Why: Every input boundary is an attack surface. Injection, XSS, and path traversal all start with unsanitized input.

Never expose internal error details to the client
   Why: Stack traces and internal paths reveal framework versions, file structure, and potential exploit targets.

Never hardcode credentials, API keys, or secrets in source code
   Why: Source code ends up in CI logs, package registries, and Git history - all of which lack credential rotation and access controls.

Never disable security controls (CSRF, rate limiting) without documented justification
   Why: Disabling controls silently creates regression risk. Even temporary disablement can persist through deployments if undocumented.

Authenticate every request that accesses protected resources
   Why: Unauthenticated access to protected routes is a direct path to data exfiltration and privilege escalation.

Authorize after authenticating - check permissions, not just identity
   Why: Authentication proves who you are. Authorization proves what you can do. A logged-in user should not automatically be an admin.

Use parameterized queries or ORM for all database operations
   Why: String concatenation in SQL is the root cause of SQL injection - the #1 OWASP vulnerability class. Parameterized queries separate code from data.

Encrypt sensitive data at rest and in transit
   Why: Data at rest on disk or in backups can be exfiltrated without touching the application. Data in transit can be intercepted on the network.
```

---

## Security Review Checklist

```markdown
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
- [ ] Passwords are hashed - not stored in plain text or reversibly encrypted
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
