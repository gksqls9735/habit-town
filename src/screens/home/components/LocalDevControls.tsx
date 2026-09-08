import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const localDevActions = ['이벤트', '상태', '리셋'];
const localDevEventActions = ['택배'];
const pixelFontFamily = 'Galmuri11';

type LocalDevControlsProps = {
  isOpen: boolean;
  onAction: (label: string) => void;
  onToggle: () => void;
};

export function LocalDevControls({
  isOpen,
  onAction,
  onToggle,
}: LocalDevControlsProps) {
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);

  const handleActionPress = (label: string) => {
    if (label === '이벤트') {
      setIsEventMenuOpen((current) => !current);
      return;
    }

    setIsEventMenuOpen(false);
    onAction(label);
  };

  const handleEventActionPress = (label: string) => {
    setIsEventMenuOpen(false);
    onAction(`이벤트:${label}`);
  };

  return (
    <View style={styles.localDevControls}>
      {isOpen ? (
        <View style={styles.localDevMenuRow}>
          <View style={styles.localDevMenu}>
            {localDevActions.map((label) => (
              <Pressable
                accessibilityRole="button"
                key={label}
                onPress={() => handleActionPress(label)}
                style={[
                  styles.localDevMenuButton,
                  label === '이벤트' && isEventMenuOpen ? styles.localDevMenuButtonActive : null,
                ]}
              >
                <Text style={styles.localDevMenuButtonText}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {isEventMenuOpen ? (
            <View style={styles.localDevEventMenu}>
              {localDevEventActions.map((label) => (
                <Pressable
                  accessibilityLabel={`${label} 이벤트 시작`}
                  accessibilityRole="button"
                  key={label}
                  onPress={() => handleEventActionPress(label)}
                  style={styles.localDevEventButton}
                >
                  <Text style={styles.localDevEventButtonText}>{label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
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
    left: 14,
    position: 'absolute',
    zIndex: 20,
  },
  localDevMenu: {
    alignItems: 'center',
    gap: 6,
  },
  localDevMenuRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 7,
  },
  localDevEventButton: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    borderColor: '#7f5940',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 9,
  },
  localDevEventButtonText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  localDevEventMenu: {
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
  localDevMenuButtonActive: {
    backgroundColor: '#ffd28e',
    borderColor: '#a7552e',
  },
  localDevMenuButtonText: {
    color: '#6b321f',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
