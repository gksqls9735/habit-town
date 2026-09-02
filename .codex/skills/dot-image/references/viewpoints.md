# Orthographic 2D Viewpoints

Use an orthographic 2D projection for every generated asset. Perspective depth may be suggested through overlap, scale groups, color, value, and layered parallax bands, but never through a 3D camera or converging geometry.

## Defaults

| Asset type | Default view | Use |
| --- | --- | --- |
| `char` | `side` | Side-scrolling sprites and animation-ready characters |
| `object` | `side` | Grounded props and interactables placed in the game world |
| `bg` | `side` | Compact side-view backgrounds, textures, and tiles |
| `scene` | `side` | Cinematic side-scrolling environments |
| `icon` | `front` | Clear inventory and interface silhouettes |

Use a different supported view only when the user explicitly requests it.

## Supported Views

### `side`

- Show subjects in a clean profile or side elevation.
- Keep the ground line horizontal and architecture parallel to the image plane.
- For characters, show limb separation and silhouette features that support left-right motion.
- Prompt terms: `orthographic 2D side view`, `fixed side-on camera`, `parallel projection`.

### `front`

- Show the subject directly from the front with no camera yaw or elevated angle.
- Use controlled asymmetry for personality without turning the subject into a three-quarter view.
- Prompt terms: `orthographic 2D front view`, `straight-on camera`, `no perspective foreshortening`.

### `top-down`

- Use a straight orthographic overhead camera with the ground parallel to the canvas.
- Keep movement directions and collision footprints readable.
- Prompt terms: `orthographic 2D top-down view`, `straight overhead camera`, `no isometric projection`.

## Prohibited By Default

- Isometric or dimetric projection
- Three-quarter perspective and camera yaw
- Low-angle, high-angle, Dutch-angle, or cinematic lens shots
- 3D render language, depth of field, lens blur, and perspective foreshortening
- Converging building edges, roads, floors, or grid lines
- Viewpoint changes between animation frames

## Harness Metadata

Pass `--view side`, `--view front`, or `--view top-down`. When omitted, `auto` resolves to the asset default. The harness records:

- `projection: orthographic-2d`
- `view: <resolved view>`

The harness cannot infer camera geometry from pixels. Reject or regenerate an output when visual inspection shows a prohibited viewpoint even if pixel-grid validation succeeds.
