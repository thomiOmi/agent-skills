# WebSocket Conventions

## When to Use

Real-time bidirectional: live feeds, chat, collaborative editing, notifications.
Not for request/response patterns where REST or GraphQL suffices.

## Message Envelope

```json
{
  "type": "message.sent",
  "payload": { "roomId": "room_123", "text": "Hello" },
  "id": "msg_abc",
  "timestamp": "2026-01-15T10:00:00Z"
}
```

- `type` — `resource.action` pattern
- `payload` — event data
- `id` — for deduplication and ack
- `timestamp` — ISO 8601 UTC

## Rules

```text
✅ Define a message type registry — no ad-hoc type strings
✅ Handle reconnection and message replay on the client
✅ Authenticate on connection, not per-message
❌ Do not mix REST and WebSocket for the same resource
```
