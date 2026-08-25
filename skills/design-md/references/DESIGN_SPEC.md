# DESIGN.md Specification Guide

## Token Schema Quick Reference

```yaml
version: alpha
name: BrandName
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
```

## CLI Commands

- Validation: `npx @google/design.md lint DESIGN.md`
- Export to Tailwind v4 CSS: `npx @google/design.md export --format css-tailwind DESIGN.md`
- Export to Tailwind v3 JSON: `npx @google/design.md export --format json-tailwind DESIGN.md`
