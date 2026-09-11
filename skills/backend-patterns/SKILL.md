---
name: backend-patterns
description: 'Use this skill when making structural backend decisions - layering business logic, transaction boundaries, background jobs, idempotency, and inter-service communication patterns. Load when the question is not "add this endpoint" but "how should this server-side logic be structured". For API surface design, use api-conventions instead. Triggers include: "business logic layering", "service layer", "transaction boundary", "background job", "idempotency", "retry pattern", "queue architecture", "where does business logic go".'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Backend Patterns

Structural decision patterns for server-side logic. Complements `api-conventions` (which owns API surface design): this skill owns *how logic behind the API is organized*.

---

## When to Use This Skill

| Situation | Use this skill | Use api-conventions instead |
|---|---|---|
| "Where does this business rule live?" | Yes | |
| "Design this endpoint's request/response" | | Yes |
| "How do I make this job retry safely?" | Yes | |
| "What status code should errors return?" | | Yes |
| "Is this transaction boundary right?" | Yes | |

---

## Layering

Thin transport, fat domain, explicit persistence:

1. **Transport** (routes, controllers, consumers): parse input, call domain, map errors to responses. No business decisions here.
2. **Domain / services**: business rules, orchestration, invariants. Pure where possible; framework-agnostic so it is unit-testable without HTTP.
3. **Persistence / repositories**: queries and writes. No business rules; the domain decides *what* to persist, this layer decides *how*.

Signal of violation: a controller that computes prices, or a repository that decides whether an order is refundable.

---

## Transaction Boundaries

- One business operation = one transaction. Write-side side effects (email, queue publish) go **after commit**, never inside the transaction.
- Decide optimistic vs pessimistic concurrency explicitly when two writers can conflict; prefer optimistic with version checks unless contention is proven high.
- Cross-aggregate operations that must be atomic share a transaction; those that cannot (external calls) use the outbox/saga pattern instead of hoping for the best.

---

## Background Jobs

- Job handlers are idempotent by construction: assume the job may run twice with the same payload.
- Payload contains IDs and minimal data; handlers re-read current state and re-validate preconditions.
- Every job declares its retry policy and its poison path (what happens after max retries: dead-letter, alert, or drop).
- Scheduled jobs tolerate overlap (locks or leader election) rather than assuming single execution.

---

## Idempotency & Retries

| Operation type | Pattern |
|---|---|
| Reads | Safe to retry freely |
| Idempotent writes (upsert by natural key) | Retry with backoff |
| Non-idempotent writes (charge, decrement) | Idempotency key from the caller; dedupe on server |
| Multi-step workflows | Saga with compensating actions |

Retries: exponential backoff with jitter, bounded attempts, and no retry on non-transient errors (4xx logic errors will never succeed on retry).

---

## Inter-Service Communication

- Prefer in-process modular boundaries until a real forcing function (independent scaling, deploys, or teams) exists; premature microservices are distributed monoliths.
- Contracts between services are explicit and versioned; no shared database tables as the integration point.
- Timeouts, bounded retries, and a fallback behavior exist for every network call.

---

## Checklist

```markdown
- [ ] Controllers/handlers contain no business decisions
- [ ] Domain logic unit-testable without HTTP/framework
- [ ] One business operation = one transaction; side effects after commit
- [ ] Job handlers idempotent with declared retry policy and poison path
- [ ] Non-idempotent writes protected by idempotency keys
- [ ] Every external call has timeout, bounded retry, fallback
```

---

## References

- For endpoint/request-response design: use `api-conventions`
- For schema and query structure behind repositories: use `database`
- For migration planning: use `database-migration`