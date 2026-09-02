# React Design Rules

Use these rules when designing React web UI.


## References

- `.codex/common/design/principles.md`
- `.codex/common/design/layout.md`
- `.codex/common/design/interaction.md`
- `.codex/stacks/react/decisions.md`


## Default Direction

- Admin, dashboard, CRUD, table-heavy, and form-heavy apps: Ant Design plus Tailwind CSS layout utilities.
- Custom consumer-facing UI: Tailwind CSS with project-specific components.
- Icons: Font Awesome.
- Forms: React Hook Form with clear field-level validation.


## Web Layout

- Use responsive grid or flex layouts with explicit constraints.
- Keep tables, filters, pagination, and bulk actions close together.
- Use Ant Design tables, forms, modals, drawers, tabs, and notifications for operational UI.
- Do not force Ant Design into highly custom consumer-facing interfaces.


## Verification

- Check desktop and mobile widths when layout changes.
- Ensure button text and icons fit.
- Ensure tables, filters, modals, and drawers do not overflow.

