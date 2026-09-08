import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageStyle,
  Platform,
  Pressable,
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
  isParcelAvailable: boolean;
  eventKey: number;
  height: number;
  onOpenParcel: () => void;
  width: number;
};

export function RewardDeliveryEvent({
  bottom,
  eventKey,
  height,
  isParcelAvailable,
  onOpenParcel,
  width,
}: RewardDeliveryEventProps) {
  const [isVisible, setIsVisible] = useState(eventKey > 0);
  const [isTruckVisible, setIsTruckVisible] = useState(eventKey > 0);
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
    setIsTruckVisible(true);
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
        setIsTruckVisible(false);
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

  useEffect(() => {
    if (!isParcelAvailable && eventKey > 0) {
      setIsVisible(false);
    }
  }, [eventKey, isParcelAvailable]);

  if (!isVisible || (!isTruckVisible && !isParcelAvailable)) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.deliveryLayer}>
      {isTruckVisible ? (
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
      ) : null}
      <Animated.View
        pointerEvents={isParcelAvailable ? 'auto' : 'none'}
        style={[
          styles.deliveryParcel,
          {
            bottom: parcelStartBottom,
            height: parcelWidth,
            left: parcelLeft,
            opacity: parcelOpacity,
            transform: [{ translateY: parcelTranslateY }],
            width: parcelWidth,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="동물보호협회 택배 선물 열기"
          accessibilityRole="button"
          disabled={!isParcelAvailable}
          onPress={onOpenParcel}
          style={styles.parcelButton}
        >
          <Animated.Image
            accessibilityIgnoresInvertColors
            source={deliveryParcelImage}
            style={[styles.parcelImage, pixelatedImageStyle]}
          />
        </Pressable>
      </Animated.View>
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
  },
  parcelButton: {
    height: '100%',
    width: '100%',
  },
  parcelImage: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
});
