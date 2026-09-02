# Expo Design Rules

Use these rules when designing Expo UI.


## References

- `.codex/common/design/principles.md`
- `.codex/common/design/layout.md`
- `.codex/common/design/interaction.md`
- `.codex/stacks/expo/decisions.md`


## Default Direction

- Mobile-first layout.
- Web-testable layout when Expo Web is enabled.
- Safe-area aware screens.
- Native touch target sizes.
- NativeWind when a Tailwind-like workflow is desired.
- React Native StyleSheet with shared tokens when staying close to native primitives.
- React Native Paper when a standard mobile component library is needed.
- Icons: Font Awesome.


## Mobile Layout

- Avoid desktop-only assumptions.
- Keep primary actions reachable.
- Keep repeated list items stable in height when possible.
- Use bottom tabs, stack navigation, or route-based navigation according to the app structure.
- Keep forms short or split them into clear steps.


## Web Layout

When Expo Web is enabled:

- Avoid native-only layout assumptions.
- Keep screens usable at desktop browser widths.
- Ensure text and controls do not overflow on browser resize.
- Provide fallbacks for native-only interactions.


## Verification

- Check safe-area behavior.
- Check touch target sizes.
- Check important flows on target platforms when possible.
- Ensure text does not overflow small screens.
- When Expo Web is enabled, check the web entry point with `npx expo start --web`.

