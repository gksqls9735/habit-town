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

const coinIcon = require('../../../../assets/ui/currency-coin.png');
const giftIcon = require('../../../../assets/ui/reward-button.png');
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

type GiftRewardPopupProps = {
  giftBoxCount: number;
  isBusy: boolean;
  onClose: () => void;
  onOpenBox: () => void;
  reward: DeliveryReward | null;
  visible: boolean;
  width: number;
};

export function GiftRewardPopup({
  giftBoxCount,
  isBusy,
  onClose,
  onOpenBox,
  reward,
  visible,
  width,
}: GiftRewardPopupProps) {
  if (!visible) {
    return null;
  }

  const canOpenGiftBox = giftBoxCount > 0 && !reward;

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={isBusy ? undefined : onClose}>
        <View style={styles.popupBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.popupFrame, { width }]}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>GIFT REWARD</Text>
                <Text style={styles.title}>선물 상자</Text>
              </View>
              <Pressable
                accessibilityLabel="선물 팝업 닫기"
                accessibilityRole="button"
                disabled={isBusy}
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>

            <View style={styles.content}>
              <View style={styles.giftStage}>
                <View style={styles.giftBoxStage}>
                  <Image
                    accessibilityIgnoresInvertColors
                    source={giftIcon}
                    resizeMode="contain"
                    style={styles.giftImage}
                  />
                  {giftBoxCount > 1 ? (
                    <View style={styles.giftCountBadge}>
                      <Text style={styles.giftCountText}>x{giftBoxCount}</Text>
                    </View>
                  ) : null}
                </View>
                {reward ? (
                  <RewardCard reward={reward} />
                ) : (
                  <View style={styles.rewardCard}>
                    <Text style={styles.cardEyebrow}>UNOPENED</Text>
                    <Text style={styles.rewardTitle}>
                      {giftBoxCount > 0 ? '선물 상자가 기다려요' : '선물 상자가 없어요'}
                    </Text>
                    <Text style={styles.rewardDescription}>
                      {giftBoxCount > 0
                        ? '광고를 보고 상자를 열면 재화나 아이템을 받을 수 있어요.'
                        : '선물 상자가 배송 중이에요.\n조금만 기다려 주세요.'}
                    </Text>
                  </View>
                )}
              </View>

              {reward ? (
                <Pressable
                  accessibilityLabel="선물 보상 확인"
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={onClose}
                  style={[styles.actionButton, styles.confirmButton]}
                >
                  <Text style={styles.claimText}>확인</Text>
                </Pressable>
              ) : (
                <View style={styles.actionRow}>
                  <Pressable
                    accessibilityLabel="선물 팝업 닫기"
                    accessibilityRole="button"
                    disabled={isBusy}
                    onPress={onClose}
                    style={[styles.actionButton, styles.closeRewardButton]}
                  >
                    <Text style={styles.closeRewardText}>나중에</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="광고 보고 선물 상자 열기"
                    accessibilityRole="button"
                    disabled={isBusy || !canOpenGiftBox}
                    onPress={onOpenBox}
                    style={[
                      styles.actionButton,
                      styles.claimButton,
                      !canOpenGiftBox ? styles.actionButtonDisabled : null,
                    ]}
                  >
                    <Text style={styles.claimText}>{isBusy ? '확인 중...' : '광고 보고 열기'}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function RewardCard({ reward }: { reward: DeliveryReward }) {
  const detail = reward.kind === 'currency'
    ? `${reward.amount.toLocaleString('ko-KR')} 골드`
    : `${reward.item.name} x${reward.item.quantity}`;
  const description = reward.kind === 'currency'
    ? '상자 안에서 반짝이는 재화가 나왔어요.'
    : reward.item.description;

  return (
    <View style={styles.rewardCard}>
      <Text style={styles.cardEyebrow}>{rarityLabels[reward.rarity]}</Text>
      <Text style={styles.rewardTitle}>{reward.name}</Text>
      <RewardDetail reward={reward} text={detail} />
      <Text style={styles.rewardDescription}>{description}</Text>
    </View>
  );
}

function RewardDetail({ reward, text }: { reward: DeliveryReward; text: string }) {
  if (reward.kind !== 'currency') {
    return <Text style={styles.rewardAmount}>{text}</Text>;
  }

  return (
    <View style={styles.rewardAmountRow}>
      <Image
        accessibilityIgnoresInvertColors
        source={coinIcon}
        resizeMode="contain"
        style={[styles.coinIcon, pixelatedImageStyle]}
      />
      <Text style={styles.rewardAmount}>{text}</Text>
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
  cardEyebrow: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 5,
  },
  claimButton: {
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    flex: 1.35,
  },
  claimText: {
    color: '#fff8ea',
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
    marginLeft: 8,
    width: 36,
  },
  closeRewardButton: {
    backgroundColor: '#ead4ad',
    borderColor: '#6b432f',
    flex: 1,
  },
  closeRewardText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  closeText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 22,
  },
  confirmButton: {
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    marginTop: 14,
  },
  coinIcon: {
    height: 22,
    width: 22,
  },
  content: {
    backgroundColor: '#fff8ea',
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
  giftImage: {
    height: 92,
    width: 92,
  },
  giftBoxStage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 96,
  },
  giftCountBadge: {
    alignItems: 'center',
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    borderWidth: 2,
    bottom: 1,
    minWidth: 38,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: 'absolute',
    right: 2,
  },
  giftCountText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  giftStage: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
  rewardAmount: {
    color: '#b65f2f',
    fontFamily: pixelFontFamily,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  rewardAmountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 7,
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
  rewardTitle: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 19,
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
