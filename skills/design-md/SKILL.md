---
name: design-md
description: Use this skill when working with UI design systems, visual identity specifications, or design tokens in DESIGN.md format. Trigger with "design system", "design tokens", "DESIGN.md", "color palette", "typography", or "theme".
license: MIT
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# DESIGN.md - Design System & Visual Identity Specification

Guidelines for defining, parsing, and validating design systems using the `DESIGN.md` specification (Google Labs format).

---

## What is DESIGN.md?

`DESIGN.md` combines machine-readable design tokens (YAML frontmatter) with human-readable design rationale (markdown prose).
It provides coding agents with a persistent, structured understanding of a project's design system.

---

## File Structure

A standard `DESIGN.md` file contains two layers:

1. **YAML Frontmatter**: Delimited by `---` fences at the top. Contains normative design tokens (`name`, `version`, `colors`, `typography`, `rounded`, `spacing`, `components`).
2. **Markdown Prose**: Documented rationale organized into `##` sections explaining *why* design decisions were made.

### Example DESIGN.md

```markdown
---
name: Heritage
version: alpha
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. High-contrast neutrals with a warm limestone foundation.

## Colors

- **Primary (#1A1C1E):** Deep ink for headlines and core text.
- **Secondary (#6C7278):** Slate for borders, captions, metadata.
- **Tertiary (#B8422E):** Boston Clay accent for primary interactions.
- **Neutral (#F7F5F2):** Warm limestone background.

## Components

Primary CTA buttons use Boston Clay background with neutral text and 4px rounded corners.
```

---

## Canonical Section Order

When writing prose sections, use standard `##` headings in this order:

1. `## Overview` (or `## Brand & Style`)
2. `## Colors`
3. `## Typography`
4. `## Layout` (or `## Layout & Spacing`)
5. `## Elevation & Depth`
6. `## Shapes`
7. `## Components`
8. `## Do's and Don'ts`

---

## Tooling & CLI Integration

Validate and check `DESIGN.md` files using the official CLI:

- **Linting**:
  `npx @google/design.md lint DESIGN.md`
  or on Windows: `npx -p @google/design.md designmd lint DESIGN.md`

- **Diffing versions**:
  `npx @google/design.md diff DESIGN.md DESIGN-v2.md`

- **Exporting Tokens**:
  - Tailwind v3: `npx @google/design.md export --format json-tailwind DESIGN.md`
  - Tailwind v4: `npx @google/design.md export --format css-tailwind DESIGN.md`
  - W3C DTCG: `npx @google/design.md export --format dtcg DESIGN.md`

---

## Verification Checklist

- [ ] Frontmatter contains valid YAML tokens (`colors`, `typography`, `spacing`, `rounded`, `components`)
- [ ] Section headings follow canonical order (`Overview`, `Colors`, `Typography`, `Layout`, etc.)
- [ ] Component tokens reference valid defined colors (`{colors.primary}`)
- [ ] Contrast ratio between text and background passes WCAG AA minimum (4.5:1)
- [ ] `DESIGN.md` passes lint check via `npx @google/design.md lint DESIGN.md`
