# Responsive CSS Rules

Use these rules whenever writing CSS, Tailwind classes, CSS modules, styled-components, inline style objects, or layout-related component styles.

## Core Rule

Every new or changed visual layout must be responsive by default.

Do not create desktop-only CSS unless the product explicitly targets a fixed desktop environment.

## Required Checks

Before finishing UI work, verify that the layout remains usable at:

- Small mobile width
- Large mobile or small tablet width
- Desktop width

When exact viewport testing is not possible, reason from CSS constraints and report the limitation.

## Implementation Rules

- Use flexible layout primitives such as `flex`, `grid`, wrapping, `minmax`, `clamp`, `max-width`, and percentage or container-relative sizing.
- Prefer content-driven breakpoints over arbitrary device names.
- Preserve existing project breakpoints, spacing tokens, and layout utilities when they exist.
- Ensure text does not overflow buttons, cards, tabs, table cells, navigation items, or form controls.
- Allow long words, user names, file names, labels, and translated text to wrap or truncate intentionally.
- Keep fixed-size elements stable with explicit `min-width`, `max-width`, `aspect-ratio`, or grid tracks when dynamic content could shift layout.
- Avoid viewport-width font scaling for normal UI text.
- Avoid horizontal scrolling on the page unless the component is intentionally scrollable, such as a data table or code block.

## Mobile-First Behavior

- Start with a compact layout that works on mobile.
- Add larger-screen enhancements with media queries or responsive utilities.
- Stack dense controls on narrow screens when side-by-side layout would create overflow.
- Keep primary actions reachable without overlapping fixed headers, footers, keyboards, or safe areas.

## Existing Projects

For existing projects:

- Inspect current responsive patterns before adding new CSS.
- Reuse the existing breakpoint names, utility classes, mixins, or design tokens.
- Do not introduce a second responsive system unless the user requested a migration.

## Verification

When a browser or simulator is available, inspect at mobile and desktop widths before completion.

Report any unverified responsive behavior in the completion summary.
