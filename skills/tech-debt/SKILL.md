---
name: tech-debt
description: 'Use this skill when identifying, categorizing, or planning remediation for technical debt and legacy code clutter. Trigger with "technical debt", "tech debt audit", "legacy refactoring", "clean up debt", "code smells", or when assessing maintenance overhead. Do not plan debt remediation without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Technical Debt Remediation

Guidelines for identifying, categorizing, and safely remediating technical debt.

---

## Tech Debt Quadrants

```text
- Reckless & Inadvertent: "What's layering?" (Lack of knowledge)
- Reckless & Deliberate: "We don't have time for tests" (Cut corners)
- Prudent & Deliberate: "We must ship now and fix later" (Managed trade-off)
- Prudent & Inadvertent: "Now we know how we should have done it" (Learning)
```

---

## Remediation Workflow

1. **Inventory**: Catalog dead code, deprecated dependencies, unhandled exceptions, and duplicated logic.
2. **Impact Assessment**: Evaluate risk, test coverage gaps, and maintenance tax per debt item.
3. **Incremental Strategy**: Plan refactoring in small, atomic steps that preserve behavior.
4. **Regression Protection**: Ensure comprehensive unit tests pass before and after refactoring.

---

## Verification Checklist

```markdown
- [ ] Debt categorized and risk assessed
- [ ] Refactoring plan broken into incremental, safe steps
- [ ] Unit tests pass before and after changes
- [ ] No public API breaking changes introduced without deprecation
```
