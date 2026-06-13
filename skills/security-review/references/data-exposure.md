# Sensitive Data Handling

---

## Classification

Before reviewing, identify what data the feature handles:

| Category | Examples | Protection level |
| ---------- | --------- | ----------------- |
| Credentials | Passwords, API keys, tokens | Never store plain text; hash or encrypt |
| Payment data | Card numbers, CVV, bank accounts | PCI-DSS compliance; never log |
| PII | Name, email, phone, address, national ID | Minimize collection; encrypt at rest |
| Health data | Medical records, diagnoses | HIPAA compliance; strict access control |
| Session data | Session tokens, auth cookies | Expire; invalidate on logout |

---

## Storage Rules

```text
Passwords:
- Hash with bcrypt, argon2, or scrypt (minimum cost factor: bcrypt 10+)
- Never store the plain text password — not even temporarily
- Never store a reversible encryption of the password

API keys and secrets:
- Store in environment variables or a secrets manager
- Never commit to version control
- Rotate on exposure

PII:
- Encrypt at rest using a strong symmetric algorithm (AES-256)
- Minimize what is stored — collect only what is needed
- Define and enforce a retention policy — delete when no longer needed
```

---

## Logging Rules

```text
NEVER log:
- Passwords (even failed login attempts — log only that the attempt occurred)
- Full credit card numbers (log only last 4 digits if needed)
- CVV or CVC codes
- Session tokens or auth tokens
- Full API keys (log only a prefix for identification)
- Social security or national ID numbers

SAFE to log:
- User ID or anonymized identifier
- Timestamp and IP address
- Action performed
- Request path (without query parameters containing sensitive data)
- Error type (without stack trace in production)
```

---

## Transport Rules

```text
- Use HTTPS for all endpoints — redirect HTTP to HTTPS
- Do not pass sensitive data in URL query parameters
  (URLs appear in browser history, server logs, and referrer headers)
- Use POST body for credentials and sensitive payloads
- Set secure and httpOnly flags on cookies
- Set SameSite attribute on cookies to prevent CSRF
```

---

## Data Exposure Checklist

```markdown
- [ ] Sensitive fields excluded from API responses (password_hash, internal IDs)
- [ ] Error responses do not expose stack traces, file paths, or internal details
- [ ] Passwords are hashed — not stored or logged in plain text
- [ ] API keys and secrets stored in environment variables
- [ ] PII encrypted at rest
- [ ] Sensitive data not passed in URL parameters
- [ ] Logging reviewed — no sensitive fields in log output
- [ ] Inactive data deleted according to retention policy
- [ ] API responses return only the fields the client needs (no over-fetching)
```
