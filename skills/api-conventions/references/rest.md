# REST Conventions

## URLs

Resources are **nouns, plural**. HTTP verbs express the action.

```text
✅  GET    /users
✅  GET    /users/{id}
✅  POST   /users
✅  PATCH  /users/{id}
✅  DELETE /users/{id}
✅  GET    /users/{id}/orders

❌  GET    /getUser
❌  POST   /createUser
❌  GET    /users/delete/{id}
```

No trailing slashes. Lowercase, kebab-case: `/payment-methods`.

## HTTP Methods

| Method | Purpose | Idempotent |
| -------- | --------- | ----------- |
| GET | Read | ✅ |
| POST | Create or trigger | ❌ |
| PUT | Replace entirely | ✅ |
| PATCH | Partial update | ✅ |
| DELETE | Remove | ✅ |

## Response Shapes

Single resource:

```json
{ "data": { "id": "usr_123", "email": "user@example.com", "createdAt": "2026-01-15T10:00:00Z" } }
```

Collection:

```json
{ "data": [...], "meta": { "total": 142, "page": 1, "perPage": 20 } }
```

Error (consistent across all endpoints):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [{ "field": "email", "message": "Must be a valid email address" }]
  }
}
```

## Status Codes

| Code | When |
| ------ | ------ |
| 200 | Successful GET, PATCH, PUT |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no body) |
| 400 | Invalid input |
| 401 | Missing or invalid auth |
| 403 | Authenticated but not authorized |
| 404 | Not found |
| 409 | Conflict (duplicate unique field) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

```text
❌ Never return 200 for an error
❌ Never return 500 for a client mistake
```

## Versioning

- Version in URL path: `/v1/users`, `/v2/orders`
- Never make breaking changes to an existing version
- Breaking: removing fields, changing types, changing semantics
- Non-breaking: adding optional fields, adding new endpoints
