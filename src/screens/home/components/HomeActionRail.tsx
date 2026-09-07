import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { RailAction, RailMetrics } from '../types';

const pixelFontFamily = 'Galmuri11';

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
      {action.badge ? (
        <View style={styles.railBadge}>
          <Text style={styles.railBadgeText}>{action.badge}</Text>
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
    backgroundColor: '#f3a0a8',
    borderColor: '#fff3f4',
    borderRadius: 6,
    borderWidth: 2,
    minHeight: 18,
    minWidth: 24,
    paddingHorizontal: 4,
    position: 'absolute',
    right: 2,
    top: -6,
    zIndex: 3,
  },
  railBadgeText: {
    color: '#ffffff',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
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
