# Design Principles

Use these principles when designing application UI.


## Fit The Product Type

Design for the product's actual use case.


- Admin, CRM, SaaS, dashboards, and operational tools should feel quiet, dense, and easy to scan.
- Consumer, content, portfolio, and game experiences may be more expressive when appropriate.
- Do not turn tools into landing pages unless the user explicitly asks for a landing page.


## Practical Visual Direction

- Prioritize clarity over decoration.
- Use visual hierarchy to guide scanning.
- Keep repeated UI predictable.
- Avoid decorative blobs, orbs, and unrelated background effects.
- Do not use one-note palettes dominated by a single hue family.


## Designer Role And Tone

Design as a senior international product designer responsible for a polished, production-ready user experience.


- Make the first usable screen feel intentional, refined, and trustworthy.
- Keep the experience friendly and approachable without becoming childish or overly decorative.
- Use calm hierarchy, readable spacing, and clear affordances so users understand what to do next.
- Avoid generic starter-template visuals, bare unstyled controls, and default-looking layouts.
- Prefer product-quality details: consistent spacing, balanced density, meaningful empty states, and polished buttons, forms, tabs, cards, and navigation.


## Color Direction

Use soft, friendly pastel tones as the default base for new visual systems.


- Prefer warm off-white, soft gray, muted pastel blue, mint, lavender, peach, coral, or sage as supporting colors.
- Use stronger colors only for emphasis, status, primary actions, or data meaning.
- Keep enough contrast for text, controls, focus states, and accessibility.
- Avoid harsh neon colors, heavy black-heavy interfaces, muddy browns, and overly saturated gradients unless the product context requires them.
- Do not make the entire UI one pastel color; combine neutral surfaces, one primary accent, and limited secondary accents.


## Content First

- Real product, data, state, or workflow content should be visible early.
- Avoid placeholder-heavy screens when real structure can be shown.
- Empty states should explain what is missing and provide the next useful action.


## Consistency

- Reuse existing project components and spacing conventions.
- Match the active stack's UI and styling decisions.
- Do not introduce a new visual system when the project already has one.


## Project Design Reference

If `.codex/context/design-description.md` exists, read it before creating or changing UI.

- Use it as project-specific direction for visual tone, layout rhythm, component styling, typography, and interaction feel.
- Do not copy exact colors, assets, brand details, or proprietary UI from its source references.
- Keep accessibility, responsive behavior, platform conventions, and explicit user requirements higher priority than the reference.


## Existing Project Adoption

When this harness is added to an existing project, follow the project's current design system before applying new defaults.


Inspect existing UI before designing new screens:

- Existing pages, screens, and layouts
- Shared components
- Button, input, modal, table, card, tab, and navigation patterns
- Color tokens, spacing, typography, radius, shadow, and icon style
- Existing styling library or component library
- Existing empty, loading, error, and success states


Do not replace the project's current visual direction just because this harness defines a default.

