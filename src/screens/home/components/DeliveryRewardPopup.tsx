import {
  Image,
  ImageStyle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { DeliveryReward, DeliveryRewardRarity } from '../../../features/rewards/eventRewards';

const parcelImage = require('../../../../assets/event/animal-rescue-reward-gift-box.png');
const pixelFontFamily = 'Galmuri11';
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

const rarityLabels: Record<DeliveryRewardRarity, string> = {
  common: 'BASIC',
  rare: 'RARE',
  uncommon: 'GOOD',
};

type DeliveryRewardPopupProps = {
  isBusy: boolean;
  onAccept: () => void;
  onClose: () => void;
  onDiscard: () => void;
  reward: DeliveryReward | null;
  visible: boolean;
  width: number;
};

export function DeliveryRewardPopup({
  isBusy,
  onAccept,
  onClose,
  onDiscard,
  reward,
  visible,
  width,
}: DeliveryRewardPopupProps) {
  if (!visible || !reward) {
    return null;
  }

  const detail =
    reward.kind === 'currency'
      ? `${reward.amount.toLocaleString('ko-KR')} 골드`
      : `${reward.item.name} x${reward.item.quantity}`;
  const description =
    reward.kind === 'currency'
      ? '상점과 성장 준비에 사용할 수 있는 재화예요.'
      : reward.item.description;

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={isBusy ? undefined : onClose}>
        <View style={styles.popupBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.popupFrame, { width }]}>
        <View style={styles.frameShadowRight} />
        <View style={styles.frameShadowBottom} />
        <View style={styles.outerBorder}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
          <View style={styles.innerBorder}>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>ANIMAL RESCUE GIFT</Text>
                <Text style={styles.title}>택배 선물이 도착했어요</Text>
              </View>
              <Pressable
                accessibilityLabel="택배 선물 닫기"
                accessibilityRole="button"
                disabled={isBusy}
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>

            <View style={styles.content}>
              <View style={styles.rewardStage}>
                <Image
                  accessibilityIgnoresInvertColors
                  source={parcelImage}
                  style={[styles.parcelImage, pixelatedImageStyle]}
                />
                <View style={styles.rewardCard}>
                  <Text style={styles.rarityText}>{rarityLabels[reward.rarity]}</Text>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardDetail}>{detail}</Text>
                  <Text style={styles.rewardDescription}>{description}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  accessibilityLabel="택배 선물 버리기"
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={onDiscard}
                  style={[styles.actionButton, styles.discardButton]}
                >
                  <Text style={styles.discardText}>버리기</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="택배 선물 받기"
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={onAccept}
                  style={[styles.actionButton, styles.acceptButton]}
                >
                  <Text style={styles.acceptText}>{isBusy ? '받는 중...' : '받기'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    flex: 1.35,
  },
  acceptText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  actionButton: {
    alignItems: 'center',
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    marginLeft: 8,
    width: 34,
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
  cornerBottomLeft: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    display: 'none',
    height: 3,
    left: 0,
    position: 'absolute',
    width: 18,
    zIndex: 4,
  },
  cornerBottomRight: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    display: 'none',
    height: 3,
    position: 'absolute',
    right: 0,
    width: 18,
    zIndex: 4,
  },
  cornerTopLeft: {
    backgroundColor: '#3d2d28',
    display: 'none',
    height: 3,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 18,
    zIndex: 4,
  },
  cornerTopRight: {
    backgroundColor: '#3d2d28',
    display: 'none',
    height: 3,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 18,
    zIndex: 4,
  },
  discardButton: {
    backgroundColor: '#ead4ad',
    borderColor: '#6b432f',
    flex: 1,
  },
  discardText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  eyebrow: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 5,
  },
  frameShadowBottom: {
    backgroundColor: '#6b432f',
    bottom: -4,
    height: 5,
    left: 5,
    position: 'absolute',
    right: -4,
  },
  frameShadowRight: {
    backgroundColor: '#8c5f3e',
    bottom: -4,
    position: 'absolute',
    right: -4,
    top: 5,
    width: 5,
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
  innerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: 'transparent',
    borderWidth: 0,
    overflow: 'hidden',
  },
  outerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    padding: 0,
    position: 'relative',
    zIndex: 2,
  },
  parcelImage: {
    height: 106,
    resizeMode: 'contain',
    width: 106,
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
    zIndex: 45,
  },
  rarityText: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 5,
  },
  rewardCard: {
    backgroundColor: '#fff0cc',
    borderColor: '#9a603d',
    borderWidth: 2,
    flex: 1,
    minHeight: 104,
    minWidth: 0,
    padding: 10,
  },
  rewardDescription: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 7,
  },
  rewardDetail: {
    color: '#b65f2f',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 5,
  },
  rewardName: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 19,
  },
  rewardStage: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
