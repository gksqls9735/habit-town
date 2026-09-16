import { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { PopupCloseButton } from '../../../components/common/PopupCloseButton';
import { useI18n } from '../../../features/i18n';
import {
  experiencePerGrowthStage,
  RewardProgress,
} from '../../../features/rewards/rewardSystem';

const pixelFontFamily = 'Galmuri11';
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

type PetStatusPopupProps = {
  defaultName: string;
  defaultRoomName: string;
  displayName: string;
  displayRoomName: string;
  errorMessage: string;
  isSaving: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onSaveProfile: (name: string, roomName: string) => void;
  petImage: ImageSourcePropType;
  progress: RewardProgress;
  visible: boolean;
  width: number;
};

export function PetStatusPopup({
  defaultName,
  defaultRoomName,
  displayName,
  displayRoomName,
  errorMessage,
  isSaving,
  onClose,
  onOpenSettings,
  onSaveProfile,
  petImage,
  progress,
  visible,
  width,
}: PetStatusPopupProps) {
  const [draftName, setDraftName] = useState(displayName);
  const [draftRoomName, setDraftRoomName] = useState(displayRoomName);
  const normalizedDraftName = draftName.trim();
  const normalizedDraftRoomName = draftRoomName.trim();
  const growthPercent = Math.round(progress.experience / experiencePerGrowthStage * 100);
  const { t } = useI18n();

  useEffect(() => {
    if (visible) {
      setDraftName(displayName);
      setDraftRoomName(displayRoomName);
    }
  }, [displayName, displayRoomName, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={isSaving ? undefined : onClose}>
        <View style={styles.popupBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.popupFrame, { width }]}>
        <View style={styles.outerBorder}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>PET STATUS</Text>
              <Text style={styles.title}>{t('pet.status.title')}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityLabel={t('pet.status.settings')}
                accessibilityRole="button"
                disabled={isSaving}
                onPress={onOpenSettings}
                style={styles.settingsIconButton}
              >
                <Text style={styles.settingsIconText}>⚙</Text>
              </Pressable>
              <PopupCloseButton
                accessibilityLabel={t('pet.status.close')}
                disabled={isSaving}
                onPress={onClose}
              />
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.summaryRow}>
              <View style={styles.petPortrait}>
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={petImage}
                  style={[styles.petImage, pixelatedImageStyle]}
                />
              </View>
              <View style={styles.statPanel}>
                <Text style={styles.nameText}>{displayName}</Text>
                <Text style={styles.subText}>{t('pet.status.defaultName', { name: defaultName })}</Text>
                <Text style={styles.subText}>{t('pet.status.roomName', { name: displayRoomName })}</Text>
                <View style={styles.statGrid}>
                  <StatusChip label={t('pet.status.stage')} value={t(`stage.${progress.stage}`)} />
                  <StatusChip label={t('pet.status.growth')} value={`${growthPercent}%`} />
                </View>
              </View>
            </View>

            <View style={styles.formBlock}>
              <Text style={styles.inputLabel}>{t('pet.status.nameLabel')}</Text>
              <TextInput
                accessibilityLabel={t('pet.status.nameInput')}
                editable={!isSaving}
                maxLength={12}
                onChangeText={setDraftName}
                placeholder={t('pet.status.newName')}
                placeholderTextColor="#a98669"
                style={styles.nameInput}
                value={draftName}
              />
              <Text style={styles.helperText}>{t('pet.status.helperName')}</Text>
              <Text style={[styles.inputLabel, styles.roomInputLabel]}>{t('pet.status.roomLabel')}</Text>
              <TextInput
                accessibilityLabel={t('pet.status.roomInput')}
                editable={!isSaving}
                maxLength={16}
                onChangeText={setDraftRoomName}
                placeholder={defaultRoomName}
                placeholderTextColor="#a98669"
                style={styles.nameInput}
                value={draftRoomName}
              />
              <Text style={styles.helperText}>{t('pet.status.helperRoom')}</Text>
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>

            <View style={styles.actionRow}>
              <Pressable
                accessibilityLabel={t('pet.status.close')}
                accessibilityRole="button"
                disabled={isSaving}
                onPress={onClose}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>{t('actions.close')}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={t('pet.status.saveA11y')}
                accessibilityRole="button"
                disabled={isSaving || !normalizedDraftName || !normalizedDraftRoomName}
                onPress={() => onSaveProfile(normalizedDraftName, normalizedDraftRoomName)}
                style={[
                  styles.actionButton,
                  styles.saveButton,
                  !normalizedDraftName || !normalizedDraftRoomName ? styles.actionButtonDisabled : null,
                ]}
              >
                <Text style={styles.saveText}>{isSaving ? t('actions.saving') : t('actions.save')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusChip}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionButtonDisabled: {
    backgroundColor: '#c8a889',
    borderColor: '#8d7460',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  cancelButton: {
    backgroundColor: '#ead4ad',
    borderColor: '#6b432f',
    flex: 1,
  },
  cancelText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
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
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  errorText: {
    color: '#b5412f',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 15,
    marginTop: 7,
  },
  eyebrow: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 5,
  },
  formBlock: {
    backgroundColor: '#fff0cc',
    borderColor: '#9a603d',
    borderWidth: 2,
    marginTop: 12,
    padding: 10,
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
  headerActions: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  helperText: {
    color: '#8a6a51',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 6,
  },
  inputLabel: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 7,
  },
  roomInputLabel: {
    marginTop: 12,
  },
  nameInput: {
    backgroundColor: '#fff8ea',
    borderColor: '#6b432f',
    borderWidth: 2,
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    height: 42,
    letterSpacing: 0,
    paddingHorizontal: 9,
  },
  nameText: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 22,
  },
  outerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    overflow: 'hidden',
  },
  petImage: {
    height: 116,
    width: 116,
  },
  petPortrait: {
    alignItems: 'center',
    backgroundColor: '#fff0cc',
    borderColor: '#9a603d',
    borderWidth: 2,
    height: 104,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 104,
  },
  popupBackdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.58)',
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
    zIndex: 46,
  },
  saveButton: {
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    flex: 1.35,
  },
  saveText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  settingsIconButton: {
    alignItems: 'center',
    backgroundColor: '#ffe3a9',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  settingsIconText: {
    color: '#5c3529',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
    letterSpacing: 0,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 9,
  },
  statPanel: {
    flex: 1,
    minWidth: 0,
  },
  statusChip: {
    backgroundColor: '#fff8ea',
    borderColor: '#b9824f',
    borderWidth: 2,
    minWidth: 62,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  statusLabel: {
    color: '#9b6234',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 4,
  },
  statusValue: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
  },
});
