---
name: ui-design
description: Use this skill when designing or implementing UI components, design systems, frontend code, or accessibility. Triggers: "design a component", "implement the UI", "make this accessible", "add a design system", "create a layout", "responsive design", "WCAG", "color palette", "typography system". Use before writing any frontend code or markup.
license: MIT
compatibility: OpenCode and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# UI Design

Guidelines for building accessible, consistent, and maintainable user interfaces.

---

## Core Principles

1. **Accessibility first** — design for all users from the start, not as an afterthought
2. **Consistency** — use design tokens, not ad-hoc values
3. **Progressive enhancement** — core functionality works without JavaScript
4. **State coverage** — every component handles loading, empty, error, and edge states
5. **Responsive** — mobile-first, tested at all breakpoints

---

## Accessibility Checklist

```
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

## Design Tokens

Define tokens at the system level — never hardcode values:

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

```
default, hover, focus, active, disabled, loading, error
```

For data-display components:

```
loading (skeleton or spinner), empty (no data message), error (retry option), populated
```

---

## Hard Rules

- No hardcoded colors, sizes, or spacing — use design tokens
- No inline styles in production code
- No layout-breaking content (text overflow handled)
- No accessibility violations — run aXe or similar before shipping
- Every component has a loading, empty, error state where applicable
