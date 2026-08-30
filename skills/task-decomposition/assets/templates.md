# Task Decomposition - Templates

## Phase 0 Scope Document

```markdown
## Scope: [Task Name]

**Problem:** [1-2 sentences]

**Confirmed in scope:**

- [item]

**Confirmed out of scope:**

- [item]

**Blocking questions:**

- [ ] [question] - needs answer from: [person/team]

**Assumptions:**

- [assumption]
```

---

## Phase 1 Task Tree

```markdown
## Task Tree: [Task Name]

TASK: [main task name]
â”œâ”€â”€ SUB-TASK 1: [description] [S] - skill: code-style
â”œâ”€â”€ SUB-TASK 2: [description] [M] - skill: api-conventions - depends on 1
â”‚ â”œâ”€â”€ Step 2.1: [detail]
â”‚ â””â”€â”€ Step 2.2: [detail]
â””â”€â”€ SUB-TASK 3: [description] [S] - skill: testing - parallel with 2

**Size guide:** S < 30 min Â· M 30 min-2 hr Â· L > 2 hr (must split before starting)

**Dependencies:**

- SUB-TASK 2 to requires SUB-TASK 1 complete
- SUB-TASK 3 to can run parallel with SUB-TASK 2

**Key risks:**

- [risk] - mitigation: [approach]

**Estimated total:** [S/M/L/XL]
```

---

## Progress Report

```markdown
## Progress: [Task Name]

**Phase:** PHASE X - [name]
**Status:** In Progress | Done | Blocked

**Completed:**

- PHASE 0: Scope confirmed
- PHASE 1: 4 sub-tasks planned

**In Progress:**

- PHASE 3: Sub-task 2/4 - [description]

**Waiting:**

- PHASE 3: Sub-tasks 3, 4
- PHASE 4: Full test suite

**Blockers:**

- [description] - needs: [what is required]
```

---

## Milestone Template (for large tasks)

```markdown
## Milestone Plan: [Project Name]

### Milestone 1: [Name]

- Scope: [what is included]
- Interface to next milestone: [API contract, data format, etc.]
- Exit criteria: [how we know it is done]
- Target: [date or sprint]

### Milestone 2: [Name]

- Depends on: Milestone 1 complete
- Scope: [what is included]
- Exit criteria: [how we know it is done]
```
