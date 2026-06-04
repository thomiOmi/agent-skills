---
name: api-conventions
description: Use this skill when designing, reviewing, or documenting any API — REST, GraphQL, or WebSocket. Triggers: "add an endpoint", "design the API", "add a route", "GraphQL schema", "WebSocket", "response format". Read the existing API surface before designing anything new.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.1.0"
  author: thomiOmi
---

# API Conventions

Framework-agnostic guidelines for clean, consistent, evolvable APIs.

---

## Clarify Before Designing

Before writing any endpoint, schema, or response shape, confirm:

1. **Who is the consumer?** (internal service, public client, mobile app)
2. **Does something similar already exist?** (read the codebase first — do not duplicate)
3. **Which protocol fits?** → see `references/protocol-choice.md`
4. **What is the success response format?** → ask the user or check project AGENTS.md
5. **What is the error/problem response format?** → ask the user or check project AGENTS.md
6. **What naming convention for JSON keys?** → ask the user or check existing endpoints

For questions 4–6: if not defined in the project-level AGENTS.md, ask before proceeding.
See `references/field-conventions.md` for the full clarification checklist and format options.

---

## References

- `references/protocol-choice.md` — REST vs GraphQL vs WebSocket
- `references/rest.md` — URLs, HTTP methods, status codes, versioning
- `references/graphql.md` — schema design, mutation payload pattern
- `references/websocket.md` — message envelope, auth, reconnection
- `references/field-conventions.md` — response formats, naming, clarification checklist

---

## Review Checklist

```markdown
- [ ] Success and error response format confirmed with user or project AGENTS.md
- [ ] JSON key naming convention confirmed
- [ ] Protocol choice justified (REST vs GraphQL vs WebSocket)
- [ ] REST: resource name is noun, plural, consistent with existing API
- [ ] REST: HTTP method matches operation semantics
- [ ] REST: status codes correct (no 200 for errors, no 500 for client errors)
- [ ] GraphQL: mutation uses payload + errors pattern
- [ ] GraphQL: paginated lists use connection types
- [ ] WebSocket: message envelope is consistent
- [ ] Dates are ISO 8601 UTC
- [ ] Breaking changes are versioned
- [ ] Endpoint is documented
- [ ] No duplication with existing API surface
```
