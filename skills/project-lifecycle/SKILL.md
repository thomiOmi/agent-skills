---
name: project-lifecycle
description: 'Use this skill when an agent takes on an end-to-end project engagement: taking a client request from intake through definition, design, development, quality, public release, and post-launch. Owns the phase sequence, phase gates, the scope document, and client status reporting. Do not use it for single technical tasks. For writing the PRD itself use sdlc-documentation; for decomposing one phase into tasks use task-decomposition; for release mechanics use devops-deployment. Triggers include: "end to end project", "build this project from scratch", "project kickoff", "project phases", "from idea to launch", "client status update", "project scope".'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Project Lifecycle

How to run a full project engagement: one brief taken from first conversation to public release, with the agent acting as the delivery team and the user acting as the client. Complements `task-decomposition` (which breaks ONE task into steps): this skill owns the arc across ALL phases.

---

## When to Use This Skill

| Situation | Use this skill |
|---|---|
| "Build this product from scratch and launch it" | Yes |
| "Add auth to our API" (single task) | No - normal workflow + task-decomposition |
| "Review this PR" | No - code-review |
| "We have a brief and a budget window; take it to launch" | Yes |

The unit of work here is a PROJECT, not a task. If the request fits in one phase (one feature, one fix), use the normal workflow instead.

---

## The Engagement Arc

Seven phases. Each has an owner, deliverables, and a definition of done. Delegate phase work to the mapped specialists; the orchestrator stays accountable for the arc.

| Phase | Goal | Deliverable | Responsible agents | Definition of done |
|---|---|---|---|---|
| 0 Intake | Understand the brief | Scope document, initial research | researcher, brainstormer | Scope, risks, and assumptions documented; accepted by client |
| 1 Definition | Freeze what gets built | PRD, user stories, acceptance criteria | product-manager | PRD approved (GATE 1) |
| 2 Design | Decide how it is built | Architecture decisions, UI design | software-architect, ui-ux | Decisions recorded; UI verified |
| 3 Development | Build it | Tested increments per milestone | frontend-developer, backend-developer, database-engineer | Milestone passes typecheck, lint, tests |
| 4 Quality | Prove it is releasable | Test report, security audit | qa-engineer, security-auditor | Zero open blockers (GATE 2) |
| 5 Release | Launch to the public | Deploy, changelog, public docs, launch content | devops, docs-writer, marketing | Live in production; public docs in place |
| 6 Post-launch | Keep it healthy | Monitoring notes, iteration backlog | devops, marketing | Iteration backlog exists; status stable |

---

## Scope Document (Intake output)

Written during Intake, kept at the top of the project TASKS.md:

```markdown
## Scope
- In scope: <deliverables committed>
- Out of scope: <explicitly excluded>
- Milestones: <name> (S/M/L), <name> (S/M/L)
- Assumptions: <what is taken for granted>
- Risks: <what can derail the project>
```

Weights are S, M, or L - never invented hour estimates. The scope document is the basis for refusing uncontrolled growth.

---

## Phase Gates

Two hard gates. At a gate: stop, report status, wait for explicit client approval. No approval, no progress past the gate.

- **GATE 1 - PRD approved**: before a single line of development. Reversing product direction after code exists is the most expensive failure mode; the gate exists to prevent it.
- **GATE 2 - Clean audit**: before any public release. Release is the point of no return; it requires explicit approval with the audit report in hand.

All other phase boundaries FLOW: report, demo, and continue. The client can stop the engagement at any moment; gates are the minimum, not the maximum.

---

## Scope Changes Mid-Engagement

When the client requests something outside the scope document mid-phase:

1. Do not silently absorb it.
2. Record it against the scope document and state the impact (which milestone grows, or what gets deferred).
3. Ask: "add as a new milestone, or defer to post-launch?"

Then proceed per the client's answer. This is the behavior the scope document exists to enable.

---

## Client Communication

- **Kickoff** (end of Intake): restate the brief, present the scope document and milestones, confirm the phase plan and gates.
- **Status update** (end of each phase or session):
  ```markdown
  Progress: <what was completed>
  Blockers: <what is stuck, if anything>
  Decisions needed: <what requires the client, if anything>
  Next: <what happens next>
  ```
- **Demo** (each phase completion): show the actual deliverable, not a description of it.
- **Handoff** (after Release): links to the live product, docs, repo, and the iteration backlog.

---

## State in TASKS.md

The engagement outlives a single session. Structure the project TASKS.md per phase so any future session resumes exactly where the arc stopped:

```markdown
## Scope
<scope document>

## Phases
### 0 Intake - done
### 1 Definition - done (GATE 1 approved YYYY-MM-DD)
### 2 Design - done
### 3 Development - active
- [ ] Milestone: checkout (M)
- [ ] Milestone: admin (M)
### 4 Quality - pending (GATE 2)
### 5 Release - pending
### 6 Post-launch - pending
```

---

## Anti-patterns

- Starting development before GATE 1 because "the PRD is mostly done".
- Releasing without GATE 2 because "tests mostly pass".
- Accepting mid-phase additions silently; that is how projects silently double.
- Rewriting the PRD during Development without re-running the gate.
- Duplicating the content of sdlc-documentation, planning, or devops-deployment; this skill sequences the work, those skills do the work.

---

## Checklist

```markdown
- [ ] Scope document written and accepted at Intake
- [ ] Every phase ended with a demo or status update
- [ ] GATE 1 passed with explicit approval before Development
- [ ] Scope changes recorded against the scope document
- [ ] GATE 2 passed with explicit approval before Release
- [ ] TASKS.md reflects the true phase state at every session end
- [ ] Handoff delivered after Release
```

---

## References

- For breaking one phase into ordered subtasks: use `task-decomposition`
- For writing the PRD and acceptance criteria: use `sdlc-documentation`
- For architecture decisions in the Design phase: use `planning`
- For release mechanics and deployment: use `devops-deployment`
- For the verification loop in Development: use `code-review` and `testing`
