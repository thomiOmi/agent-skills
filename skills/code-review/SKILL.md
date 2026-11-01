---
name: code-review
description: 'Use this skill when reviewing pull requests, inspecting code quality, auditing diffs, or conducting peer code reviews. Trigger with "review this code", "code review", "audit PR", "check diff", "find code smells", or before approving merge requests. Do not perform code reviews without this skill loaded.'
license: MIT
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Code Review

Guidelines for auditing code changes, detecting code smells, and conducting constructive peer reviews.

---

## Code Review Framework

1. **Scope & Intent**: Read the PR description and understand *what* the change is trying to achieve.
2. **Correctness & Edge Cases**: Verify logic handles invalid input, missing parameters, nulls, and error paths.
3. **Security**: Check for unvalidated user input, secrets, hardcoded values, and authorization gaps.
4. **Testing**: Confirm new logic has corresponding unit/integration tests covering happy and error paths.
5. **Maintainability**: Identify code smells (duplicated logic, monolithic functions, unclear variable names).

---

## Severity Ratings

- `[CRITICAL]`: Security vulnerability, data corruption, or crash in production. Must fix before merge.
- `[HIGH]`: Incorrect logic, missing error handling, or performance regression.
- `[MEDIUM]`: Code smell, missing test coverage, or unhandled edge case.
- `[LOW]`: Naming clarification or minor readability improvement.

---

## Tech Lead Review Priorities

When reviewing as the tech lead (cross-domain, standards enforcement), check in this order:

1. **Layering**: no business decisions in controllers/handlers; no transport or persistence concerns leaking across layers.
2. **Boundaries**: input validated at every system boundary (routes, consumers); errors explicit, no silent catches.
3. **Duplication**: the same logic must not live in two places; shared code goes to a shared module, not a copy-paste.
4. **Cross-domain consistency**: frontend and backend patterns agree (naming of API fields, error shapes, pagination style).
5. **Scope discipline**: the diff does what the task says - flag drive-by refactors and unrelated changes as out of scope.

A review that only lists style issues is a failed review: style belongs to automated lint, not to the lead's time.

---

## Review Style

Review like the senior dev who gets paged when it breaks: read the code your change touches, not just the diff. Check bugs, security, real load, missing tests, speed, and what to cut. Each finding must say:

- what the code does
- what goes wrong
- how to fix it
- what happens if you skip it

Name a target in plain words to narrow or widen it: `uncommitted`, `staged`, `branch`, or a PR link.


---

## Behavioral Guidelines

When writing or reviewing code:

1. Think Before Coding - State assumptions explicitly. If uncertain, ask. Present multiple interpretations instead of picking silently. Push back when a simpler approach exists. Stop and name what is confusing.
2. Simplicity First - Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No speculative flexibility or configurability. No error handling for impossible scenarios.
3. Surgical Changes - Touch only what you must. Clean up only your own mess. Do not refactor things that are not broken. Do not improve adjacent code, comments, or formatting. Match existing style, even if you'd do it differently. Every changed line should trace directly to the user's request. Remove imports, variables, or functions your changes made unused; do not remove pre-existing dead code unless asked.
4. Goal-Driven Execution - Define verifiable success criteria. Transform imperative tasks into goals: "Add validation" becomes "Write tests for invalid inputs, then make them pass." "Fix the bug" becomes "Write a test that reproduces it, then make it pass." For multi-step tasks, state a brief plan: `1. [Step] to verify: [check]`.

---

## Critical Thinking Review (Ideas & Plans)

Use this when reviewing ideas, plans, strategies, opinions, drafts, or decisions before they are acted on.

1. Assume every idea has a weakness - Assume every idea has at least one weakness until proven otherwise through explicit testing. If you cannot find any weakness, your analysis was not deep enough; dig again before concluding the idea is strong.
2. Steelman first - State the strongest, most charitable version of the idea before looking for flaws. Do not attack a weaker version than what was proposed.
3. No empty validation - Do not open with "good idea", "you are right", or "great question" unless tested against the checks below.
4. Before critiquing, check context - If critical context is missing, ask before critiquing. Do not assume worst-case details or fill gaps with guesses.
5. Before supporting, answer - What is the weakest part? What could realistically go wrong? What assumptions are unproven? What is the strongest counterargument? What data or context is missing?
6. Assess directly - If the idea is weak, say so directly and specifically, with no hedging. If the idea is strong, explain why it works, but still flag at least one concrete risk or trade-off, not a generic disclaimer.
7. Materiality filter - Only raise a weakness if it materially affects the decision. Skip trivial or cosmetic issues raised just to appear critical.
8. Every weakness needs a next step - Each weakness raised must come with at least one concrete step to address it. Do not list problems and stop.
9. Tone - Sound like a skeptical reviewer, not a cheerleader. Go straight to the issue.
10. Calibration - Match critique intensity to actual stakes. A minor decision does not need the same intensity as a major strategic one.
11. Scaling - For major decisions, use: main concern, weakest assumption, strongest counterargument, what needs verification, a better version, final recommendation. For minor decisions, answer critically in three to four sentences at most.
12. Factual standards - Label uncertain claims as High/Medium/Low confidence with a brief reason. Never fabricate sources, statistics, or quotes. For fast-changing topics (pricing, law, products, news), state that direct verification is needed.

---

## Verification Checklist

```markdown
- [ ] Logic correctness verified against requirements
- [ ] Error paths and boundary edge cases covered
- [ ] No hardcoded secrets, tokens, or PII
- [ ] Unit/integration tests added or updated
- [ ] All functions/classes have descriptive docstrings
```

---

## References

- `security-review` - when auditing deep security vulnerabilities beyond surface-level checks
