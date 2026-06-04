# Sequence Diagrams

Use Mermaid.js `sequenceDiagram` syntax.
For architecture topology, see `architecture.md`.

---

## Syntax Reference

```mermaid
sequenceDiagram
    actor User
    participant ServiceA
    participant ServiceB
    participant DB

    User->>ServiceA: Synchronous request
    ServiceA->>DB: Query
    DB-->>ServiceA: Result (dashed = response)
    ServiceA-->>User: Response

    ServiceA-)ServiceB: Async message (no wait)
    Note over ServiceA,ServiceB: Async processing
```

---

## Login Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant DB
    participant Cache

    User->>Frontend: Submit credentials
    Frontend->>API: POST /auth/login { email, password }
    API->>Cache: Check rate limit for IP
    Cache-->>API: OK (not rate limited)
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record
    API->>API: Validate password hash
    API->>DB: INSERT session token
    DB-->>API: OK
    API-->>Frontend: 200 { token, expires_at }
    Frontend-->>User: Redirect to dashboard
```

---

## Password Reset Flow

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB
    participant Queue
    participant EmailWorker

    User->>API: POST /auth/password-reset { email }
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record (or null)
    Note over API: Always return 200 regardless of result
    API->>DB: INSERT reset_token WHERE user exists
    API->>Queue: publish password.reset.requested
    API-->>User: 200 { message: check your email }

    Queue->>EmailWorker: consume event
    EmailWorker->>User: Send reset email with token link
```

---

## Rules

```text
✅ Use actor for humans, participant for systems
✅ Dashed arrows (-->) for responses, solid (->) for requests
✅ Use Note to annotate important decisions or async boundaries
✅ Show error flows as separate diagrams — do not branch inside one diagram
✅ Name participants consistently across all diagrams in the project
```
