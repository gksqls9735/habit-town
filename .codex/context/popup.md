# Habit Town Popup Frame Policy

Read this before changing modals, popups, overlays, popup headers, or outer popup borders. User instructions still take precedence.

## Scope

This policy applies to the visible popup shell used by goals, today's tasks, calendar, shop, inventory, event, delivery reward, and pet selection UI. It covers the outer frame, backdrop, shadow, and top-level panel treatment. Inner controls, cards, item slots, task rows, and form fields may keep their own borders when those borders clarify interaction or item grouping.

## Approved Frame Direction

- Use a thin, consistent outer frame across app popups: `borderWidth: 2` with dark brown `#3d2d28` as the default frame color.
- Prefer a single outer frame over stacked double borders. Avoid heavy nested frame treatments unless the user explicitly asks for a special popup style.
- Use square corners to preserve the pixel-room style.
- Keep shadows restrained and pixel-like: integer offsets, no blur, and smaller offsets than the old chunky frame style. A `4px` to `5px` offset is the current upper range.
- Avoid decorative corner caps, corner cuts, and extra outer padding bands on ordinary popups. Reserve them only for a deliberately special event treatment.
- Keep popup surfaces in the warm cream family already used by the app, usually `#fff8ea` or the closest existing local surface token.

## Layout And Interaction

- Center popups in the safe area with horizontal margins and bounded height.
- Keep close controls reachable on short screens and small devices.
- Preserve readable content hierarchy: header, primary content, then actions or supporting status.
- Use scroll views for long content instead of letting panels overflow the viewport.
- Do not introduce a new shared popup component unless the change touches enough popups that it clearly reduces duplication without disrupting feature ownership.

## Verification

- For code changes, run `npx tsc --noEmit` and `git diff --check`.
- Check that changed files do not introduce replacement characters or garbled Korean text.
- When a preview is already available, visually inspect at least a narrow mobile width and a desktop width for clipped headers, unreachable close buttons, and border inconsistency.
