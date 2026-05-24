---
name: planning
description: >
  Use this skill when designing systems, planning projects, or creating visual
  artifacts before writing code. Triggers: "buat ERD", "design database",
  "MVP plan", "timeline", "flowchart", "system design",
  "architecture diagram", "user flow", "wireframe", "roadmap",
  "milestone". Use this skill before starting any non-trivial project or
  feature.
license: MIT
compatibility: Designed for OpenCode, Claude Code, Cursor, and similar AI coding agents. No system dependencies required.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Planning

Structured approach for designing systems and planning projects before writing code.
Always plan before you build — a 30-minute planning session prevents hours of rework.

---

## When to Use This Skill

| Request | Artifact to produce |
|---------|-------------------|
| "Design the database" | ERD |
| "Plan this project" | MVP doc + milestone timeline |
| "How should this flow?" | Flowchart or user flow diagram |
| "Design the system" | Architecture diagram |
| "What should we build first?" | MVP scope + prioritized backlog |
| "Plan the next sprint" | Task breakdown + timeline |

---

## ERD (Entity Relationship Diagram)

Use when designing or reviewing a database schema.

### Notation

```
ENTITY [PK, FK, field: type]

Relationships:
  ||--||   one-to-one
  ||--o{   one-to-many
  }o--o{   many-to-many
```

### Template

```
## ERD: [System Name]

### Entities

USER
  - id: uuid (PK)
  - email: varchar(255) UNIQUE NOT NULL
  - created_at: timestamptz NOT NULL DEFAULT now()

ORDER
  - id: uuid (PK)
  - user_id: uuid (FK → USER.id)
  - status: enum('pending','paid','shipped','cancelled')
  - total_cents: int NOT NULL
  - created_at: timestamptz NOT NULL DEFAULT now()

ORDER_ITEM
  - id: uuid (PK)
  - order_id: uuid (FK → ORDER.id)
  - product_id: uuid (FK → PRODUCT.id)
  - quantity: int NOT NULL CHECK (quantity > 0)
  - unit_price_cents: int NOT NULL

PRODUCT
  - id: uuid (PK)
  - name: varchar(255) NOT NULL
  - price_cents: int NOT NULL
  - stock: int NOT NULL DEFAULT 0

### Relationships
USER      ||--o{ ORDER       : "places"
ORDER     ||--o{ ORDER_ITEM  : "contains"
PRODUCT   ||--o{ ORDER_ITEM  : "included in"
```

### Rules

```
✅ Every table must have a primary key (prefer uuid over int for portability)
✅ Use timestamptz for all datetime fields — not timestamp
✅ Monetary values in integer cents — not float
✅ Foreign keys must reference the PK of the parent table
✅ Add NOT NULL where the field is always required
❌ Do not use generic names: data, info, record, item (without context)
❌ Do not store multiple values in one column — normalize instead
❌ Do not skip indexes on foreign key columns
```

---

## MVP (Minimum Viable Product) Document

Use when scoping a new product or feature to avoid over-building.

### Template

```markdown
## MVP: [Feature or Product Name]

### Problem
[1–2 sentences: what problem does this solve and for whom?]

### Goal
[1 sentence: what does success look like after this MVP ships?]

### In Scope (must have)
- [ ] [Feature 1 — minimum version, not the ideal version]
- [ ] [Feature 2]
- [ ] [Feature 3]

### Out of Scope (explicitly excluded)
- [Feature A — nice to have, but not MVP]
- [Feature B — phase 2]

### Success Metrics
- [Metric 1: e.g. "User can complete checkout in < 3 steps"]
- [Metric 2: e.g. "Error rate < 1%"]

### Risks
- [Risk 1 — mitigation]
- [Risk 2 — mitigation]

### Estimated effort
[S / M / L / XL — and a rough breakdown by area]
```

### Rules

```
✅ In scope items must be the minimum viable version, not the ideal version
✅ Out of scope must be explicit — ambiguity leads to scope creep
✅ Success metrics must be measurable
❌ Do not add "nice to have" items to In Scope
❌ Do not start building until MVP doc is reviewed
```

---

## Timeline & Milestones

Use when planning delivery across multiple weeks or sprints.

### Template

```markdown
## Timeline: [Project Name]

| Milestone | Deliverable | Target date | Status |
|-----------|-------------|-------------|--------|
| M1: Foundation | Repo setup, CI, DB schema | Week 1 | ⏳ |
| M2: Core API | Auth + core CRUD endpoints | Week 2–3 | ⏳ |
| M3: Frontend | Basic UI connected to API | Week 4–5 | ⏳ |
| M4: MVP launch | End-to-end tested, deployed | Week 6 | ⏳ |

Status: ⏳ Planned · 🟡 In Progress · ✅ Done · 🔴 Blocked
```

### Rules

```
✅ Each milestone must have one clear, testable deliverable
✅ Keep milestones to 1–2 week chunks — longer = harder to track
✅ Add buffer: multiply your estimate by 1.3–1.5 for realistic dates
❌ Do not combine unrelated work in one milestone
❌ Do not mark a milestone done until the deliverable is verified
```

---

## Flowchart / User Flow

Use when mapping out a process, decision tree, or user journey.

### Notation (text-based, tool-agnostic)

```
[START]
  ↓
[Step / Action]
  ↓
<Decision?>
  ├── Yes → [Action A]
  └── No  → [Action B]
              ↓
           [END]
```

### Example: User login flow

```
[User submits login form]
  ↓
<Credentials valid?>
  ├── No  → [Show error message] → [User retries]
  └── Yes
        ↓
      <MFA enabled?>
        ├── No  → [Issue session token] → [Redirect to dashboard]
        └── Yes → [Send OTP] → [User enters OTP]
                                  ↓
                                <OTP valid?>
                                  ├── No  → [Show error, allow retry]
                                  └── Yes → [Issue session token] → [Redirect]
```

### Rules

```
✅ Every flow must have a clear START and END
✅ Every decision node must have all possible branches covered
✅ Keep flows to one screen / one concern — split complex flows
❌ Do not skip error paths — they are as important as happy paths
```

---

## System Architecture Diagram

Use when designing how components interact.

### Template

```
## Architecture: [System Name]

### Components

CLIENT
  - Web browser / Mobile app
  - Communicates via: HTTPS REST / GraphQL

API GATEWAY
  - Auth validation
  - Rate limiting
  - Routes to services

SERVICE: Auth
  - Handles login, token issuance, MFA
  - DB: PostgreSQL (users table)

SERVICE: Orders
  - Handles order creation, payment, fulfillment
  - DB: PostgreSQL (orders, order_items tables)
  - Emits events to: Message Queue

MESSAGE QUEUE (e.g. Redis / RabbitMQ)
  - Decouples services
  - Consumed by: Notification Service

SERVICE: Notifications
  - Sends email/SMS on order events
  - External: SendGrid, Twilio

### Request Flow (example: place order)
CLIENT → API GATEWAY → SERVICE: Orders → DB
                                       → MESSAGE QUEUE → SERVICE: Notifications
```

### Rules

```
✅ Show every external dependency (payment provider, email, SMS, CDN)
✅ Note the communication protocol between components (REST, gRPC, events)
✅ Identify single points of failure
❌ Do not skip the data store — always show where data lives
❌ Do not design in isolation — review existing architecture first
```

---

## Planning Checklist

```
- [ ] Problem and goal clearly stated
- [ ] ERD completed if database is involved
- [ ] MVP scope defined (in scope AND out of scope)
- [ ] Timeline has milestones with deliverables and dates
- [ ] Flowcharts cover happy path AND error paths
- [ ] Architecture shows all components and their communication
- [ ] Risks identified with mitigations
- [ ] Plan reviewed before implementation starts
```
