# Layout Rules

Use these rules when arranging screens, panels, lists, forms, and dashboards.


## Structure

- Start with the actual product experience, not a marketing hero, unless a landing page is requested.
- Keep page sections unframed unless they are repeated items, modals, or actual tool surfaces.
- Do not put cards inside cards.
- Keep cards at 8px radius or less unless the project design system says otherwise.
- Use stable dimensions for boards, tables, toolbars, counters, grids, and fixed-format controls.


## First Screen Quality

The initial screen must look like a designed product, not a raw scaffold.


- Give the first viewport a clear focal area, primary action, and readable information structure.
- Use soft pastel surfaces or accents with neutral backgrounds for a calm first impression.
- Balance whitespace and density so the screen feels friendly but still useful.
- Add realistic empty, loading, or sample states when data is not available yet.
- Align headers, forms, lists, and action bars to a consistent spacing grid.


## Operational Tools

For admin, CRM, SaaS, dashboard, and CRUD tools:

- Prefer dense but organized layouts.
- Use predictable navigation.
- Keep filters, actions, and table controls easy to scan.
- Avoid oversized hero sections and decorative marketing composition.


## Responsive Layout

- Ensure text does not overflow buttons, cards, tabs, or table cells.
- Use responsive constraints such as `minmax`, `max-width`, `aspect-ratio`, and stable grid tracks.
- Do not scale font size directly with viewport width.
- Avoid text overlap at mobile and desktop widths.


## Forms

- Group related fields.
- Keep primary actions near the completion point.
- Put destructive actions away from primary actions.
- Show validation close to the field that caused it.

