---
name: seo-optimization
description: 'Use this skill when optimizing content for search engine optimization (SEO), title tags, meta descriptions, heading structure, or technical SEO. Trigger with "SEO optimization", "meta description", "title tag", "heading structure", "keyword research", "on-page SEO", or when auditing SEO. Do not write SEO content without this skill loaded.'
license: MIT
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# On-Page & Technical SEO

Guidelines for keyword strategy, meta tag optimization, and structured content.

---

## On-Page SEO Rules

1. **Title Tag**: Front-load primary keyword. Keep under 60 characters.
2. **Meta Description**: Include target keyword + CTA. Keep under 160 characters.
3. **Heading Hierarchy**: Exactly one `<h1>` with primary keyword. Logical `<h2>` and `<h3>` nested headings.
4. **URL Slug**: Short, hyphen-separated, containing primary keyword.
5. **Image Alt Text**: Descriptive text including relevant keywords naturally.

---

## Common Pitfalls

1. **Keyword stuffing**: Repeating keywords unnaturally hurts rankings and readability. Use the primary keyword once in the title, once in the first paragraph, and rely on semantic variants.
2. **Duplicate meta descriptions**: Copy-pasted meta descriptions across pages cause search engines to rewrite or penalize them. Write a unique description per page.
3. **Missing canonical tags**: Duplicate content from URL parameters or print versions dilutes ranking signals. Add canonical links when the same content is reachable from multiple URLs.
4. **Ignoring search intent**: Ranking for a keyword is worthless if the content type mismatches intent (informational vs transactional). Check what currently ranks before choosing the format.
5. **Optimizing on-page while the page is slow**: Core Web Vitals and page weight often outweigh title tag tweaks. Verify performance before polishing metadata.

---

## Verification Checklist

```markdown
- [ ] Title tag under 60 chars with primary keyword
- [ ] Meta description under 160 chars with CTA
- [ ] Exactly one H1 tag per page
- [ ] Internal links added to related content
- [ ] Mobile-friendly short paragraphs and bullet lists
```
