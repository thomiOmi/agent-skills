# Debugging Templates

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
- HH:MM — [Event]
- HH:MM — Bug detected
- HH:MM — Root cause identified
- HH:MM — Fix deployed

### Root Cause
[Specific technical cause]

### Why It Was Not Caught Earlier
[Testing or monitoring gap]

### Prevention
- [ ] [Action to prevent recurrence]
- [ ] [Monitoring to add]
```
