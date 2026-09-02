# Interaction Rules

Use these rules when designing controls, feedback, and user actions.


## Controls

- Use icons in tool buttons when a recognizable symbol exists.
- Use text or icon-plus-text buttons for clear commands.
- Use toggles or checkboxes for binary settings.
- Use segmented controls for modes.
- Use sliders, steppers, or numeric inputs for numeric values.
- Use tabs for sibling views.
- Use menus for option sets.


## Icons

- Use Font Awesome according to the active stack's `decisions.md`.
- Match icons to the action or meaning of the button.
- Add labels or tooltips when an icon is not obvious.
- Do not use icons as decoration when they do not clarify meaning.


## Feedback

- Show loading states for async actions.
- Show empty states with the next useful action.
- Show success feedback only when it helps the user continue.
- Show errors with actionable recovery text.


## Friendly UX

Interactions should feel clear, calm, and helpful.


- Use short, human labels for buttons, empty states, validation, and errors.
- Make primary actions easy to find without overwhelming the screen.
- Use gentle motion or transitions only when they clarify state changes.
- Keep disabled, selected, hover, focus, loading, error, and success states visually distinct.
- Prefer helpful recovery actions over blame-oriented error messages.


## Safety

- Confirm destructive actions.
- Disable or guard actions that are invalid in the current state.
- Validate user input at the UI boundary first.
- Validate again at the service or backend boundary.


## Accessibility

- Keep focus states visible.
- Provide accessible names for icon-only buttons.
- Maintain adequate contrast.
- Keep touch targets large enough for mobile use.
- Support keyboard interaction for important controls when the platform supports it.

