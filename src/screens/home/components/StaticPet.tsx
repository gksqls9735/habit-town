import { Image, ImageStyle, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useI18n } from '../../../features/i18n';
import { GrowthStage, PetDefinition } from '../types';

const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

type StaticPetProps = {
  onPress?: () => void;
  pet: PetDefinition;
  petName: string;
  size: number;
  stage: GrowthStage;
};

export function StaticPet({ onPress, pet, petName, size, stage }: StaticPetProps) {
  const { t } = useI18n();
  const petSource = pet.stages[stage];
  const containerStyle = [
    styles.staticPetWrap,
    {
      height: size,
      width: size,
    },
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
    </>
  );

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
      onPress={onPress}
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
});
