import { Pressable, StyleSheet, View } from 'react-native';

type PopupCloseButtonProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
};

export function PopupCloseButton({
  accessibilityLabel,
  disabled,
  onPress,
}: PopupCloseButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.stroke, styles.strokeForward]} />
      <View style={[styles.stroke, styles.strokeBackward]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    width: 36,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  stroke: {
    backgroundColor: '#5c3529',
    height: 2,
    position: 'absolute',
    width: 15,
  },
  strokeBackward: {
    transform: [{ rotate: '-45deg' }],
  },
  strokeForward: {
    transform: [{ rotate: '45deg' }],
  },
});
