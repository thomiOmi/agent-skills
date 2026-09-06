---
name: conventional-commit
description: 'Use this skill when writing, reviewing, or fixing Git commit messages. Enforces the Conventional Commits format: type(scope): subject, the full type list (feat, fix, perf, refactor, test, docs, chore, ci, build, style, revert), imperative lowercase subjects under 72 characters, body explaining why, footers for breaking changes and issue references. Load this skill BEFORE running git commit or composing a commit message. Triggers include: "commit message", "buat commit", "conventional commit", "write a commit", "git commit", "commit type", "feat or fix", "breaking change", "semantic commit", "commit convention", "amend the commit message".'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
  credits: "Adapted from conventionalcommits.org and github/awesome-copilot (MIT License)"
---

# Conventional Commit

Format for commit messages that are readable by humans and machines. A good
commit message lets changelogs generate themselves, enables semantic version
bumps, and makes history searchable by type and scope.

## Format

```text
type(scope)!: subject

[optional body: why the change was made]

[optional footer: BREAKING CHANGE, Resolves, Refs, Reviewed-by]
```

Both scope and the exclamation mark are optional. The exclamation mark marks
a breaking change.

## Types

| Type | When to use | Version impact |
|---|---|---|
| `feat` | New feature or behavior | MINOR |
| `fix` | Bug fix | PATCH |
| `perf` | Performance improvement without behavior change | PATCH |
| `refactor` | Code restructuring without behavior change | none |
| `test` | Adding or updating tests | none |
| `docs` | Documentation only | none |
| `chore` | Build, config, dependency changes | none |
| `ci` | CI/CD pipeline changes | none |
| `build` | Build system or external dependency changes | none |
| `style` | Formatting, whitespace, no logic change | none |
| `revert` | Reverting a previous commit | varies |

## Subject Rules

```text
Start with a lowercase verb in imperative form
   Why: the subject completes the sentence "if applied, this commit will...". "add" works, "added" or "adds" do not.

Keep it under 72 characters
   Why: git log, GitHub, and terminal windows truncate long subjects.

No period at the end
   Why: the subject is a title, not a sentence.

Describe what the commit does, not how
   Why: the diff shows how. The subject should orient the reader.
```

## Scope

The scope names the module or area affected and must stay consistent within a
project: `auth`, `user`, `api`, `db`, `config`, `plugin`, `installer`.

## Body Rules

```text
Explain WHY the change was made, not what
   Why: the diff already shows what. Context and motivation are the parts that get lost.

Wrap at 72 characters and separate from the subject with a blank line
   Why: git log --format=full and email patches expect this layout.
```

## Footers

```text
BREAKING CHANGE: clients using /v1/* must migrate to /v2/*
Resolves: #234
Refs: #101, #102
Reviewed-by: Z
```

`BREAKING CHANGE: <description>` in the footer (or `!` after the type) marks
an incompatible change and drives MAJOR version bumps.

## Examples

```text
Wrong: fix
Wrong: fixed the login bug
Wrong: feat: I added the ability for users to reset their password
Wrong: feat(auth): Add password reset via email verification.

Right: feat(auth): add password reset via email verification
Right: fix(user): validate email before hashing for international domains
Right: feat(api)!: remove deprecated v1 endpoints
Right: chore(deps): bump bun from 1.3.12 to 1.3.14
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

For branch naming, see the conventional-branch skill. For the full Git
workflow (branching strategies, PR reviews, merge strategy), see the
git-workflow skill.

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
