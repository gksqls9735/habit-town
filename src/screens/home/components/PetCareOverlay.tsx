import { Image, ImageSourcePropType, ImageStyle, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  experiencePerGrowthStage,
  growthStageLabels,
  RewardProgress,
} from '../../../features/rewards/rewardSystem';

const fontFamily = 'Galmuri11';
const cleanBrushIcon = require('../../../../assets/ui/action/clean-action-object-icon.png');
const feedBowlFullIcon = require('../../../../assets/ui/action/feed-action-object-icon.png');
const playBallIcon = require('../../../../assets/ui/action/play-action-object-icon.png');
const cleanlinessBubblesIcon = require('../../../../assets/ui/needs/cleanliness-bubbles-icon.png');
const hungerBoltIcon = require('../../../../assets/ui/needs/hunger-bolt-icon.png');
const lonelinessHeartBubbleIcon = require('../../../../assets/ui/needs/loneliness-heart-bubble-icon.png');

const previewNeeds = [
  { label: '청', name: '청결도', value: 0.8, color: '#8fbcc0', icon: cleanlinessBubblesIcon },
  { label: '굶', name: '굶주림', value: 0.45, color: '#dfb471', icon: hungerBoltIcon },
  { label: '외', name: '외로움', value: 0.3, color: '#e7a28f', icon: lonelinessHeartBubbleIcon },
];
const actions = [
  { label: '청소하기', color: '#d9ebea', icon: cleanBrushIcon },
  { label: '밥먹이기', color: '#f6e3bb', icon: feedBowlFullIcon },
  { label: '놀아주기', color: '#f3ded0', icon: playBallIcon },
];
const pixelStyle = Platform.OS === 'web'
  ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle) : undefined;

/** Shows the selected pet with earned experience and presentation-only care meters. */
export function PetStatusHud({
  petImage,
  petName,
  progress,
}: {
  petImage: ImageSourcePropType;
  petName: string;
  progress: RewardProgress;
}) {
  const experiencePercent = progress.experience / experiencePerGrowthStage;

  return (
    <View style={styles.top} pointerEvents="box-none">
      <View style={styles.statusPanel}>
        <View style={styles.portraitColumn}>
          <View style={styles.ring} accessibilityRole="progressbar"
            accessibilityLabel={`${petName} 경험치`} accessibilityValue={{ min: 0, max: 100, now: Math.round(experiencePercent * 100) }}>
            {Array.from({ length: 64 }, (_, index) => {
              const angle = index / 64 * Math.PI * 2 - Math.PI / 2;
              return <View key={index} style={[styles.ringSegment, {
                left: 33 + Math.cos(angle) * 31 - 1.5,
                top: 33 + Math.sin(angle) * 31 - 1.5,
                transform: [{ rotate: `${index / 64 * 360}deg` }],
                backgroundColor: index < Math.round(experiencePercent * 64) ? '#8aab65' : '#e2d8bc',
              }]} />;
            })}
            <View style={styles.portrait}>
              <Image source={petImage} accessibilityLabel={`선택한 펫 ${petName}`} resizeMode="contain" style={[styles.petImage, pixelStyle]} />
            </View>
          </View>
          <Text style={styles.stageBadge}>{growthStageLabels[progress.stage]}</Text>
        </View>
        <View style={styles.meters}>
          {previewNeeds.map((need) => <View key={need.label} style={styles.meterRow}
            accessibilityRole="progressbar" accessibilityLabel={`${need.name}, 디자인 미리보기`}
            accessibilityValue={{ min: 0, max: 100, now: need.value * 100 }}>
            <Image source={need.icon} resizeMode="contain" style={styles.meterIcon} />
            <View style={styles.track}><View style={[styles.fill, { width: `${need.value * 100}%`, backgroundColor: need.color }]}>
              <View style={styles.highlight} />
            </View></View>
          </View>)}
        </View>
      </View>
      <View style={styles.currency} accessibilityLabel={`금색 재화 ${progress.coins}`}>
        <View style={styles.coin}><View style={styles.coinCore} /></View>
        <Text style={styles.currencyText}>{progress.coins.toLocaleString('ko-KR')}</Text>
      </View>
    </View>
  );
}

/** Preview buttons reserve the care-action layout without changing pet state. */
export function PetCareActions() {
  return (
    <View style={styles.bottom} pointerEvents="box-none">
      <View style={styles.actions}>
        {actions.map((action) => <Pressable key={action.label} accessibilityRole="button"
          accessibilityLabel={`${action.label}, 디자인 미리보기`} accessibilityState={{ disabled: true }} disabled
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
  ring: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, borderColor: '#624936', backgroundColor: '#e2d8bc' },
  ringSegment: { position: 'absolute', width: 3, height: 3 },
  portrait: { position: 'absolute', left: 4, top: 4, width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: '#624936', backgroundColor: '#fffaf0', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  petImage: { width: 86, height: 86, flexShrink: 0, transform: [{ translateX: 3 }, { translateY: 11 }] },
  stageBadge: { position: 'absolute', bottom: 0, zIndex: 1, fontFamily, fontSize: 9, color: '#624936', backgroundColor: '#fff0cd', borderColor: '#795c43', borderWidth: 1, paddingHorizontal: 5, paddingVertical: 2 },
  meters: { flex: 1, minWidth: 0, gap: 8 },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meterIcon: { width: 14, height: 14 },
  track: { flex: 1, height: 14, borderWidth: 1, borderColor: '#795c43', backgroundColor: '#fffaf0', padding: 2 },
  fill: { height: '100%' },
  highlight: { height: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  currency: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, height: 34, backgroundColor: '#a3907a', borderWidth: 2, borderColor: '#624936', marginTop: 4 },
  currencyText: { fontFamily, fontSize: 11, color: '#fff8ea' },
  coin: { width: 15, height: 17, borderWidth: 2, borderColor: '#8f582c', backgroundColor: '#efc76d', padding: 2 },
  coinCore: { flex: 1, backgroundColor: '#bd813b' },
  bottom: { position: 'absolute', bottom: 14, left: 16, right: 16, alignItems: 'center', zIndex: 10 },
  actions: { flexDirection: 'row', width: '100%', maxWidth: 390, gap: 10 },
  action: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderBottomWidth: 5, borderColor: '#795c43', paddingVertical: 8 },
  actionHighlight: { position: 'absolute', top: 2, left: 2, right: 2, height: 2, backgroundColor: '#fffaf0' },
  actionIcon: { width: 48, height: 42 },
  actionLabel: { fontFamily, fontSize: 11, color: '#49372a' },
});
