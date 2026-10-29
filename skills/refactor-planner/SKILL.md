---
name: refactor-planner
description: 'Use this skill when planning safe, incremental refactoring of legacy code, reducing technical debt, modernizing codebases, or planning architectural migrations. Load this skill before planning any refactoring that spans multiple files or modules. Triggers include: "refactor this module", "modernize legacy code", "reduce technical debt", "plan refactoring", "migrate codebase", "simplify nested logic", "behavior-preserving refactor". For auditing debt use tech-debt; for simplifying logic use code-simplifier; for ADRs use architecture-decision; for system structure use planning.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Refactor Planner

Guidelines for planning safe, incremental, behavior-preserving refactoring of legacy code.

---

## When to Use This Skill

| Situation | Use this skill | Use another skill instead |
|---|---|---|
| Plan a refactor spanning multiple files/modules | Yes | |
| Modernize a legacy module incrementally | Yes | |
| Audit tech debt and code smells | | `tech-debt` |
| Simplify nested conditionals or logic | | `code-simplifier` |
| Draft an ADR for a major refactor | | `architecture-decision` |
| Restructure module boundaries | | `planning` |

---

## Core Principles

1. **Behavior preservation**: Every refactoring step must keep external behavior 100% identical. No feature changes during pure refactoring.
2. **Incremental steps**: Break refactoring into small, independently testable phases. Never do a big-bang rewrite.
3. **Regression protection**: Run the full test suite before and after each phase.
4. **One concern at a time**: Each phase addresses a single refactoring concern (naming, structure, duplication, etc.).

---

## Refactoring Workflow

```text
1. Inventory: catalog code smells, dead code, duplication, and tech debt items
2. Assess: evaluate risk, test coverage gaps, and maintenance tax per item
3. Plan: break into small, atomic, independently testable phases
4. Implement: one phase at a time, keeping behavior identical
5. Verify: run tests before and after each phase
6. Document: record architectural trade-offs and risks per stage
```

---

## Safe Patterns

| Change | Safe approach |
|---|---|
| Rename symbol | IDE rename + tests, verify all references update |
| Extract method | One concern at a time, verify tests pass |
| Flatten conditionals | Guard clauses and early returns (see code-simplifier) |
| Move class/module | Update imports + tests, verify no broken references |
| Remove dead code | Confirm no references remain, then delete |

---

## Verification Checklist

```markdown
- [ ] Refactoring plan broken into small, independently testable phases
- [ ] Each phase preserves external behavior contracts
- [ ] Full test suite passes before and after each phase
- [ ] No breaking behavioral changes during pure refactoring phases
- [ ] Architectural trade-offs and risks documented per stage
- [ ] No public API breaking changes without deprecation notice
```

---

## References

- `tech-debt` - when auditing codebase technical debt and code smells
- `code-simplifier` - when simplifying complex nested logic or conditionals
- `architecture-decision` - when drafting ADRs for major refactoring
- `planning` - when restructuring module boundaries and system dependencies
