# Style Profiles

Style profiles keep independently generated assets inside one durable art direction. They are the first source of truth for generation prompts and palette normalization; themes provide subject and setting variation inside that style.

## Resolution Order

The default `--style-profile auto` resolves in this order:

1. `.codex/context/dot-style.json` in the target project
2. Bundled `references/profiles/soft-modern-retro.json`

Pass a plain JSON filename to choose another project or bundled profile. Pass `--style-profile none` only when the user explicitly wants an unprofiled experiment.

## Default `soft-modern-retro`

The bundled profile defines:

- Orthographic 2D side-scrolling presentation
- Friendly humanoid SD proportions around 2.5 to 3 heads tall
- Chunky clusters and 1-to-2-pixel sprite outlines at the 64x64 grid
- Soft blue-gray and cocoa ambient shadows
- Painted wood and metal, warm brick, terrazzo, laminate, woven cloth, glass, ceramic, and grouped plant materials
- Warm cream foundations with dusty coral, mustard, sage, teal, denim, and quiet neutral accents
- Three to five major value groups and selective deep-colored outlines
- A reusable fixed candidate palette rather than colors sampled from one background

Read `prompt_terms`, the asset-specific fields, and the palette roles from [profiles/soft-modern-retro.json](profiles/soft-modern-retro.json) before generating. Translate them into direct visual prompt language while preserving the user's subject and theme.

The previous [profiles/cinematic-sd.json](profiles/cinematic-sd.json) remains available for explicitly requested cinematic fantasy sets.

## Project Override

Create `.codex/context/dot-style.json` only when the user intentionally establishes a different project-wide visual identity. Keep version `1` and provide:

- `name`
- `description`
- `prompt_terms`
- asset-specific proportion, density, material, and lighting guidance
- `palette.colors` containing 8 to 256 `#RRGGBB` values

Do not create a project override from one accidental output or isolated correction. A profile represents a deliberate reusable direction.

## Relationship to Scene References

- Style profile: always controls the long-term family resemblance of new assets.
- Theme: changes subject vocabulary and accent emphasis within the style.
- `--palette-reference`: optional second-stage weighting for an asset tied to one specific scene.
- Deterministic compositor: validates scale and placement without redesigning sources.

An asset can therefore be created without a background and still receive the same base proportions, cluster language, values, outlines, and candidate palette. A later background reference narrows that shared palette for local lighting without becoming the global style definition.
