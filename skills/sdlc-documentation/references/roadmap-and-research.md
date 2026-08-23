# Roadmap Design & User Research Synthesis

Guidelines for product managers and engineering leads to design roadmaps and synthesize user research.

---

## 1. Roadmap Design Framework

Organize product and engineering roadmaps by horizon rather than fixed dates when scope is evolving:

### Now / Next / Later Framework

```markdown
## Now (Current Sprint / Milestone)
- **Feature A**: Core authentication & OAuth2 integration - Target: Q1
- **Feature B**: Performance optimization for order search API - Target: Q1

## Next (Upcoming Milestones)
- **Feature C**: Automated billing notifications and Stripe webhook handler
- **Feature D**: Role-based access control (RBAC) UI panel

## Later (Future Vision)
- **Feature E**: Multi-region database replication
- **Feature F**: Custom workflow builder
```

---

## 2. User Research Synthesis

When analyzing user feedback, support requests, or interview transcripts:

1. **Extract Problem Statements**: Quote or reference exact user pain points.
2. **Identify Patterns**: Group feedback into recurring themes (e.g. Usability, Performance, Missing Feature).
3. **Prioritize Impact vs Effort**:
   - **Quick Wins**: High Impact, Low Effort
   - **Major Projects**: High Impact, High Effort
   - **Fill-ins**: Low Impact, Low Effort
   - **Thankless Tasks**: Low Impact, High Effort (Deprioritize)

---

## 3. Backlog Prioritization (RICE Scoring)

```text
RICE Score = (Reach × Impact × Confidence) / Effort

- Reach: Number of users affected per quarter
- Impact: 3 = Massive, 2 = High, 1 = Medium, 0.5 = Low
- Confidence: 100% = High, 80% = Medium, 50% = Low
- Effort: Person-weeks required
```
