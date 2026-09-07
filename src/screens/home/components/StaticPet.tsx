import { Image, ImageStyle, Platform, StyleSheet, View } from 'react-native';
import { GrowthStage, PetDefinition } from '../types';

const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

type StaticPetProps = {
  pet: PetDefinition;
  size: number;
  stage: GrowthStage;
};

export function StaticPet({ pet, size, stage }: StaticPetProps) {
  const petSource = pet.stages[stage];

  return (
    <View
      style={[
        styles.staticPetWrap,
        {
          height: size,
          width: size,
        },
      ]}
    >
      <View
        style={[
          styles.characterShadow,
          {
            top: Math.round(size * 0.76),
            width: Math.round(size * 0.9),
          },
        ]}
      />
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
    </View>
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
});
