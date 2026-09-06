# Pet Care HUD And Actions

Read before changing the home status display or bottom care actions. Apply existing Expo design, responsive layout, and component separation rules.

## Scope

- This is a visual prototype. Experience, level, gold, and need values are placeholders with no rewards, timers, or persistence integration.
- Use the actual selected pet and current growth-stage image from the home room. Pet selection must also update the portrait.
- Components: src/screens/home/components/PetCareOverlay.tsx. The home screen supplies the pet and composes the overlays.

## User-Requested Design

- Show the pet inside a circular portrait surrounded by a circular experience meter; replace the old horizontal experience display.
- Place three horizontal meters alongside it: cleanliness, hunger, loneliness, labeled 청, 굶, 외 in that order.
- Show only gold currency; omit the blue premium currency from this HUD.
- Bottom actions: 청소하기, 밥먹이기, 놀아주기.
- Preserve Galmuri11 typography, warm cream surfaces, brown outlines, and gentle pastel accents.
- Pixel-art icons are handled separately. Reuse existing pet images and draw frames/meters in code. Keep temporary text labels; do not generate new raster icons.
- Preview action buttons must not modify state or imply successful care actions. Expose accessible names and disabled state.

## Layout And Follow-Up

- Respect the home safe area. Keep status clear of side rails and actions clear of the room character and popup layers.
- Use flexible gauge widths and equal-width bottom buttons without horizontal overflow. Bound desktop control width.
- Future logic must define gauge direction explicitly: more hunger or loneliness is not necessarily healthier. Do not infer gameplay rules from placeholder fills.
- Follow the user's current verification preference: inspect code errors, but do not run automated tests or interact with devices unless requested. Report unverified visual behavior.

## Portrait And Button Refinement

- Enlarge and clip the existing pet image to emphasize its face. Keep the experience ring thin (3px fill), and overlap the bottom edge with the level badge.
- Bottom buttons show only full action names, without separate 청/굶/외 letters. Keep these abbreviations beside the top meters only.
