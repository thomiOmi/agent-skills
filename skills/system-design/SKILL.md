---
name: system-design
description: Use this skill when designing system architecture, service boundaries, data flows, or writing ARCHITECTURE.md. Trigger with "system design", "architecture diagram", "ARCHITECTURE.md", "data flow", or "service layout".
license: MIT
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# System Design & ARCHITECTURE.md

Guidelines for system architecture diagrams, service layout, and technical design documents.

---

## Real Project File: ARCHITECTURE.md

In real projects, this skill generates or updates `ARCHITECTURE.md` at the project root.
`ARCHITECTURE.md` provides high-level system diagrams, component interactions, tech stack choices, and directory layouts for developer onboarding.

### When to create ARCHITECTURE.md
- Initializing repository architecture or explaining service topologies.
- Reference template available in `references/ARCHITECTURE_TEMPLATE.md`.

---

## System Design Checklist

```markdown
- [ ] All components and their communication protocols shown
- [ ] Tech stack choices justified against alternatives
- [ ] Data flow and state management covered
- [ ] External dependencies and single points of failure identified
- [ ] Diagrams match the implemented system
- [ ] Architecture reviewed before implementation starts
```
