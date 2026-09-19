import { useEffect, useRef, useState } from 'react';
import { Image, ImageStyle, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useI18n } from '../../../features/i18n';
import { GrowthStage, PetDefinition } from '../types';

const hamsterBabyWalkSheet = require('../../../../assets/png/animals/animations/applied/hamster/walk/hamster-baby-walk-spritesheet-v2.png');
const hamsterBabyDozeSheet = require('../../../../assets/png/animals/animations/applied/hamster/doze/hamster-baby-doze-spritesheet-v2.png');
const hamsterBabyWalkFrameCount = 4;
const hamsterBabyWalkFrameDurationMs = 220;
const hamsterBabyWalkMoveDurationMs = 80;
const hamsterBabyWalkRestDurationMs = 4200;
const hamsterBabyWalkBurstDurationMs = 2200;
const hamsterBabyWalkRangeRatio = 0.45;
const hamsterBabyWalkStepRatio = 0.018;
const hamsterBabyDozeFrameCount = 4;
const hamsterBabyDozeFrameDurationMs = 560;
const hamsterBabyDozeSleepDurationMs = 12000;
const hamsterBabyDozeLoop = [1, 2, 3, 2, 1];
const hamsterBabyCushionDozeChance = 0.45;
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

type StaticPetProps = {
  dozeZone?: {
    centerX: number;
    radius: number;
  };
  onPress?: () => void;
  pet: PetDefinition;
  petName: string;
  size: number;
  stage: GrowthStage;
};

export function StaticPet({ dozeZone, onPress, pet, petName, size, stage }: StaticPetProps) {
  const { t } = useI18n();
  const petSource = pet.stages[stage];
  const [walkFrameIndex, setWalkFrameIndex] = useState(0);
  const [walkDirection, setWalkDirection] = useState<'left' | 'right'>('left');
  const [walkOffsetX, setWalkOffsetX] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [isDozing, setIsDozing] = useState(false);
  const [dozeFrameIndex, setDozeFrameIndex] = useState(0);
  const isInsideDozeZoneRef = useRef(false);
  const shouldUseWalkAnimation = pet.id === 'hamster' && stage === 'baby';
  const walkRange = Math.round(size * hamsterBabyWalkRangeRatio);
  const walkStep = Math.max(2, Math.round(size * hamsterBabyWalkStepRatio));
  const containerStyle = [
    styles.staticPetWrap,
    {
      height: size,
      width: size,
    },
    shouldUseWalkAnimation
      ? {
        transform: [{ translateX: walkOffsetX }],
      }
      : null,
  ];
  const content = (
    <>
      <View
        style={[
          styles.characterShadow,
          {
            top: Math.round(size * 0.76),
            width: Math.round(size * 0.9),
          },
        ]}
      />
      {shouldUseWalkAnimation && isWalking ? (
        <View
          style={[
            styles.walkFrame,
            { height: size, width: size },
            walkDirection === 'right' ? styles.walkFrameFacingRight : null,
          ]}
        >
          <Image
            accessibilityIgnoresInvertColors
            source={hamsterBabyWalkSheet}
            style={[
              styles.walkSpriteSheet,
              pixelatedImageStyle,
              {
                height: size,
                transform: [{ translateX: -size * walkFrameIndex }],
                width: size * hamsterBabyWalkFrameCount,
              },
            ]}
          />
        </View>
      ) : shouldUseWalkAnimation && isDozing ? (
        <View style={[styles.walkFrame, { height: size, width: size }]}>
          <Image
            accessibilityIgnoresInvertColors
            source={hamsterBabyDozeSheet}
            style={[
              styles.walkSpriteSheet,
              pixelatedImageStyle,
              {
                height: size,
                transform: [{ translateX: -size * dozeFrameIndex }],
                width: size * hamsterBabyDozeFrameCount,
              },
            ]}
          />
        </View>
      ) : (
        <Image
          accessibilityIgnoresInvertColors
          source={petSource}
          style={[
            styles.activePetSprite,
            pixelatedImageStyle,
            {
              height: size,
              width: size,
            },
          ]}
        />
      )}
    </>
  );

  useEffect(() => {
    if (!shouldUseWalkAnimation) {
      setWalkFrameIndex(0);
      setWalkDirection('left');
      setWalkOffsetX(0);
      setIsWalking(false);
      setIsDozing(false);
      setDozeFrameIndex(0);
      isInsideDozeZoneRef.current = false;
      return;
    }

    if (!isWalking) {
      setWalkFrameIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setWalkFrameIndex((current) => (current + 1) % hamsterBabyWalkFrameCount);
    }, hamsterBabyWalkFrameDurationMs);

    return () => clearInterval(intervalId);
  }, [isWalking, shouldUseWalkAnimation]);

  useEffect(() => {
    if (!shouldUseWalkAnimation) {
      return;
    }

    if (isDozing) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (isWalking) {
        setIsWalking(false);
        return;
      }

      setIsWalking(true);
    }, isWalking ? hamsterBabyWalkBurstDurationMs : hamsterBabyWalkRestDurationMs);

    return () => clearTimeout(timeoutId);
  }, [isDozing, isWalking, shouldUseWalkAnimation]);

  useEffect(() => {
    if (!shouldUseWalkAnimation || !isDozing) {
      return;
    }

    let loopIndex = 0;
    setDozeFrameIndex(hamsterBabyDozeLoop[loopIndex]);

    const intervalId = setInterval(() => {
      loopIndex = (loopIndex + 1) % hamsterBabyDozeLoop.length;
      setDozeFrameIndex(hamsterBabyDozeLoop[loopIndex]);
    }, hamsterBabyDozeFrameDurationMs);

    return () => clearInterval(intervalId);
  }, [isDozing, shouldUseWalkAnimation]);

  useEffect(() => {
    if (!shouldUseWalkAnimation || !isDozing) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsDozing(false);
      setDozeFrameIndex(0);
    }, hamsterBabyDozeSleepDurationMs);

    return () => clearTimeout(timeoutId);
  }, [isDozing, shouldUseWalkAnimation]);

  useEffect(() => {
    if (!shouldUseWalkAnimation || !isWalking) {
      return;
    }

    const intervalId = setInterval(() => {
      setWalkOffsetX((current) => {
        const next = current + (walkDirection === 'right' ? walkStep : -walkStep);
        const isInsideDozeZone = dozeZone
          ? Math.abs(next - dozeZone.centerX) <= dozeZone.radius
          : false;

        if (
          isInsideDozeZone
          && !isInsideDozeZoneRef.current
          && Math.random() < hamsterBabyCushionDozeChance
        ) {
          isInsideDozeZoneRef.current = true;
          setIsWalking(false);
          setIsDozing(true);
          setDozeFrameIndex(1);
          return next;
        }

        isInsideDozeZoneRef.current = isInsideDozeZone;

        if (next >= walkRange) {
          setWalkDirection('left');
          return walkRange;
        }

        if (next <= -walkRange) {
          setWalkDirection('right');
          return -walkRange;
        }

        return next;
      });
    }, hamsterBabyWalkMoveDurationMs);

    return () => clearInterval(intervalId);
  }, [dozeZone, isWalking, shouldUseWalkAnimation, walkDirection, walkRange, walkStep]);

  useEffect(() => {
    isInsideDozeZoneRef.current = false;
  }, [dozeZone?.centerX, dozeZone?.radius]);

  const handlePress = () => {
    if (isDozing) {
      setIsDozing(false);
      setDozeFrameIndex(0);
    }

    onPress?.();
  };

  if (!onPress) {
    return (
      <View
        accessibilityLabel={t('pet.a11y.image', { name: petName })}
        style={containerStyle}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={t('pet.a11y.status', { name: petName })}
      accessibilityRole="button"
      onPress={handlePress}
      style={containerStyle}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activePetSprite: {
    resizeMode: 'contain',
  },
  characterShadow: {
    backgroundColor: '#73504b',
    height: 18,
    opacity: 0.26,
    position: 'absolute',
  },
  staticPetWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  walkFrame: {
    overflow: 'hidden',
  },
  walkFrameFacingRight: {
    transform: [{ scaleX: -1 }],
  },
  walkSpriteSheet: {
    resizeMode: 'stretch',
  },
});
