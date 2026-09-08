
# Conventional Branch

Naming and lifecycle conventions for Git branches. A branch name should tell
reviewers and future archaeologists what changed and why, at a glance, without
opening the diff.

## Format

```text
[type]/[short-description]
[type]/[ticket-id]-[short-description]
```

## Type Prefixes

| Prefix | When to use |
|---|---|
| `feature/` | New functionality or behavior |
| `fix/` | Bug fix |
| `hotfix/` | Urgent production fix branched from main |
| `refactor/` | Code restructuring without behavior change |
| `chore/` | Maintenance, dependency updates, config changes |
| `docs/` | Documentation only |
| `test/` | Adding or updating tests only |
| `perf/` | Performance improvement |
| `ci/` | CI/CD pipeline changes |
| `release/` | Release preparation (GitFlow projects) |

The prefix mirrors the Conventional Commit type of the work on the branch. If
you would commit it as `feat: ...`, the branch is `feature/...`.

## Rules

```text
Use kebab-case for the description
   Why: lowercase-hyphen names are easy to read, type, and tab-complete. Mixed case creates mismatched remotes on case-sensitive filesystems.

Keep the description under 50 characters
   Why: the name shows up in PR lists, terminal prompts, and logs. Long names wrap and get truncated.

Include the ticket ID when the project uses one
   Why: feature/AUTH-123-password-reset links the branch to the tracker without opening anything.

Describe the change, not the person
   Why: fix/oidc-login-timeout tells reviewers the purpose. thomas/fix-login tells them the author.

One topic per branch
   Why: mixing a bug fix and a feature in one branch makes review and revert impossible.

Never use generic names like changes, update, or work
   Why: a name that fits anything explains nothing.
```

## Examples

```text
Wrong: thomas/fix-login           (personal name)
Wrong: feature/UserPasswordReset  (not kebab-case)
Wrong: feature/changes            (generic)
Wrong: fix fix the bug            (no type, no description)

Right: feature/AUTH-123-password-reset
Right: fix/oidc-login-timeout
Right: chore/bump-bun-to-1.3
Right: docs/installation-guide
```

## Lifecycle

```text
1. Branch from the latest base (main, or develop in GitFlow)
2. Commit in small, focused steps (see `conventional-commit.md`)
3. Push and open a PR early; use a draft if it is not ready for review
4. Merge when approved and CI passes
5. Delete the branch immediately after merge
```

For branching strategies (GitHub Flow, GitFlow, trunk-based), load the
`git-workflow` skill.

## Checklist

```markdown
- [ ] Prefix matches the commit type of the work
- [ ] Description is kebab-case and under 50 characters
- [ ] Ticket ID included when the project uses one
- [ ] No personal names or generic words
- [ ] Branched from the latest base branch
- [ ] One topic only
```
