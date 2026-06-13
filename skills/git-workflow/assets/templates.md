# Git Workflow Templates

## Branch Name Template

```markdown
[type]/[optional-ticket-id]-[short-description]

Examples:
  feature/user-password-reset
  feature/AUTH-123-two-factor-auth
  fix/session-expiry-calculation
  fix/USER-456-duplicate-email-validation
  hotfix/payment-gateway-timeout
  refactor/extract-auth-middleware
  chore/upgrade-dependencies
  docs/update-api-readme
```

---

## Commit Message Template

```markdown
type(scope): short description in imperative form

- [optional: bullet point explaining what changed]
- [optional: bullet point explaining what changed]

Resolves: #issue-number
```

Examples:

```markdown
feat(auth): add email verification on registration

- Send verification email on user creation
- Block login until email is verified
- Add resend verification endpoint

Resolves: #89

---

fix(user): correct avatar URL generation for S3

The URL was missing the region prefix, causing 403 errors
in non-default AWS regions.

Resolves: #112
```

---

## PR Description Template

```markdown
## What
[What does this PR do?]

## Why
Resolves: #[issue]

## How
[Approach taken, if non-obvious]

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests added / updated
- [ ] Manually tested: [steps]

## Checklist
- [ ] Self-review completed
- [ ] No debug statements
- [ ] No hardcoded secrets
- [ ] Docstrings added
- [ ] Tests cover error paths
```
