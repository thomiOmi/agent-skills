# Inline Comments

An inline comment explains **why** the code does something — not what it does.
The code already shows what. The comment explains the reasoning behind it.

---

## When to Add a Comment

Add an inline comment when any of these apply:

**Magic number or constant**
The value has a specific origin that is not obvious from its name.
Document where the number comes from — an SLA, a protocol limit, a business rule.

**Non-obvious algorithm step**
A transformation, bitwise operation, or mathematical formula that is not self-explanatory.
Describe what the step achieves in the broader algorithm, not the mechanics of the operation.

**Workaround or known limitation**
A hack, a library bug, or a temporary fix.
Include a reference to the issue tracker so future readers can check if it has been resolved.
Format: `TODO(#issue-number): [description of the limitation and why this workaround exists]`

**Non-obvious business rule in a conditional**
A condition driven by a policy, legal requirement, or domain rule that is not derivable from the variable names alone.
Describe the rule, not the condition syntax.

---

## When Not to Add a Comment

Do not add a comment that restates what the code already says.

| Wrong — restates the code | Right — explains the reasoning |
| -------------------------- | ------------------------------- |
| "increment counter by 1" | "skip the header row, which is not part of the dataset" |
| "check if user is active" | "inactive users retain their data but cannot perform writes" |
| "return null" | "null signals the caller to use the default configuration" |

---

## Variable Naming and Comments

Well-named variables reduce the need for comments.
Prefer a descriptive name over a comment that explains a vague one.

| Avoid | Prefer |
| ------- | -------- |
| Single-letter names: `e`, `x`, `n`, `i` (except in mathematical loops) | Full names: `processing_error`, `active_users`, `retry_attempt` |
| Abbreviated names: `usr`, `cfg`, `tmp` | Full names: `current_user`, `server_config`, `temp_file` |
| Generic names: `data`, `result`, `value`, `obj` | Descriptive names: `invoice_payload`, `parsed_response`, `product_id` |

A comment should never be required to explain what a variable holds.
If it is, rename the variable first.

---

## Placement

- Place the comment on the line above the code it describes, not after it on the same line — unless it is a short label for a constant.
- Keep comments up to date. A comment that contradicts the code is worse than no comment.
- Remove debug comments before committing. `TODO` and `FIXME` with issue references are acceptable.
