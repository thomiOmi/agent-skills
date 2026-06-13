# Pull Request Description and Review

## PR Description Template

```markdown
## What
[1–3 sentences: what does this PR do?]

## Why
[Why is this change needed? Link to the issue, ticket, or context.]

Resolves: #[issue-number]

## How
[Brief explanation of the approach taken, if non-obvious.]

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor (no behavior change)
- [ ] Breaking change
- [ ] Documentation

## Testing
[How was this tested? What scenarios were covered?]

- [ ] Unit tests added / updated
- [ ] Integration tests added / updated
- [ ] Manually tested: [describe steps]

## Screenshots / output (if applicable)
[Paste relevant output, API responses, or UI screenshots]

## Checklist
- [ ] Self-review completed
- [ ] No debug statements or temporary code
- [ ] No hardcoded secrets
- [ ] Docstrings added for new functions/methods/classes
- [ ] Tests cover the change
- [ ] Documentation updated if needed
```

---

## Self-Review Checklist (before requesting review)

```markdown
- [ ] Read every line of the diff — not just what you changed
- [ ] No unintended files included
- [ ] No debug statements left in
- [ ] No hardcoded values that belong in config
- [ ] Naming is consistent with the codebase
- [ ] All new functions, methods, classes have docstrings
- [ ] Tests cover the new behavior and the error paths
- [ ] PR description is complete and accurate
```

---

## Code Review Guidelines

**For the reviewer:**

- Review the intent, not just the implementation
- Suggest, do not demand — use "consider" and "what if" language for non-blocking comments
- Distinguish blocking issues from suggestions: prefix with `[blocking]` or `[nit]`
- Approve only when you would be comfortable maintaining this code

**Response labels:**

- `[blocking]` — must be addressed before merge
- `[nit]` — minor style or preference, author's discretion
- `[question]` — seeking understanding, not requesting a change

---

## PR Size Guidelines

| Size | Lines changed | Risk |
| ------ | -------------- | ------ |
| Small | < 100 lines | Easy to review thoroughly |
| Medium | 100–400 lines | Reviewable with focus |
| Large | > 400 lines | Consider splitting |

Large PRs slow down review and increase risk.
If a PR is large, add a description of how to review it in sections.
