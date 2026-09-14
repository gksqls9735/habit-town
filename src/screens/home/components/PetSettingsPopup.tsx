import { Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

const pixelFontFamily = 'Galmuri11';

export type PetSettingsLanguage = 'ko' | 'en';

type PetSettingsPopupProps = {
  language: PetSettingsLanguage;
  onChangeLanguage: (language: PetSettingsLanguage) => void;
  onClose: () => void;
  onTogglePushNotifications: () => void;
  pushNotificationsEnabled: boolean;
  visible: boolean;
  width: number;
};

const languageOptions: readonly { label: string; value: PetSettingsLanguage }[] = [
  { label: '한국어', value: 'ko' },
  { label: 'English', value: 'en' },
];

export function PetSettingsPopup({
  language,
  onChangeLanguage,
  onClose,
  onTogglePushNotifications,
  pushNotificationsEnabled,
  visible,
  width,
}: PetSettingsPopupProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.popupBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.popupFrame, { width }]}>
        <View style={styles.outerBorder}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>PET SETTINGS</Text>
              <Text style={styles.title}>설정</Text>
            </View>
            <Pressable
              accessibilityLabel="펫 설정 팝업 닫기"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>x</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.settingBlock}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>언어</Text>
                <Text style={styles.settingDescription}>한국어 / 영어 번역</Text>
              </View>
              <View style={styles.segmentedControl}>
                {languageOptions.map((option) => {
                  const selected = language === option.value;

                  return (
                    <Pressable
                      accessibilityLabel={`언어 ${option.label}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={option.value}
                      onPress={() => onChangeLanguage(option.value)}
                      style={[
                        styles.segmentButton,
                        selected ? styles.segmentButtonSelected : null,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.segmentButtonText,
                          selected ? styles.segmentButtonTextSelected : null,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.settingBlock}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingLabel}>Push 알림</Text>
                <Text style={styles.settingDescription}>할 일과 성장 알림 받기</Text>
              </View>
              <Pressable
                accessibilityLabel="Push 알림"
                accessibilityRole="switch"
                accessibilityState={{ checked: pushNotificationsEnabled }}
                onPress={onTogglePushNotifications}
                style={[
                  styles.toggleTrack,
                  pushNotificationsEnabled ? styles.toggleTrackOn : null,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    pushNotificationsEnabled ? styles.toggleThumbOn : null,
                  ]}
                />
                <Text style={styles.toggleText}>
                  {pushNotificationsEnabled ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 22,
  },
  content: {
    backgroundColor: '#fff8ea',
    gap: 10,
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  eyebrow: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 5,
  },
  header: {
    alignItems: 'flex-start',
    backgroundColor: '#fff8ea',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 7,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  outerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    overflow: 'hidden',
  },
  popupBackdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.48)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  popupFrame: {
    maxHeight: '86%',
    position: 'relative',
  },
  popupLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 48,
  },
  segmentedControl: {
    backgroundColor: '#ead4ad',
    borderColor: '#6b432f',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    minWidth: 78,
    paddingHorizontal: 9,
  },
  segmentButtonSelected: {
    backgroundColor: '#b96335',
  },
  segmentButtonText: {
    color: '#6f5141',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  segmentButtonTextSelected: {
    color: '#fff8ea',
  },
  settingBlock: {
    alignItems: 'center',
    backgroundColor: '#fff0cc',
    borderColor: '#9a603d',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 70,
    padding: 10,
  },
  settingCopy: {
    flex: 1,
    minWidth: 0,
  },
  settingDescription: {
    color: '#8a6a51',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
  },
  settingLabel: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  title: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
  },
  toggleText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
    position: 'absolute',
    right: 8,
  },
  toggleThumb: {
    backgroundColor: '#fff8ea',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 26,
    left: 3,
    position: 'absolute',
    top: 3,
    width: 26,
  },
  toggleThumbOn: {
    left: 35,
  },
  toggleTrack: {
    backgroundColor: '#a3907a',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    width: 66,
  },
  toggleTrackOn: {
    backgroundColor: '#87a85d',
  },
});
