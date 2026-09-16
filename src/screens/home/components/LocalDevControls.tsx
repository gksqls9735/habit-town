import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../../features/i18n';

const localDevActions = ['event', 'data', 'status', 'reset'] as const;
const localDevSubActions = {
  data: ['currency', 'growth', 'growthFull'],
  event: ['parcel', 'gift'],
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
  const { t } = useI18n();

  const handleActionPress = (label: string) => {
    if (label === 'event' || label === 'data') {
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
                <Text numberOfLines={1} style={styles.localDevMenuButtonText}>{t(`home.dev.${label}`)}</Text>
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
                  accessibilityLabel={`${t(`home.dev.${activeSubMenu}`)} ${t(`home.dev.${label}`)}`}
                  accessibilityRole="button"
                  key={label}
                  onPress={() => handleSubActionPress(activeSubMenu, label)}
                  style={styles.localDevSubButton}
                >
                  <Text numberOfLines={1} style={styles.localDevSubButtonText}>{t(`home.dev.${label}`)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <Pressable
        accessibilityLabel={t('home.dev.open')}
        accessibilityRole="button"
        onPress={onToggle}
        style={styles.localDevButton}
      >
        <Text style={styles.localDevButtonText}>{t('home.dev.menu')}</Text>
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
