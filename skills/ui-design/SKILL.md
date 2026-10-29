---
name: ui-design
description: 'Use this skill when creating, reviewing, or auditing UI components, design systems, and frontend architecture. Load this skill proactively before writing any frontend code - components, layouts, styles, design tokens, or accessibility improvements. Do not write UI code without this skill loaded. Triggers include: "design a component", "implement the UI", "make this accessible", "add a design system", "create a layout", "responsive design", "WCAG", "color palette", "typography system", "frontend", "CSS", "Tailwind", "component library", "button component", "form", "input", "modal", "dropdown", "sidebar", "navbar", "grid", "flexbox", "breakpoint", "dark mode", "theme", "motion", "animation", "loading state", "empty state", "error state", "a11y", "ARIA", "keyboard navigation", "focus management", "screen reader". Covers React, Vue, Svelte, Angular, and vanilla HTML/CSS/JS.'
license: MIT
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# UI Design

Guidelines for building accessible, consistent, and maintainable user interfaces.

---

## Examples

### Component design: Button with all states

```text
Input:  "Create a primary action button for the checkout form"
Output:
  default   to Solid brand color, pointer cursor
  hover     to Slightly darker background, subtle scale(1.02)
  focus     to Outline ring (not outline: none!)
  active    to Pressed effect (scale(0.98))
  disabled  to 50% opacity, no pointer events, aria-disabled
  loading   to Spinner replaces text, button disabled
  error     to Red pulse border, error message below button
```

---

## Core Principles

1. **Accessibility first** - design for all users from the start, not as an afterthought
2. **Consistency** - use design tokens, not ad-hoc values
3. **Progressive enhancement** - core functionality works without JavaScript
4. **State coverage** - every component handles loading, empty, error, and edge states
5. **Responsive** - mobile-first, tested at all breakpoints

---

## Accessibility Checklist

```markdown
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast ratio >= 4.5:1 for normal text, >= 3:1 for large text
- [ ] Form inputs have associated labels (not placeholders alone)
- [ ] Images have meaningful alt text (or alt="" for decorative)
- [ ] ARIA landmarks used for page structure
- [ ] Error messages are announced to screen readers
- [ ] Touch targets are at least 44x44px
- [ ] Motion respects prefers-reduced-motion
- [ ] Color is not the only differentiator (use icons, text, patterns)
```

---

## References

- `references/components.md` - component anatomy patterns (button, input, modal, dropdown)
- `references/accessibility.md` - deeper accessibility work

See `assets/templates.md` for component and design token templates.
For the DESIGN.md file format, load `design-md`.

---

## Design Tokens

Define tokens at the system level - never hardcode values:

```text
spacing: 4px base (4, 8, 12, 16, 24, 32, 48, 64)
colors:  neutral, primary, accent, success, warning, error
typography: font family, scale (12, 14, 16, 20, 24, 32, 48)
border-radius: none, sm, md, lg, full
shadows: none, sm, md, lg
```

---

## Component States

Every component must style at minimum:

```text
default, hover, focus, active, disabled, loading, error
```

For data-display components:

```text
loading (skeleton or spinner), empty (no data message), error (retry option), populated
```

---

## Hard Rules

- No hardcoded colors, sizes, or spacing - use design tokens
  - Why: Hardcoded values create inconsistencies and make theming or dark mode impossible without hunting down every literal value. Design tokens give you a single source of truth.
- No inline styles in production code
  - Why: Inline styles cannot be overridden by theme changes, break media queries and pseudo-classes, and bloat the DOM. CSS classes are more performant and maintainable.
- No layout-breaking content (text overflow handled)
  - Why: One unhandled long word or image can break an entire layout. Always use `overflow-wrap`, `text-overflow`, and `max-width` to contain content.
- No accessibility violations - run aXe or similar before shipping
  - Why: Accessibility violations exclude real users and can create legal liability. Automated tools catch 30-50% of issues immediately; manual testing catches the rest.
- Every component has a loading, empty, error state where applicable
  - Why: Users experience network latency, empty results, and failures. Components that only handle the "happy path" leave users staring at blank or broken screens.
