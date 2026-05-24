---
name: api-conventions
description: >
  Use this skill when designing, reviewing, or documenting any API — REST,
  GraphQL, or WebSocket. Triggers: "add an endpoint", "design the API",
  "add a route", "GraphQL schema", "WebSocket", "response format". Read the
  existing API surface before designing anything new.
license: MIT
compatibility: Designed for OpenCode, Claude Code, Cursor, and similar AI coding agents. No system dependencies required.
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# API Conventions

Framework-agnostic guidelines for clean, consistent, evolvable APIs.
Applies to Express, FastAPI, Gin, Rails, Laravel, Spring, and others.

## Before You Design

Always answer these first:

1. Who is the consumer? (internal service, public client, mobile app)
2. What resource or action does this represent?
3. Does something similar already exist? (read the codebase first)
4. Which protocol fits best? (REST, GraphQL, or WebSocket — see below)

**Do not design in isolation — read the existing API surface first.**

---

## Choosing the Right Protocol

| Use | When |
|-----|------|
| **REST** | Standard CRUD, resource-oriented, HTTP caching matters |
| **GraphQL** | Clients need flexible queries, multiple resource types in one request, rapid frontend iteration |
| **WebSocket** | Real-time bidirectional communication (chat, live updates, collaborative editing) |

---

## REST

### URLs

Resources are **nouns, plural**. HTTP verbs express the action.

```
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

### HTTP Methods

| Method | Purpose | Idempotent |
|--------|---------|-----------|
| GET | Read | ✅ |
| POST | Create or trigger action | ❌ |
| PUT | Replace entirely | ✅ |
| PATCH | Partial update | ✅ |
| DELETE | Remove | ✅ |

### Response Shapes

Single resource:
```json
{ "data": { "id": "usr_123", "email": "user@example.com", "createdAt": "2026-01-15T10:00:00Z" } }
```

Collection:
```json
{ "data": [...], "meta": { "total": 142, "page": 1, "perPage": 20 } }
```

Error — consistent across all endpoints:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [{ "field": "email", "message": "Must be a valid email address" }]
  }
}
```

### Status Codes

| Code | When |
|------|------|
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

```
❌ Never return 200 for an error
❌ Never return 500 for a client mistake
```

### Versioning

- Version in URL path: `/v1/users`, `/v2/orders`
- Never make breaking changes to an existing version
- Breaking: removing fields, changing types, changing semantics
- Non-breaking: adding optional fields, adding new endpoints

---

## GraphQL

### Schema Design

- Types are **nouns, singular, PascalCase**: `User`, `Order`, `PaymentMethod`
- Queries are **camelCase verbs**: `user(id)`, `orders(filter)`, `currentUser`
- Mutations describe the action: `createUser`, `updateOrder`, `deleteProduct`

```graphql
type Query {
  user(id: ID!): User
  orders(filter: OrderFilter, page: Int, perPage: Int): OrderConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateOrder(id: ID!, input: UpdateOrderInput!): UpdateOrderPayload!
}
```

### Mutation Payload Pattern

Every mutation returns a payload type — never the bare resource:

```graphql
type CreateUserPayload {
  user: User          # null on failure
  errors: [UserError!]!
}

type UserError {
  field: String       # null = top-level error
  message: String!
}
```

### Error Handling

Use the payload pattern above — not HTTP 4xx errors (except for auth failures).
Return `errors: []` on success, `user: null` + `errors: [...]` on failure.

### Rules

```
❌ Do not return raw errors via HTTP 400/422 for GraphQL validation failures
❌ Do not use generic type names: Data, Result, Response
✅ Use connection types for paginated lists: UserConnection, OrderConnection
✅ Use input types for mutations: CreateUserInput, not bare args
```

---

## WebSocket

### When to use

Real-time: live data feeds, collaborative editing, chat, notifications.
Not for: request/response patterns where REST or GraphQL suffices.

### Message Format

Use a consistent envelope for all messages:

```json
{
  "type": "message.sent",
  "payload": { "roomId": "room_123", "text": "Hello" },
  "id": "msg_abc",
  "timestamp": "2026-01-15T10:00:00Z"
}
```

- `type` — event name, `resource.action` pattern
- `payload` — event data
- `id` — for deduplication and ack
- `timestamp` — ISO 8601 UTC

### Rules

```
✅ Define a message type registry — do not use ad-hoc type strings
✅ Handle reconnection and message replay on the client
✅ Authenticate on connection, not per-message
❌ Do not mix REST and WebSocket for the same resource — pick one
```

---

## Field Conventions (all protocols)

- **Naming:** camelCase for JSON (or match existing codebase — be consistent)
- **Dates:** ISO 8601 UTC — `"2026-01-15T10:00:00Z"`
- **IDs:** string, not integer — `"id": "usr_123"`
- **Money:** integer cents — `"amount": 1999` for $19.99
- **Nullable:** explicit `null` over omitting the field

---

## OpenAPI / Swagger

For REST APIs, maintain an OpenAPI spec (`openapi.yaml` or `openapi.json`).
Every endpoint must document: purpose, auth, request shape, response shape, error codes.
Keep spec and implementation in sync — use code-gen or validation in CI if possible.

---

## Review Checklist

```
- [ ] Protocol choice justified (REST vs GraphQL vs WebSocket)
- [ ] REST: resource name is noun, plural, consistent with existing API
- [ ] REST: HTTP method matches operation semantics
- [ ] REST: response uses standard envelope shape
- [ ] REST: status codes correct (no 200 for errors, no 500 for client errors)
- [ ] GraphQL: mutation uses payload + errors pattern
- [ ] GraphQL: paginated lists use connection types
- [ ] WebSocket: message envelope is consistent
- [ ] Dates are ISO 8601 UTC
- [ ] Breaking changes are versioned
- [ ] Endpoint / type is documented
- [ ] Existing similar API surface checked — no duplication
```
