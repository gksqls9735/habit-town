import {
  Image,
  ImageStyle,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { RailAction, RailMetrics } from '../types';

const badgeImages = [
  require('../../../../assets/ui/today-tasks/today-tasks-badge-0.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-1.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-2.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-3.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-4.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-5.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-6.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-7.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-8.png'),
  require('../../../../assets/ui/today-tasks/today-tasks-badge-9.png'),
] as const;
const pixelFontFamily = 'Galmuri11';
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

type HomeActionRailProps = {
  actions: RailAction[];
  metrics: RailMetrics;
  style: StyleProp<ViewStyle>;
};

export function HomeActionRail({ actions, metrics, style }: HomeActionRailProps) {
  return (
    <View style={[styles.rail, style]}>
      {actions.map((action) => (
        <RailButton action={action} key={action.label} metrics={metrics} />
      ))}
    </View>
  );
}

function RailButton({
  action,
  metrics,
}: {
  action: RailAction;
  metrics: RailMetrics;
}) {
  const badgeImage = getBadgeImage(action.badge);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={action.onPress}
      style={[
        styles.railButton,
        {
          minHeight: Math.round(60 * (metrics.iconSize / 42)),
          width: metrics.buttonWidth,
        },
      ]}
    >
      {badgeImage ? (
        <View style={styles.railBadge}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={badgeImage}
            style={[styles.railBadgeImage, pixelatedImageStyle]}
          />
        </View>
      ) : null}
      <View
        style={[
          action.image ? styles.generatedRailIcon : styles.railIcon,
          {
            height: metrics.iconSize,
            width: metrics.iconSize,
          },
        ]}
      >
        {action.image ? (
          <Image
            accessibilityIgnoresInvertColors
            source={action.image}
            style={styles.generatedRailImage}
          />
        ) : (
          <Text style={styles.railIconText}>{action.symbol}</Text>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.railLabel,
          {
            fontSize: metrics.labelFontSize,
            maxWidth: metrics.buttonWidth,
          },
        ]}
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

function getBadgeImage(badge: string | undefined) {
  if (!badge) return null;

  const badgeNumber = Number(badge);

  if (!Number.isFinite(badgeNumber)) {
    return null;
  }

  const badgeIndex = Math.max(0, Math.min(9, Math.floor(badgeNumber)));
  return badgeImages[badgeIndex];
}

const styles = StyleSheet.create({
  generatedRailIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatedRailImage: {
    height: '140%',
    resizeMode: 'contain',
    width: '140%',
  },
  rail: {
    position: 'absolute',
    zIndex: 5,
  },
  railBadge: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    top: -8,
    width: 28,
    zIndex: 3,
  },
  railBadgeImage: {
    height: 24,
    position: 'absolute',
    width: 28,
  },
  railButton: {
    alignItems: 'center',
  },
  railIcon: {
    alignItems: 'center',
    backgroundColor: '#fff4df',
    borderColor: '#d2a965',
    borderRadius: 7,
    borderWidth: 3,
    justifyContent: 'center',
  },
  railIconText: {
    color: '#805d46',
    fontFamily: pixelFontFamily,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  railLabel: {
    backgroundColor: '#ffffff',
    borderColor: '#d8c5a5',
    borderRadius: 5,
    borderWidth: 2,
    color: '#6c5847',
    fontFamily: pixelFontFamily,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: -4,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
});
