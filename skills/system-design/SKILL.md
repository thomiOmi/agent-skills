---
name: system-design
description: 'Use this skill when designing systems, services, data flows, and overall software architecture. Trigger with "design a system for", "how should we architect", "system design for", "architecture for", or when evaluating service boundaries, storage choices, or API design. Do not design systems without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# System Design

Framework for designing systems, evaluating architectural decisions, and modeling component interactions.

---

## Design Framework

### 1. Requirements Gathering
- **Functional Requirements**: What the system must do.
- **Non-Functional Requirements**: Scale, latency, availability, consistency, cost.
- **Constraints**: Timeline, team familiarity, existing tech stack.

### 2. High-Level Design
- Component diagrams and service boundaries (using Mermaid.js `graph TD`).
- Data flow and communication protocols (REST, gRPC, WebSockets, Pub/Sub).
- Storage engine choices (Relational, KV, Document, Time-series).

### 3. Deep Dive
- Data model and schema design.
- API contracts and endpoint design.
- Caching strategy and queue/event handling.
- Error handling, retries, and circuit breakers.

### 4. Scale & Reliability
- Load estimation and capacity planning.
- Horizontal vs. vertical scaling.
- Failover, redundancy, monitoring, and alerting.

### 5. Trade-off Analysis
Explicitly document complexity, cost, time-to-market, and maintainability trade-offs.

---

## Example Component Diagram

```mermaid
flowchart TD
    Client[Web / Mobile Client] --> Gateway[API Gateway / Load Balancer]
    Gateway --> Auth[Auth Service]
    Gateway --> OrderService[Order Service]
    OrderService --> Cache[(Redis Cache)]
    OrderService --> DB[(PostgreSQL Database)]
    OrderService --> Queue[Message Queue]
    Queue --> Worker[Background Worker]
```

---

## Verification Checklist

```markdown
- [ ] Functional and non-functional requirements documented
- [ ] Component diagram rendered in Mermaid.js syntax
- [ ] Data storage and communication protocols defined
- [ ] Failover and scaling strategy addressed
- [ ] Explicit trade-off analysis provided
```
