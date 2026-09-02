# React Native Design Rules

Use these rules when designing bare React Native UI.


## References

- `.codex/common/design/principles.md`
- `.codex/common/design/layout.md`
- `.codex/common/design/interaction.md`
- `.codex/stacks/react-native/decisions.md`


## Default Direction

- Native platform conventions first.
- React Native StyleSheet with shared design tokens by default.
- NativeWind only when requested or already used.
- React Native Paper when a standard native component library is needed.
- Icons: Font Awesome.


## Mobile Layout

- Avoid web-only layout assumptions.
- Respect safe areas and platform navigation behavior.
- Handle Android back behavior intentionally.
- Keep touch targets large enough.
- Keep permissions, deep links, push notifications, and native settings explicit in UI flows.


## Verification

- Check Android and iOS behavior when native configuration changes.
- Check text overflow on small devices.
- Check touch target sizes.
- Check platform-specific UI differences.

