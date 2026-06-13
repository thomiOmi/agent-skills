# Commits — Conventional Commits

## Format

```markdown
type(scope): short description

[optional body]
- detail 1
- detail 2

[optional footer]
Resolves: #issue-number
Breaking change: [description]
```

---

## Types

| Type | When to use |
| ------ | ------------ |
| `feat` | New feature or behavior |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build, config, dependency changes |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration changes |
| `revert` | Reverting a previous commit |

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
Wrong:  feat: I added the ability for users to reset their password
Wrong:  feat: Password reset feature
Right:  feat(auth): add password reset via email verification
```

---

## Commit Hygiene

```text
✅ One logical change per commit — do not bundle unrelated changes
✅ Commit working code — do not commit broken intermediate states
✅ Use the body to explain WHY the change was made, not what
❌ No debug code, console.log, or temporary TODOs in commits
❌ No "fix fix", "wip", "temp", "asdf" commit messages
❌ No commented-out code committed
❌ No secrets, credentials, or API keys
```

---

## Breaking Changes

Document breaking changes in the commit footer:

```markdown
feat(api): remove deprecated v1 endpoints

Removes /v1/users and /v1/orders endpoints that were
deprecated in v2.0 and scheduled for removal in v3.0.

Breaking change: clients using /v1/* must migrate to /v2/*
Resolves: #234
```
