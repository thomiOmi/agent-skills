# Docstring Structure

A docstring answers: what this does, what goes in, what comes out, and what can fail.
Write for the next developer reading this in 6 months — not for yourself now.

---

## Required Fields

Every docstring must cover these points, in this order:

```text
WHAT    One sentence describing the purpose.
        Never restate the function name. "getUser" does not need "Gets the user."

PARAMS  For each parameter:
        - Name
        - Expected type or shape
        - What it represents (not just its type)
        - Valid range or constraints if non-obvious

RETURN  What comes back:
        - Type or shape
        - What it represents
        - Edge cases (null, empty, zero)

ERRORS  What can go wrong:
        - Which exceptions or error codes may be raised/returned
        - Under what conditions

WHY     Only when the behavior is non-obvious:
        - Why this design choice
        - Why a specific cap, limit, or formula was chosen
```

---

## Format by Language

Use the **idiomatic format for your language**:

| Language | Format |
| ---------- | -------- |
| Python | Google-style or NumPy-style docstrings |
| TypeScript / JavaScript | JSDoc (`/** ... */`) |
| Go | Plain comment above the function (`// FunctionName ...`) |
| Rust | `///` doc comments with `# Examples`, `# Panics` sections |
| PHP | PHPDoc (`/** @param @return @throws */`) |
| Java / Kotlin | Javadoc (`/** @param @return @throws */`) |
| C# | XML doc comments (`/// <summary>`) |

---

## Quality Rules

- One sentence per field. If a parameter needs a paragraph, the API design is too complex.
- Do not use decorative banners, emoji, ASCII art, or section dividers inside docstrings.
- Do not list `@param name Type` without describing what the parameter represents.
- Document the **why** for non-obvious caps, formulas, or behavior — not the what.

---

## Template (language-agnostic)

```text
[One sentence: what this function/method/class does.]

[PARAMS]
  param_name (Type): [what it represents]. [constraints if any]
  param_two  (Type): [what it represents]. [default if optional]

[RETURN]
  Type: [what the return value represents]. [edge cases]

[ERRORS / EXCEPTIONS]
  ErrorType: [when this is raised]

[WHY — optional, only if non-obvious]
  [Explanation of design choice or formula]
```
