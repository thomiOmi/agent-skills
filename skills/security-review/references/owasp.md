# OWASP Top 10

Reference for the most critical web application security risks.
Use this as the primary checklist for any security review.

---

## A01 — Broken Access Control

Users can act outside their intended permissions.

**Check for:**

- Direct object references (can user A access user B's data by changing an ID?)
- Missing authorization checks on API endpoints
- CORS misconfiguration allowing unauthorized origins
- Privilege escalation through parameter manipulation
- Accessing admin functions without admin role

**Review questions:**

- Is every endpoint that returns or modifies data checking the user's permission?
- Are object IDs validated against the authenticated user's ownership?
- Can a regular user reach any admin-only endpoint?

---

## A02 — Cryptographic Failures

Sensitive data exposed due to weak or missing encryption.

**Check for:**

- Passwords stored in plain text or with weak hashing (MD5, SHA-1)
- Sensitive data transmitted over HTTP
- Sensitive data logged in plain text
- Weak encryption algorithms or hardcoded encryption keys
- Sensitive data in URL parameters (appears in logs and browser history)

**Review questions:**

- Are passwords hashed with a modern algorithm (bcrypt, argon2, scrypt)?
- Is all data in transit encrypted with TLS?
- Are any secrets or credentials stored in source code or config files?

---

## A03 — Injection

Untrusted data sent to an interpreter causes unintended execution.

**Types:** SQL injection, command injection, LDAP injection, NoSQL injection

**Check for:**

- Raw user input concatenated into database queries
- Raw user input passed to OS commands or shell functions
- Unsanitized input used in template engines
- Unparameterized queries anywhere in the codebase

**Review questions:**

- Are all database queries using parameterized queries or ORM methods?
- Is any user input passed to `exec()`, `eval()`, or shell execution functions?

---

## A04 — Insecure Design

Fundamental security flaws in the design, not just the implementation.

**Check for:**

- Missing rate limiting on authentication and sensitive endpoints
- No account lockout after repeated failed attempts
- Password reset flows that allow account takeover
- Missing validation of business logic (e.g. negative quantities, price manipulation)

---

## A05 — Security Misconfiguration

Insecure default settings, incomplete configurations.

**Check for:**

- Debug mode enabled in production
- Default credentials not changed
- Unnecessary features or endpoints enabled
- Missing security headers (CORS, CSP, HSTS, X-Frame-Options)
- Verbose error messages exposing stack traces to users
- Directory listing enabled on web server

---

## A06 — Vulnerable and Outdated Components

Using components with known vulnerabilities.

**Check for:**

- Dependencies with known CVEs (check with `npm audit`, `composer audit`, etc.)
- Outdated framework or library versions
- Unused dependencies that expand the attack surface

---

## A07 — Identification and Authentication Failures

Weaknesses in authentication implementation.

**Check for:**

- Weak or easily guessable default passwords
- Missing or ineffective brute-force protection
- Session tokens not invalidated on logout
- Session tokens with no expiry
- Password reset tokens that do not expire or can be reused
- Weak password requirements

---

## A08 — Software and Data Integrity Failures

Code and infrastructure that does not protect against integrity violations.

**Check for:**

- Deserialization of untrusted data without validation
- Auto-update features without integrity verification
- CI/CD pipeline that can be influenced by untrusted inputs

---

## A09 — Security Logging and Monitoring Failures

Insufficient logging prevents detection of breaches.

**Check for:**

- Authentication events not logged (login, logout, failed attempts)
- High-value transactions not logged
- Logs stored only locally with no centralization
- No alerting on suspicious activity patterns

**What to log:**

- Login attempts (success and failure) with IP address
- Access to sensitive resources
- Privilege escalation events
- Input validation failures (may indicate probing)

**What NOT to log:**

- Passwords (even hashed)
- Full credit card numbers
- Session tokens or API keys
- PII beyond what is necessary for audit purposes

---

## A10 — Server-Side Request Forgery (SSRF)

Server makes requests to attacker-controlled destinations.

**Check for:**

- Endpoints that fetch URLs provided by the user
- No validation or allowlist for external URLs
- Internal services accessible via SSRF (metadata endpoints, internal APIs)
