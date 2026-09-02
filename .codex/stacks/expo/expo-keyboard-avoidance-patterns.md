# Expo Keyboard Avoidance Patterns

Use this reference after `.codex/stacks/expo/expo-keyboard-avoidance.md` decides keyboard avoidance is needed.


## Full-Screen Form

For a simple full-screen form, use `KeyboardAvoidingView` with a scroll container when needed.


```tsx
import { KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";

export function ProfileFormScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      >
        <TextInput placeholder="Name" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

## Fixed Bottom Input

For a screen with a fixed bottom input, keep the existing structure and only protect the input area.


```tsx
import { KeyboardAvoidingView, Platform, TextInput, View } from "react-native";

export function CommentScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{/* content */}</View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ padding: 12 }}>
          <TextInput placeholder="Write a comment" />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
```

## Android Notes

For Android-specific issues, prefer project-consistent configuration first.


Consider:

- `softwareKeyboardLayoutMode` in Expo configuration when the project uses it.
- Android window soft input behavior when native configuration is available.
- Avoiding unnecessary absolute-positioned inputs near the bottom of the viewport.

## Verification

After applying keyboard avoidance, verify:

- Focusing each input keeps the field visible.
- Validation text and the next action remain reachable.
- iOS and Android behavior is considered.
- Existing layout spacing and scrolling still feel natural.
- No duplicate keyboard avoidance wrappers were introduced.

