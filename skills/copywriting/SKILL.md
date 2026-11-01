---
name: copywriting
description: 'Use this skill when writing landing page copy, value propositions, calls to action (CTAs), or sales outreach. Trigger with "write copy", "landing page copy", "value proposition", "CTA", "copywriting formulas", "AIDA", "PAS", "FAB", "Before-After-Bridge", "tone adjustment", "headline patterns", "anti-patterns", or when writing audience-focused copy. Do not write marketing copy without this skill loaded.'
license: MIT
metadata:
  version: "1.2.0"
  author: thomiOmi
---

# Copywriting Formulas & Best Practices

Guidelines for writing clear, audience-focused, high-converting copy.

---

## Core Formulas

### AIDA (Attention to Interest to Desire to Action)

```text
Headline: Grab attention with a bold promise or question
Interest: Explain the problem context
Desire: Show how your solution makes things better
Action: Clear CTA with specific next step
```

**Example:**
> **Stop guessing which emails convert.**
> Most marketers A/B test blind - picking winners by gut feel. Our AI analyzes 12 variables per send and recommends the winning variant before you hit send.
> **Start your free trial to**

### PAS (Problem to Agitate to Solve)

```text
Problem: Name the specific frustration
Agitate: Make it hurt - what does the problem cost them?
Solve: Present your solution as the relief
```

**Example:**
> Your best engineers spend 3 hours a week fixing `npm install` failures. That's 150 hours a year per dev.
> Lockfile automates dependency resolution so your team ships, not troubleshoots.

### FAB (Features to Advantages to Benefits)

```text
Feature: What it is
Advantage: What it does better
Benefit: What it means for the user
```

**Example:**

> **Real-time collaboration** (feature)
> See edits as they happen, not after (advantage)
> No more "which version is latest?" - everyone stays in sync (benefit)

### Before-After-Bridge

```text
Before: What life looks like now (painful)
After: What life looks like with your solution (better)
Bridge: How to get from Before to After
```

---

## Tone Adjustment

For per-audience tone adjustment rules, load `references/tones/tones.md`.

---

## Call to Action Patterns

**Weak CTAs:**

- "Submit" - generic, no motivation
- "Click here" - tells the action, not the value
- "Learn More" - overused, low urgency

**Strong CTAs:**

- "Start your free trial" - specific, low commitment
- "Get the report" - clear value exchange
- "Deploy in one click" - speed, simplicity
- "See it in action" - demo-focused

**Rules:**

- Every CTA must state exactly what happens next
- Use action verbs, not nouns
- Create urgency without being pushy

---

## Headline Patterns

| Pattern | Formula | Example |
|---------|---------|---------|
| How-to | "How to [achieve X]" | "How to reduce churn by 40%" |
| List | "[Number] ways to [do X]" | "7 ways to speed up your CI pipeline" |
| Question | "Are you making this [X] mistake?" | "Are you making these deployment mistakes?" |
| Comparison | "[X] vs [Y]: which is better for [Z]?" | "Docker vs Podman: which is better for production?" |
| Direct | "[Product] for [audience] who [need]" | "Slack for remote teams who hate email" |
| Negative | "Stop [doing painful thing]" | "Stop copying configs between environments" |

---

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| "We" centered copy | Sounds self-centered | Lead with "you" and customer value |
| Adverbs like "very", "extremely" | Weak intensifiers | Remove or replace with specific data |
| Industry buzzwords | Alienates readers | Use plain language |
| Walls of text | Readers scan, not read | Short paragraphs, bullet points, headers |
| No social proof | Low credibility | Add testimonial, stat, or case study |

---

## Common Pitfalls

1. **Feature-first copy**: Listing what the product does instead of what the user gains. Lead with the outcome, then support with the feature.
2. **Vague CTAs**: "Learn more" and "Submit" underperform action-specific verbs like "Start your free trial" or "Deploy in one click".
3. **Writing for everyone**: Copy aimed at all audiences resonates with none. Define one primary reader and their single most pressing pain.
4. **Unsubstantiated claims**: "Fastest" and "best" without proof read as marketing noise. Back claims with numbers, testimonials, or guarantees.
5. **Selling before clarifying**: If the reader cannot tell within five seconds what the product does and who it is for, no formula will save the copy.

---

## Verification Checklist

```markdown
- [ ] Lead with customer value ("you") rather than self-centered claims ("we")
- [ ] Action verb used in CTA state ("Deploy in 1 click")
- [ ] Unexplained jargon and fluff removed
- [ ] Headline delivers on its promise (no clickbait)
- [ ] Tone matches target audience (see references/tones/tones.md)
- [ ] Headline follows a recognized pattern (How-to, List, Question, Comparison, Direct, Negative)
- [ ] No "We" centered copy, weak adverbs, industry buzzwords, walls of text, or missing social proof
- [ ] CTA states exactly what happens next
```
