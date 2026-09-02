# Design Reference Rules

Use these rules when a project has a visual reference captured in `.codex/context/design-description.md`.


## Project Design Context

Before creating or changing UI, check whether `.codex/context/design-description.md` exists.

If it exists:

- Read it before making design decisions.
- Treat it as project-specific design direction layered on top of the common design rules.
- Follow its guidance for layout rhythm, density, surfaces, component style, typography direction, interaction tone, and responsive behavior.
- Preserve the active stack rules, accessibility requirements, platform conventions, and explicit user requirements.


## Reference Adaptation

Design references should guide the product's feel, not create a clone.

- Do not copy exact color values, brand palettes, logos, illustrations, images, unique copy, or proprietary details from the reference.
- Use reference colors as mood and relationship guidance only.
- Adapt colors into the project's own palette with accessible contrast.
- Keep existing brand tokens and component systems when they exist.
- Prefer transferable traits such as spacing, hierarchy, density, surface treatment, and interaction clarity.


## Missing Reference File

If `.codex/context/design-description.md` does not exist, follow:

- `.codex/common/design/principles.md`
- `.codex/common/design/layout.md`
- `.codex/common/design/interaction.md`
- Active stack design rules
