# Field Conventions

These conventions must be confirmed with the user before designing any API.
Do not assume defaults — format choices affect every consumer of the API.

---

## Clarification Required

Before designing request/response shapes, ask:

```
1. What is the success response envelope?
   - { data: {...} } — with a data wrapper
   - { success: true, data: {...} } — with an explicit success flag
   - Bare object — no wrapper
   - Other (describe)

2. What is the error/problem response format?
   - RFC 7807 Problem Details: { type, title, status, detail, instance }
   - Custom envelope: { error: { code, message, details: [...] } }
   - { success: false, message, errors: [...] }
   - Other (describe)

3. What naming convention for JSON keys?
   - camelCase: { userId, createdAt }
   - snake_case: { user_id, created_at }
   - Follows the project's existing convention (check codebase first)

4. What date/time format?
   - ISO 8601 UTC: "2026-01-15T10:00:00Z"
   - MySQL format: "2026-01-15 10:00:00" (YYYY-MM-DD HH:mm:ss)
   - Unix timestamp (integer seconds): 1736935200
   - Other (describe)

5. What ID format?
   - String UUID: "usr_123e4567-e89b-12d3"
   - Integer: 42
   - Prefixed string: "usr_abc123"
   - ULID or CUID
```

Record the answers and apply them consistently for the entire project.
If a project-level AGENTS.md defines these, use those definitions without asking.

---

## Non-Negotiable Conventions

These apply regardless of the chosen format:

| Field type | Rule |
|-----------|------|
| Monetary values | Integer cents — `"amount": 1999` for $19.99 |
| Boolean flags | Explicit `true`/`false` — not `1`/`0` or `"yes"`/`"no"` |
| Nullable fields | Explicit `null` — do not omit the field |
| Arrays | Empty array `[]` — not `null` when empty |

---

## Common Date Format Reference

| Format | Example | Use when |
|--------|---------|----------|
| ISO 8601 UTC | `"2026-01-15T10:00:00Z"` | APIs consumed by multiple clients or timezones |
| MySQL | `"2026-01-15 10:00:00"` | Backends storing directly to MySQL/MariaDB |
| Unix timestamp | `1736935200` | High-frequency APIs, logging, mobile |
| Date only | `"2026-01-15"` | Dates without time (birthdays, deadlines) |

---

## RFC 7807 Problem Details Reference

When the project uses RFC 7807 for error responses:

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The email field must be a valid email address.",
  "instance": "/api/v1/users",
  "errors": [
    { "field": "email", "message": "Must be a valid email address." }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | URI identifying the error type |
| `title` | Yes | Short human-readable summary |
| `status` | Yes | HTTP status code |
| `detail` | No | Human-readable explanation |
| `instance` | No | URI of the specific occurrence |

---

## Consistency Rule

Once a format is chosen, it must be applied to every endpoint in the project.

```
❌ Do not mix date formats across endpoints
❌ Do not return bare objects on some endpoints and wrapped on others
❌ Do not mix camelCase and snake_case in the same API
❌ Do not use different error shapes for different endpoints
```
