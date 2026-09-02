# Icon Image Implementation

Use this reference after `$icon-image` creates or receives a PNG icon asset.


## Expo And React Native Usage

Use the existing image pattern when present. Otherwise, use `Image` from `react-native` or the project's existing optimized image component.


```tsx
import { Image } from "react-native";

export function EmptyMemoIcon() {
  return (
    <Image
      source={require("../../assets/icons/empty-memo.png")}
      style={{ width: 96, height: 96 }}
      resizeMode="contain"
    />
  );
}
```

## React Web Usage

Use the project's existing asset import or public asset convention.


```tsx
import memoIconUrl from "@/assets/icons/empty-memo.png";

export function EmptyMemoIcon() {
  return <img src={memoIconUrl} alt="" width={96} height={96} />;
}
```

Use an empty `alt` value for decorative icons. Use meaningful `alt` text only when the icon communicates information not present in adjacent text.


## Verification

After applying the icon:

- Confirm the PNG file exists at the expected path.
- Confirm the UI imports or references the PNG correctly.
- Confirm the rendered icon has stable width and height.
- Confirm the icon style matches surrounding UI.
- Confirm no Font Awesome or other icon library was used for this requested icon.

