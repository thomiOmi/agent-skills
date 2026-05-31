# Field Conventions

Applies to all protocols (REST, GraphQL, WebSocket).

- **Naming:** camelCase for JSON (match existing codebase — be consistent)
- **Dates:** ISO 8601 UTC — `"2026-01-15T10:00:00Z"`
- **IDs:** string, not integer — `"id": "usr_123"`
- **Money:** integer cents — `"amount": 1999` for $19.99
- **Nullable:** explicit `null` over omitting the field
