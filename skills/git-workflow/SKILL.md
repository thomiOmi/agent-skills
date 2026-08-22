---
name: git-workflow
description: 'Use this skill whenever you work with Git -  branching, committing, reviewing PRs, resolving conflicts, or auditing Git conventions. Load this skill BEFORE creating branches, making commits, or opening pull requests to ensure consistent Git workflow across the project. Triggers include: "branch strategy", "create a branch", "PR template", "commit convention", "merge conflict", "rebase", "squash", "review the PR", "audit commit history", "git workflow", "git init", "clone", "branch", "checkout", "commit", "push", "pull", "merge", "rebase", "cherry-pick", "stash", "log", "diff", "status", "reset", "revert", "tag", "submodule", "gitignore", "gitattributes". Apply before creating branches or opening PRs. Enforces Conventional Commits standard for all commit messages.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Git Workflow

Conventions for clean, traceable, and collaborative version control.
Applies to any Git hosting platform -  GitHub, GitLab, Bitbucket, or self-hosted.

---

## Clarify Before Acting

If the project does not define these in AGENTS.md, ask:

1. What branching strategy is used? (GitHub Flow, GitFlow, trunk-based)
2. What is the main branch name? (`main`, `master`, `trunk`)
3. Is squash merge, merge commit, or rebase merge preferred?
4. Is there a PR template or review checklist?

---

## References

- `references/branching.md` -  branch naming, strategy, and lifecycle
- `references/commits.md` -  Conventional Commits format, commit hygiene
- `references/pr-review.md` -  PR description template, review checklist
- `references/merge-strategy.md` -  merge vs squash vs rebase

See `assets/templates.md` for PR description and branch naming templates.

---

## Hard Rules

```text
Never commit directly to main, master, or trunk
   Why: Bypassing the PR process skips code review, CI checks, and audit trail. A direct commit can introduce bugs or breaking changes without anyone noticing until production.

Never commit secrets, credentials, API keys, or PII
   Why: Git history is permanent -  scrubbing secrets from history is complex and often incomplete. Compromised keys in any past commit are game-over for security.

Never use "fix", "update", "misc", or "wip" as a full commit message
   Why: A commit message like "fix" provides zero context for future debugging, archaeology, or changelog generation. Readers cannot tell what was changed or why.

Never force-push to a shared branch without team agreement
   Why: Force-push rewrites history. Teammates who have pulled the old history face merge conflicts and potential data loss.

One logical change per commit
   Why: Each commit should be a coherent unit. If you need to revert one change, an atomic commit lets you do so without reverting unrelated work.

Branch names must describe the change, not the person
   Why: A branch named `thomas/fix-login` tells you the author. `fix/oidc-login-timeout` tells you the purpose -  which is what matters during review and cleanup.

Every PR must have a description before requesting review
   Why: A PR without description forces reviewers to reconstruct intent from the diff alone. A good description explains what, why, and how to test -  saving everyone time.

Delete branches after merging
   Why: Stale branches accumulate and create confusion about which work is live, which is abandoned, and which is still in progress. Cleanup keeps the remote repository navigable.
```

---

## Checklist

```markdown
- [ ] Branch name follows project convention
- [ ] Commits follow Conventional Commits format
- [ ] No debug statements or temporary code in commits
- [ ] No secrets or credentials committed
- [ ] PR description explains what, why, and how to test
- [ ] Self-review done before requesting review
- [ ] All CI checks passing before merge
- [ ] Branch deleted after merge
```
