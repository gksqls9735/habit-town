import { Image, ImageStyle, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import {
  experiencePerGrowthStage,
} from '../../../features/rewards/rewardSystem';
import type {
  CareMeterKey,
  CareMeterValues,
  RewardProgress,
} from '../../../features/rewards/rewardSystem';

const fontFamily = 'Galmuri11';
const cleanBrushIcon = require('../../../../assets/ui/action/clean-action-object-icon.png');
const feedBowlFullIcon = require('../../../../assets/ui/action/feed-action-object-icon.png');
const playBallIcon = require('../../../../assets/ui/action/play-action-object-icon.png');
const cleanlinessBubblesIcon = require('../../../../assets/ui/needs/cleanliness-bubbles-icon.png');
const hungerBoltIcon = require('../../../../assets/ui/needs/hunger-bolt-icon.png');
const lonelinessHeartBubbleIcon = require('../../../../assets/ui/needs/loneliness-heart-bubble-icon.png');
const coinIcon = require('../../../../assets/png/ui/gromi-coin.png');

type CareMeterView = {
  color: string;
  icon: ImageSourcePropType;
  key: CareMeterKey;
  label: string;
  name: string;
};

type CareActionView = {
  color: string;
  icon: ImageSourcePropType;
  key: CareMeterKey;
  label: string;
};

const previewNeeds: CareMeterView[] = [
  { key: 'cleanliness', label: '청', name: '청결도', color: '#8fbcc0', icon: cleanlinessBubblesIcon },
  { key: 'hunger', label: '굶', name: '포만감', color: '#dfb471', icon: hungerBoltIcon },
  { key: 'loneliness', label: '외', name: '친밀도', color: '#e7a28f', icon: lonelinessHeartBubbleIcon },
];
const actions: CareActionView[] = [
  { key: 'cleanliness', label: '청소하기', color: '#d9ebea', icon: cleanBrushIcon },
  { key: 'hunger', label: '밥먹이기', color: '#f6e3bb', icon: feedBowlFullIcon },
  { key: 'loneliness', label: '놀아주기', color: '#f3ded0', icon: playBallIcon },
];
const growthRingSegments = 32;
const pixelStyle = Platform.OS === 'web'
  ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle) : undefined;

/** Shows the selected pet with earned growth and care meters. */
export function PetStatusHud({
  careMeters,
  onPressPet,
  petImage,
  petName,
  progress,
  roomName,
}: {
  careMeters: CareMeterValues;
  onPressPet?: () => void;
  petImage: ImageSourcePropType;
  petName: string;
  progress: RewardProgress;
  roomName: string;
}) {
  const growthPercent = progress.experience / experiencePerGrowthStage;

  return (
    <View style={styles.top} pointerEvents="box-none">
      <View style={styles.statusPanel}>
        <View style={styles.portraitColumn}>
          <Pressable style={styles.ring} accessibilityRole="button"
            accessibilityLabel={`${petName} 상태 보기`} onPress={onPressPet}>
            <View style={styles.ringInnerShadow} />
            {Array.from({ length: growthRingSegments }, (_, index) => {
              const angle = index / growthRingSegments * Math.PI * 2 - Math.PI / 2;
              const isFilled = index < Math.round(growthPercent * growthRingSegments);

              return <View key={index} style={[styles.ringSegment, {
                left: 34 + Math.cos(angle) * 30 - 3,
                top: 34 + Math.sin(angle) * 30 - 3,
                transform: [{ rotate: `${index / growthRingSegments * 360}deg` }],
                backgroundColor: isFilled ? '#87a85d' : '#d5c99f',
                borderColor: isFilled ? '#5d743f' : '#b9a87d',
              }]} />;
            })}
            <View style={styles.portrait}>
              <Image source={petImage} accessibilityLabel={`선택한 펫 ${petName}`} resizeMode="contain" style={[styles.petImage, pixelStyle]} />
            </View>
          </Pressable>
          <Text numberOfLines={1} style={styles.stageBadge}>{petName}</Text>
        </View>
        <View style={styles.meters}>
          {previewNeeds.map((need) => {
            const value = careMeters[need.key];

            return <View key={need.label} style={styles.meterRow}
              accessibilityRole="progressbar" accessibilityLabel={need.name}
              accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
            <Image source={need.icon} resizeMode="contain" style={styles.meterIcon} />
            <View style={styles.track}><View style={[styles.fill, { width: `${value * 100}%`, backgroundColor: need.color }]}>
              <View style={styles.highlight} />
            </View></View>
            </View>;
          })}
        </View>
      </View>
      <View style={styles.roomSummary}>
        <View style={styles.currency} accessibilityLabel={`금색 재화 ${progress.coins}`}>
          <Image accessibilityIgnoresInvertColors source={coinIcon} resizeMode="contain" style={[styles.coinIcon, pixelStyle]} />
          <Text style={styles.currencyText}>{progress.coins.toLocaleString('ko-KR')}</Text>
        </View>
        <Text numberOfLines={1} style={styles.roomNameText}>
          {roomName}
        </Text>
      </View>
    </View>
  );
}

/** Bottom care actions open the matching care item flow. */
export function PetCareActions({
  onCareAction,
}: {
  onCareAction: (meter: CareMeterKey) => void;
}) {
  return (
    <View style={styles.bottom} pointerEvents="box-none">
      <View style={styles.actions}>
        {actions.map((action) => <Pressable key={action.label} accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={() => onCareAction(action.key)}
          style={[styles.action, { backgroundColor: action.color }]}>
          <View style={styles.actionHighlight} />
          {action.icon ? (
            <Image source={action.icon} accessibilityLabel={action.label} resizeMode="contain" style={styles.actionIcon} />
          ) : (
            <Text style={styles.actionLabel}>{action.label}</Text>
          )}
        </Pressable>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, zIndex: 10 },
  statusPanel: { width: '50%', maxWidth: 390, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  portraitColumn: { alignItems: 'center', width: 68, paddingBottom: 6 },
  ring: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: '#624936', backgroundColor: '#efe1b8' },
  ringInnerShadow: { position: 'absolute', left: 5, top: 5, width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: '#c8b88e' },
  ringSegment: { position: 'absolute', width: 6, height: 6, borderWidth: 1 },
  portrait: { position: 'absolute', left: 4, top: 4, width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: '#624936', backgroundColor: '#fffaf0', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  petImage: { width: 86, height: 86, flexShrink: 0, transform: [{ translateX: 3 }, { translateY: 11 }] },
  stageBadge: { position: 'absolute', bottom: 0, zIndex: 1, maxWidth: 86, fontFamily, fontSize: 9, color: '#624936', backgroundColor: '#fff0cd', borderColor: '#795c43', borderWidth: 1, paddingHorizontal: 5, paddingVertical: 2 },
  meters: { flex: 1, minWidth: 0, gap: 8 },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meterIcon: { width: 14, height: 14 },
  track: { flex: 1, height: 14, borderWidth: 1, borderColor: '#795c43', backgroundColor: '#fffaf0', padding: 2 },
  fill: { height: '100%' },
  highlight: { height: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  roomSummary: { flexShrink: 0, alignItems: 'flex-end', marginTop: 4 },
  currency: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2, height: 38, marginTop: 2 },
  currencyText: { fontFamily, fontSize: 12, fontWeight: '900', color: '#604832', textShadowColor: '#fff8ea', textShadowOffset: { height: 1, width: 1 }, textShadowRadius: 0 },
  coinIcon: { width: 32, height: 32 },
  roomNameText: { maxWidth: 132, fontFamily, fontSize: 11, color: '#5e4235', fontWeight: '900', letterSpacing: 0, marginTop: -2, textShadowColor: '#fff8ea', textShadowOffset: { height: 1, width: 1 }, textShadowRadius: 0 },
  bottom: { position: 'absolute', bottom: 14, left: 16, right: 16, alignItems: 'center', zIndex: 10 },
  actions: { flexDirection: 'row', width: '100%', maxWidth: 390, gap: 10 },
  action: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderBottomWidth: 5, borderColor: '#795c43', paddingVertical: 8 },
  actionHighlight: { position: 'absolute', top: 2, left: 2, right: 2, height: 2, backgroundColor: '#fffaf0' },
  actionIcon: { width: 48, height: 42 },
  actionLabel: { fontFamily, fontSize: 11, color: '#49372a' },
});
