---
name: git-workflow
description: 'Use this skill whenever you work with Git conventions - branching strategy, commit message format, PR templates, merge strategy, or auditing Git history against project standards. Load this skill BEFORE creating branches, making commits, or opening pull requests. Triggers include: "branch strategy", "branch naming", "conventional commit", "breaking change", "PR template", "commit convention", "merge conflict resolution strategy", "squash vs rebase", "audit commit history", "git workflow". Enforces Conventional Commits standard for all commit messages.'
license: MIT
metadata:
  version: "1.2.0"
  author: thomiOmi
---

# Git Workflow

Conventions for clean, traceable, and collaborative version control.
Applies to any Git hosting platform - GitHub, GitLab, Bitbucket, or self-hosted.

---

## Defaults Before Clarification

If the project does not define these in AGENTS.md, apply the following defaults
and state them in one line - do not pause the task to ask:

| Unknown | Default |
| ------- | ------- |
| Branching strategy | GitHub Flow (short-lived branches off the default branch, PR to merge) |
| Main branch name | `main` |
| Merge style | Squash merge for feature PRs |
| PR template | Write what/why/how to test if none exists |

Only ask the user when the choice is irreversible or genuinely ambiguous (for
example, a team standard that contradicts these defaults). A specific task
("commit this change", "open a PR for this branch") must be executed with the
defaults applied, never deferred with clarifying questions.

---

## References

- `references/branching.md` - branch naming, prefixes, strategy, and lifecycle
- `references/commits.md` - Conventional Commits format, types, footers, decision guide, hygiene
- `references/pr-review.md` - PR description template, review checklist
- `references/merge-strategy.md` - merge vs squash vs rebase

See `assets/templates.md` for PR description and branch naming templates.

---

## Hard Rules

```text
Never commit directly to main, master, or trunk
   Why: Bypassing the PR process skips code review, CI checks, and audit trail. A direct commit can introduce bugs or breaking changes without anyone noticing until production.

Never commit secrets, credentials, API keys, or PII
   Why: Git history is permanent - scrubbing secrets from history is complex and often incomplete. Compromised keys in any past commit are game-over for security.

Never use "fix", "update", "misc", or "wip" as a full commit message
   Why: A commit message like "fix" provides zero context for future debugging, archaeology, or changelog generation. Readers cannot tell what was changed or why.

Never force-push to a shared branch without team agreement
   Why: Force-push rewrites history. Teammates who have pulled the old history face merge conflicts and potential data loss.

One logical change per commit
   Why: Each commit should be a coherent unit. If you need to revert one change, an atomic commit lets you do so without reverting unrelated work.

Branch names must describe the change, not the person
   Why: A branch named `thomas/fix-login` tells you the author. `fix/oidc-login-timeout` tells you the purpose - which is what matters during review and cleanup.

Every PR must have a description before requesting review
   Why: A PR without description forces reviewers to reconstruct intent from the diff alone. A good description explains what, why, and how to test - saving everyone time.

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
