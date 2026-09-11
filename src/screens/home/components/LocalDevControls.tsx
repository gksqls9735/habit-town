import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const localDevActions = ['이벤트', '데이터', '상태', '리셋'] as const;
const localDevSubActions = {
  이벤트: ['택배', '선물 보내기'],
  데이터: ['재화 증가', '경험치 증가', '경험치 100%'],
} as const;
const pixelFontFamily = 'Galmuri11';
const localDevSubMenuRowHeight = 42;

type LocalDevSubMenuKey = keyof typeof localDevSubActions;

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
  const [activeSubMenu, setActiveSubMenu] = useState<LocalDevSubMenuKey | null>(null);

  const handleActionPress = (label: string) => {
    if (label === '이벤트' || label === '데이터') {
      setActiveSubMenu((current) => (current === label ? null : label));
      return;
    }

    setActiveSubMenu(null);
    onAction(label);
  };

  const handleSubActionPress = (menuLabel: LocalDevSubMenuKey, label: string) => {
    onAction(`${menuLabel}:${label}`);
  };

  return (
    <View style={styles.localDevControls}>
      {isOpen ? (
        <View style={styles.localDevMenuWrap}>
          <View style={styles.localDevMenu}>
            {localDevActions.map((label) => (
              <Pressable
                accessibilityRole="button"
                key={label}
                onPress={() => handleActionPress(label)}
                style={[
                  styles.localDevMenuButton,
                  label === activeSubMenu ? styles.localDevMenuButtonActive : null,
                ]}
              >
                <Text numberOfLines={1} style={styles.localDevMenuButtonText}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {activeSubMenu ? (
            <View
              style={[
                styles.localDevSubMenu,
                { top: localDevActions.indexOf(activeSubMenu) * localDevSubMenuRowHeight },
              ]}
            >
              {localDevSubActions[activeSubMenu].map((label) => (
                <Pressable
                  accessibilityLabel={`${activeSubMenu} ${label}`}
                  accessibilityRole="button"
                  key={label}
                  onPress={() => handleSubActionPress(activeSubMenu, label)}
                  style={styles.localDevSubButton}
                >
                  <Text numberOfLines={1} style={styles.localDevSubButtonText}>{label}</Text>
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
  localDevMenuWrap: {
    position: 'relative',
  },
  localDevSubButton: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    borderColor: '#7f5940',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    minWidth: 98,
    paddingHorizontal: 9,
  },
  localDevSubButtonText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  localDevSubMenu: {
    alignItems: 'center',
    gap: 6,
    left: 66,
    position: 'absolute',
    top: 0,
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
