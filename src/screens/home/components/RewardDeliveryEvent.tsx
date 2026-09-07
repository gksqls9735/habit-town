import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageStyle,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

const deliveryTruckImage = require('../../../../assets/event/animal-rescue-reward-truck.png');
const deliveryParcelImage = require('../../../../assets/event/animal-rescue-reward-gift-box.png');
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

type RewardDeliveryEventProps = {
  bottom: number;
  eventKey: number;
  height: number;
  width: number;
};

export function RewardDeliveryEvent({
  bottom,
  eventKey,
  height,
  width,
}: RewardDeliveryEventProps) {
  const [isVisible, setIsVisible] = useState(eventKey > 0);
  const truckWidth = Math.round(Math.min(230, Math.max(148, width * 0.46)));
  const truckHeight = truckWidth;
  const truckBottom = Math.min(
    Math.max(72, bottom - Math.round(height * 0.08)),
    Math.round(height * 0.28),
  );
  const parcelWidth = Math.round(Math.min(78, Math.max(48, width * 0.15)));
  const parcelDropDistance = Math.round(
    Math.min(76, Math.max(44, truckHeight * 0.32)),
  );
  const parcelStartBottom = truckBottom + Math.round(truckHeight * 0.36);
  const parcelLeft = Math.round(
    width * 0.5 + truckWidth * 0.12 - parcelWidth * 0.5,
  );
  const translateX = useRef(new Animated.Value(width + truckWidth)).current;
  const parcelOpacity = useRef(new Animated.Value(0)).current;
  const parcelTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (eventKey <= 0) {
      return undefined;
    }

    setIsVisible(true);
    translateX.setValue(width + truckWidth);
    parcelOpacity.setValue(0);
    parcelTranslateY.setValue(0);

    const animation = Animated.sequence([
      Animated.timing(translateX, {
        duration: 1450,
        easing: Easing.out(Easing.cubic),
        toValue: Math.round(width * 0.5 - truckWidth * 0.5),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(parcelOpacity, {
          duration: 80,
          easing: Easing.linear,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(parcelTranslateY, {
          duration: 560,
          easing: Easing.out(Easing.bounce),
          toValue: parcelDropDistance,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(280),
      Animated.timing(translateX, {
        duration: 1100,
        easing: Easing.in(Easing.cubic),
        toValue: -truckWidth,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setIsVisible(false);
      }
    });

    return () => {
      animation.stop();
    };
  }, [
    eventKey,
    parcelDropDistance,
    parcelOpacity,
    parcelTranslateY,
    translateX,
    truckWidth,
    width,
  ]);

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.deliveryLayer}>
      <Animated.Image
        accessibilityIgnoresInvertColors
        source={deliveryTruckImage}
        style={[
          styles.deliveryTruck,
          pixelatedImageStyle,
          {
            bottom: truckBottom,
            height: truckHeight,
            transform: [{ translateX }],
            width: truckWidth,
          },
        ]}
      />
      <Animated.Image
        accessibilityIgnoresInvertColors
        source={deliveryParcelImage}
        style={[
          styles.deliveryParcel,
          pixelatedImageStyle,
          {
            bottom: parcelStartBottom,
            height: parcelWidth,
            left: parcelLeft,
            opacity: parcelOpacity,
            transform: [{ translateY: parcelTranslateY }],
            width: parcelWidth,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  deliveryLayer: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 12,
  },
  deliveryTruck: {
    left: 0,
    position: 'absolute',
    resizeMode: 'contain',
  },
  deliveryParcel: {
    position: 'absolute',
    resizeMode: 'contain',
  },
});
