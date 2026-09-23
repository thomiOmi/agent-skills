# Commits - Conventional Commits

Format for commit messages that are readable by humans and machines. A good
commit message lets changelogs generate themselves, enables semantic version
bumps, and makes history searchable by type and scope.

## Format

```markdown
type(scope)!: subject

[optional body]

[optional footer]
Resolves: #issue-number
Breaking change: [description]
```

Both scope and the exclamation mark are optional. The exclamation mark marks
a breaking change.

---

## Types

| Type       | When to use                                | Version impact |
| ---------- | ------------------------------------------ | -------------- |
| `feat`     | New feature or behavior                    | MINOR          |
| `fix`      | Bug fix                                    | PATCH          |
| `perf`     | Performance improvement without behavior change | PATCH     |
| `refactor` | Code restructuring without behavior change | none           |
| `test`     | Adding or updating tests                   | none           |
| `docs`     | Documentation only                         | none           |
| `chore`    | Build, config, dependency changes          | none           |
| `ci`       | CI/CD configuration changes                | none           |
| `build`    | Build system or external dependency changes | none          |
| `style`    | Formatting, whitespace, no logic change    | none           |
| `revert`   | Reverting a previous commit                | varies         |

---

## Scope (optional)

The scope describes the module or area affected.
Use the same scope consistently: `auth`, `user`, `api`, `db`, `config`.

```markdown
feat(auth): add two-factor authentication
fix(user): correct email validation for international domains
refactor(db): extract query builder into separate class
```

---

## Short Description Rules

- Start with a lowercase verb in imperative form: "add", "fix", "remove", "update"
- Maximum 72 characters
- No period at the end
- Describe **what** the commit does, not how

```markdown
Wrong: feat: I added the ability for users to reset their password
Wrong: feat: Password reset feature
Right: feat(auth): add password reset via email verification
```

---

## Commit Hygiene

```text
One logical change per commit - do not bundle unrelated changes
Commit working code - do not commit broken intermediate states
Use the body to explain WHY the change was made, not what
No debug code, console.log, or temporary TODOs in commits
No "fix fix", "wip", "temp", "asdf" commit messages
No commented-out code committed
No secrets, credentials, or API keys
```

---

## Breaking Changes

Document breaking changes with `!` after the type or a `BREAKING CHANGE:`
footer (either drives MAJOR version bumps):

```markdown
feat(api)!: remove deprecated v1 endpoints

Removes /v1/users and /v1/orders endpoints that were
deprecated in v2.0 and scheduled for removal in v3.0.

BREAKING CHANGE: clients using /v1/* must migrate to /v2/*
Resolves: #234
```

## Footers

```text
BREAKING CHANGE: clients using /v1/* must migrate to /v2/*
Resolves: #234
Refs: #101, #102
Reviewed-by: Z
```

## Decision Guide

```text
Does it add user-facing behavior?          feat
Does it fix broken behavior?               fix
Does it make things faster?                perf
Does it change code without behavior?      refactor
Does it only touch tests, docs, CI?        test, docs, ci
Is it releases, deps, config?              chore or build
```

If a commit mixes types, split it into multiple commits - one logical change
per commit.

## Checklist

```markdown
- [ ] Subject follows type(scope): subject format
- [ ] Subject is imperative, lowercase, no trailing period, under 72 characters
- [ ] Scope is consistent with previous commits in the project
- [ ] Body explains why, separated by a blank line
- [ ] Breaking changes marked with ! or BREAKING CHANGE footer
- [ ] Issue references in footers (Resolves, Refs)
- [ ] One logical change per commit
- [ ] No secrets, debug code, or temporary files committed
```
