# User Stories

## Format

```
As a [type of user],
I want to [perform an action],
So that [I achieve a goal / get a benefit].

Acceptance criteria:
- [ ] Given [context], when [action], then [expected result]

Definition of Done:
- [ ] Unit tests written and passing
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Acceptance criteria verified by QA
```

## Example

```
As a registered user,
I want to reset my password via email,
So that I can regain access without contacting support.

Acceptance criteria:
- [ ] Given valid email, when reset requested, then email sent within 30s
- [ ] Given reset link clicked within 1h, then password change form shown
- [ ] Given expired link, then user sees error with re-request option
- [ ] Given new password submitted, then all other sessions are invalidated

Definition of Done:
- [ ] Unit tests: token generation, expiry, invalidation
- [ ] Integration test: full reset flow
- [ ] Email template reviewed
- [ ] Deployed to staging and verified
```

## Rules

```
✅ One story = one user action with clear value
✅ Acceptance criteria must be testable
✅ Definition of Done agreed before sprint starts
❌ Do not write stories spanning more than one sprint
❌ Do not mix multiple user types in one story
```
