---
name: git-workflow
description: 'Use this skill when working with Git — branching, committing, reviewing PRs, resolving conflicts, or auditing Git conventions. Triggers: "branch strategy", "create a branch", "PR template", "commit convention", "merge conflict", "rebase", "squash", "review the PR", "audit commit history", "git workflow". Apply before creating branches or opening PRs.'
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Git Workflow

Conventions for clean, traceable, and collaborative version control.
Applies to any Git hosting platform — GitHub, GitLab, Bitbucket, or self-hosted.

---

## Clarify Before Acting

If the project does not define these in AGENTS.md, ask:

1. What branching strategy is used? (GitHub Flow, GitFlow, trunk-based)
2. What is the main branch name? (`main`, `master`, `trunk`)
3. Is squash merge, merge commit, or rebase merge preferred?
4. Is there a PR template or review checklist?

---

## References

- `references/branching.md` — branch naming, strategy, and lifecycle
- `references/commits.md` — Conventional Commits format, commit hygiene
- `references/pr-review.md` — PR description template, review checklist
- `references/merge-strategy.md` — merge vs squash vs rebase

See `assets/templates.md` for PR description and branch naming templates.

---

## Hard Rules

```
❌ Never commit directly to main, master, or trunk
❌ Never commit secrets, credentials, API keys, or PII
❌ Never use "fix", "update", "misc", or "wip" as a full commit message
❌ Never force-push to a shared branch without team agreement
✅ One logical change per commit
✅ Branch names must describe the change, not the person
✅ Every PR must have a description before requesting review
✅ Delete branches after merging
```

---

## Checklist

```
- [ ] Branch name follows project convention
- [ ] Commits follow Conventional Commits format
- [ ] No debug statements or temporary code in commits
- [ ] No secrets or credentials committed
- [ ] PR description explains what, why, and how to test
- [ ] Self-review done before requesting review
- [ ] All CI checks passing before merge
- [ ] Branch deleted after merge
```
