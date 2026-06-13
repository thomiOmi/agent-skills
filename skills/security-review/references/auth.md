# Authentication and Authorization Review

---

## Authentication Checklist

```markdown
Passwords:
- [ ] Passwords hashed with bcrypt, argon2, or scrypt (not MD5 or SHA-1)
- [ ] Minimum password requirements enforced
- [ ] Password confirmation required on change
- [ ] Old password verified before changing to new one

Tokens:
- [ ] Session tokens are cryptographically random and unpredictable
- [ ] Tokens have an expiry time
- [ ] Tokens are invalidated on logout
- [ ] Tokens are invalidated when password changes
- [ ] Refresh tokens have a longer but still finite expiry

Brute-force protection:
- [ ] Rate limiting on login endpoint
- [ ] Account lockout after N failed attempts (or progressive delay)
- [ ] CAPTCHA or similar challenge after repeated failures

Multi-factor authentication:
- [ ] MFA codes expire after one use
- [ ] MFA codes expire after a short time window (30–60 seconds)
- [ ] Backup codes are one-time use
- [ ] MFA enrollment requires re-authentication
```

---

## Authorization Checklist

```markdown
Endpoint protection:
- [ ] Every protected endpoint checks authentication
- [ ] Every protected endpoint checks authorization (not just identity)
- [ ] Authorization is checked on the server — not trusted from the client
- [ ] Object-level authorization: user can only access their own resources

Role-based access:
- [ ] Roles are defined and enforced consistently
- [ ] Role assignments are auditable
- [ ] Privilege escalation requires explicit admin action
- [ ] Default role for new users is the least-privileged role

Common failures to check:
- [ ] Changing an ID in the URL does not expose another user's data
- [ ] Changing a role parameter in the request body has no effect
- [ ] Deleting a resource requires ownership or admin permission
- [ ] Bulk operations check permissions on every item, not just the first
```

---

## Password Reset Flow Review

A secure password reset flow must:

```text
1. Accept only the email address — do not confirm whether it exists
   (consistent response prevents user enumeration)
2. Generate a cryptographically random, single-use token
3. Store a hash of the token, not the token itself
4. Send the token via email to the registered address only
5. Expire the token after a short time window (15–60 minutes)
6. Invalidate the token after first use
7. Invalidate all active sessions after password reset
8. Log the reset event with timestamp and IP
```
