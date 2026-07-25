---
name: planning
description: 'Use this skill when creating or reviewing technical design artifacts — system architecture, data models, component diagrams, sequence diagrams, ERDs, flowcharts, and user flows. Load this skill proactively any time the user asks about architecture, design, or structure before writing code. Domain-agnostic — works for any project type. For formal PRD, SDD, or requirements documents, use sdlc-documentation instead. Triggers include: "design the database", "ERD", "system architecture", "flowchart", "review the system design", "audit the data model", "sequence diagram", "component diagram", "user flow", "architecture review", "data flow", "state machine", "dependency graph", "system design interview", "how does this work", "visualize this", "draw a diagram". Use Mermaid.js syntax for all diagrams so they render natively in markdown.'
license: MIT
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Planning

Structured approach for creating technical design artifacts before building.
Always design before you build — a 30-minute design session prevents hours of rework.

---

## Examples

### Input: "Design the order checkout flow"

Mermaid `flowchart TD`:

```mermaid
flowchart TD
    A[Cart Page] --> B{User clicks Checkout}
    B --> C[Validate Cart]
    C -->|Cart valid| D[Collect Shipping]
    C -->|Cart empty| E[Show Error: empty cart]
    D --> F[Collect Payment]
    F --> G{Payment Success?}
    G -->|Yes| H[Create Order]
    G -->|No| I[Show Error: payment failed]
    H --> J[Send Confirmation Email]
    J --> K[Redirect to Order Confirmation]
```

---

## When to Use This Skill

| Request                        | Artifact               | Format                    |
| ------------------------------ | ---------------------- | ------------------------- |
| "Design the database"          | ERD                    | Mermaid `erDiagram`       |
| "How should this flow?"        | Flowchart or user flow | Mermaid `flowchart TD`    |
| "Design the system"            | Architecture diagram   | Mermaid `graph TD`        |
| "Map out the sequence"         | Sequence diagram       | Mermaid `sequenceDiagram` |
| "Show component relationships" | Component diagram      | Mermaid `graph LR`        |

All diagrams use **Mermaid.js** syntax — renders in GitHub, GitLab, Notion, and most documentation tools.

> For PRD, SDD, user stories, MVP scope, or timelines → use `sdlc-documentation` instead.

---

## References

- `references/erd.md` — ERD notation with PK, UK, FK, IDX and Mermaid syntax
- `references/flowchart.md` — flowchart and user flow with Mermaid `flowchart TD`
- `references/architecture.md` — system and component diagrams with Mermaid `graph` and `sequenceDiagram`
- `references/sequence.md` — sequence diagram patterns and examples

See `assets/` for diagram templates ready to fill in.

---

## Technical Design Checklist

```
- [ ] All diagrams use Mermaid.js syntax
- [ ] ERD completed if any data storage is involved
- [ ] All key types defined (PK, UK, FK, IDX)
- [ ] UK added for every field with a business uniqueness constraint
- [ ] Flowcharts cover happy path AND all error paths
- [ ] Architecture shows all components and communication protocols
- [ ] All external dependencies identified
- [ ] Single points of failure identified
- [ ] Sequence diagrams show both sync and async flows
- [ ] Design reviewed before implementation starts
```
