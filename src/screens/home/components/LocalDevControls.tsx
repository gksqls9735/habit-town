import { Pressable, StyleSheet, Text, View } from 'react-native';

const localDevActions = ['보상', '상태', '리셋'];
const pixelFontFamily = 'Galmuri11';

type LocalDevControlsProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function LocalDevControls({ isOpen, onToggle }: LocalDevControlsProps) {
  return (
    <View style={styles.localDevControls}>
      {isOpen ? (
        <View style={styles.localDevMenu}>
          {localDevActions.map((label) => (
            <Pressable
              accessibilityRole="button"
              key={label}
              onPress={() => undefined}
              style={styles.localDevMenuButton}
            >
              <Text style={styles.localDevMenuButtonText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Pressable
        accessibilityLabel="로컬 개발 메뉴 열기"
        accessibilityRole="button"
        onPress={onToggle}
        style={styles.localDevButton}
      >
        <Text style={styles.localDevButtonText}>개발</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  localDevButton: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    borderColor: '#6b432f',
    borderWidth: 3,
    height: 44,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 10,
  },
  localDevButtonText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  localDevControls: {
    alignItems: 'center',
    bottom: 18,
    gap: 7,
    position: 'absolute',
    right: 14,
    zIndex: 20,
  },
  localDevMenu: {
    alignItems: 'center',
    gap: 6,
  },
  localDevMenuButton: {
    alignItems: 'center',
    backgroundColor: '#ffe3a9',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 9,
  },
  localDevMenuButtonText: {
    color: '#6b321f',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
