# Debugging Templates

## Bug Reproduction Brief

A minimal brief to write before attempting any fix. See the Reproduce Before
Fix section in SKILL.md.

```markdown
## Bug Reproduction Brief
- Title: [one line]
- Environment: [OS, runtime version, browser]
- Steps: [numbered, copy-pasteable]
- Expected: [what should happen]
- Actual: [what happens]
- Frequency: always | sometimes | rarely
- Minimal failing case: [smallest input that triggers the bug]
- Evidence: [log lines, stack trace, screenshot references]
```

## Bug Report

```markdown
## Bug: [Short descriptive title]

**Environment:** [OS, runtime version, browser]
**Severity:** Critical | High | Medium | Low
**Reproducible:** Always | Sometimes | Rarely

### Steps to Reproduce

1. [First step]
2. [Second step]
3. [Observe the bug]

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happens]

### Error / Stack Trace

[Paste full error here]

### Recent Changes

[Commits, deploys, or config changes before the bug appeared]

### Root Cause

[Filled after diagnosis]

### Fix Applied

[Filled after diagnosis]
```

## Root Cause Analysis Template

```markdown
## RCA: [Incident Title]

**Date:** YYYY-MM-DD
**Impact:** [Who was affected and how]

### Timeline

- HH:MM - [Event]
- HH:MM - Bug detected
- HH:MM - Root cause identified
- HH:MM - Fix deployed

### Root Cause

[Specific technical cause]

### Why It Was Not Caught Earlier

[Testing or monitoring gap]

### Prevention

- [ ] [Action to prevent recurrence]
- [ ] [Monitoring to add]
```
