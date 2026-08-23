---
name: design-system
description: 'Use this skill when defining design tokens, color palettes, spacing, typography scales, or component themes. Trigger with "design tokens", "color palette", "typography scale", "spacing tokens", "dark mode theme", or when setting up styling systems. Do not create design tokens without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Design Tokens & Styling Systems

Guidelines for defining scalable design tokens, component themes, and color systems.

---

## Design Token Structure

```text
- Spacing: 4px scale (4, 8, 12, 16, 24, 32, 48, 64)
- Typography: scale (12, 14, 16, 20, 24, 32, 48)
- Colors: neutral, primary, accent, success, warning, error
- Radius: none, sm (4px), md (8px), lg (12px), full
- Shadows: sm, md, lg
```

---

## Verification Checklist

```markdown
- [ ] Token names use semantic aliases (`color-primary-bg` instead of `#3b82f6`)
- [ ] Dark mode semantic overrides defined for every token
- [ ] Spacing adheres to consistent 4px grid
- [ ] No hardcoded hex values in component stylesheets
```
