# Input Validation and Injection Prevention

---

## Principles

1. Validate at every boundary — do not trust data from any external source.
2. Validate type, format, range, and length — not just presence.
3. Reject invalid input — do not try to sanitize and guess intent.
4. Use allowlists, not denylists — define what is allowed, not what is forbidden.

---

## SQL Injection Prevention

**Always use parameterized queries or ORM methods.**

Never construct queries by concatenating user input:

```text
Wrong approach:
  query = "SELECT * FROM users WHERE email = '" + user_input + "'"

Correct approach:
  Use ORM methods: Model.where(email: user_input)
  Or parameterized: query("SELECT * FROM users WHERE email = ?", [user_input])
```

**Review checklist:**

- [ ] No string concatenation in database queries
- [ ] All ORM raw query methods (`whereRaw`, `selectRaw`, `DB::raw`, etc.) reviewed for injection
- [ ] Stored procedures reviewed for dynamic SQL construction

---

## XSS Prevention

**Encode output before rendering to HTML.**

- HTML encode all user-supplied content rendered in HTML
- Use Content Security Policy headers to restrict script sources
- Do not use `innerHTML`, `dangerouslySetInnerHTML`, or equivalent with user input
- Validate and sanitize HTML if rich text input is required (use a trusted parser)

---

## File Upload Validation

Validate uploads at multiple layers:

```text
1. File extension — allowlist only expected extensions
2. MIME type — check the actual content type, not just the claimed type
3. File size — enforce maximum size limit
4. File content — scan for malicious content if handling untrusted uploads
5. Storage — store uploaded files outside the web root
6. Filename — never use the original filename; generate a random name
```

---

## Input Validation Checklist

```markdown
- [ ] All input fields validated for type (string, integer, boolean, date)
- [ ] String length limits enforced
- [ ] Numeric ranges validated (min and max)
- [ ] Date formats validated and parsed safely
- [ ] Email addresses validated against a standard format
- [ ] URLs validated and restricted to allowed protocols (http, https only)
- [ ] File uploads validated for type, size, and content
- [ ] No user input passed directly to database queries
- [ ] No user input passed to OS commands or eval
- [ ] HTML output encoded before rendering
```
