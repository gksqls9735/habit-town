import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { GrowthStage, PetDefinition } from '../types';

const pixelFontFamily = 'Galmuri11';

export function PetRoomPopup({
  activePetId,
  currentStage,
  onClose,
  onSelectPet,
  pets,
  scale,
  width,
}: {
  activePetId: PetDefinition['id'];
  currentStage: GrowthStage;
  onClose: () => void;
  onSelectPet: (petId: PetDefinition['id']) => void;
  pets: PetDefinition[];
  scale: number;
  width: number;
}) {
  const [selectedPetId, setSelectedPetId] =
    useState<PetDefinition['id']>(activePetId);
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];
  const popupPets = [pets[1], pets[0], pets[2]];

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.popupBackdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.popupFrame, { width }]}>
        <View style={styles.popupTopCap} />
        <View style={styles.popupBottomCap} />
        <View style={styles.popupOuterBorder}>
          <View style={styles.popupCornerCutTopLeft} />
          <View style={styles.popupCornerCutTopRight} />
          <View style={styles.popupCornerCutBottomLeft} />
          <View style={styles.popupCornerCutBottomRight} />
          <View style={styles.popupInnerBorder}>
            <View style={styles.popupHeader}>
              <View>
                <Text style={styles.popupEyebrow}>CHARACTER SELECT</Text>
                <Text style={styles.popupTitle}>함께 성장할 친구를 골라주세요</Text>
                <Text style={styles.popupSubtitle}>
                  캐릭터의 도트 원본을 그대로 보여드려요.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="펫룸 팝업 닫기"
                accessibilityRole="button"
                onPress={onClose}
                style={styles.popupCloseButton}
              >
                <Text style={styles.popupCloseText}>x</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.popupContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.popupDashedDivider} />
              <View style={styles.petLineup}>
                {popupPets.map((pet) => {
                  const isSelected = pet.id === selectedPetId;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={pet.id}
                      onPress={() => setSelectedPetId(pet.id)}
                      style={[
                        styles.petSlot,
                        isSelected ? styles.petSlotActive : null,
                      ]}
                    >
                      {isSelected ? (
                        <View style={styles.petSelectMarker} />
                      ) : null}
                      <View style={styles.petPortrait}>
                        <Image
                          accessibilityIgnoresInvertColors
                          source={pet.stages[currentStage]}
                          style={[
                            styles.petSprite,
                            {
                              height: Math.round(82 * scale),
                              width: Math.round(82 * scale),
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.petNamePlate}>
                        <Text style={styles.petName}>{pet.name}</Text>
                      </View>
                      <Text style={styles.petTypeLabel}>GROWTH TYPE</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.petConfirmQuestion}>
                {selectedPet.name}와 함께 시작할까요?
              </Text>
              <View style={styles.popupActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={onClose}
                  style={styles.popupCancelButton}
                >
                  <Text style={styles.popupCancelText}>취소</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onSelectPet(selectedPet.id)}
                  style={styles.popupConfirmButton}
                >
                  <Text style={styles.popupConfirmText}>
                    {selectedPet.name} 선택
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  popupLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 30,
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
    maxHeight: '82%',
    position: 'relative',
  },
  popupTopCap: {
    alignSelf: 'center',
    backgroundColor: '#9d6b42',
    height: 8,
    position: 'absolute',
    right: -7,
    top: 7,
    width: 8,
    zIndex: 1,
  },
  popupBottomCap: {
    backgroundColor: '#9d6b42',
    bottom: -7,
    position: 'absolute',
    right: -7,
    top: 15,
    width: 8,
    zIndex: 1,
  },
  popupOuterBorder: {
    backgroundColor: '#a3907a',
    borderColor: '#3d2d28',
    borderWidth: 3,
    padding: 8,
    position: 'relative',
    zIndex: 2,
  },
  popupCornerCutTopLeft: {
    backgroundColor: '#3d2d28',
    height: 3,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 18,
    zIndex: 4,
  },
  popupCornerCutTopRight: {
    backgroundColor: '#3d2d28',
    height: 3,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 18,
    zIndex: 4,
  },
  popupCornerCutBottomLeft: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    height: 3,
    left: 0,
    position: 'absolute',
    width: 18,
    zIndex: 4,
  },
  popupCornerCutBottomRight: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    height: 3,
    position: 'absolute',
    right: 0,
    width: 18,
    zIndex: 4,
  },
  popupInnerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: '#6b432f',
    borderWidth: 3,
    overflow: 'hidden',
  },
  popupHeader: {
    alignItems: 'flex-start',
    backgroundColor: '#fff8ea',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  popupEyebrow: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 8,
  },
  popupTitle: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  popupSubtitle: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 6,
  },
  popupCloseButton: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    marginLeft: 8,
    width: 36,
  },
  popupCloseText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  popupContent: {
    backgroundColor: '#fff8ea',
    paddingBottom: 16,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  popupDashedDivider: {
    borderColor: '#d39a5f',
    borderStyle: 'dashed',
    borderTopWidth: 2,
    marginBottom: 18,
    marginTop: 8,
  },
  petLineup: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  petSlot: {
    alignItems: 'center',
    backgroundColor: '#fff0cc',
    borderColor: '#6f4433',
    borderWidth: 2,
    flex: 1,
    minHeight: 156,
    paddingBottom: 8,
    paddingHorizontal: 6,
    paddingTop: 9,
    position: 'relative',
  },
  petSlotActive: {
    backgroundColor: '#ffe4a9',
    borderColor: '#b66533',
    borderWidth: 3,
    marginBottom: -3,
    marginTop: -2,
  },
  petSprite: {
    resizeMode: 'contain',
  },
  petSelectMarker: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 7,
    borderRightColor: 'transparent',
    borderRightWidth: 7,
    borderTopColor: '#a7552e',
    borderTopWidth: 10,
    height: 0,
    position: 'absolute',
    top: -16,
    width: 0,
  },
  petPortrait: {
    alignItems: 'center',
    backgroundColor: '#fff9ec',
    borderColor: '#d7a36d',
    borderWidth: 2,
    height: 86,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  petNamePlate: {
    alignSelf: 'stretch',
    marginTop: 10,
    minHeight: 18,
  },
  petName: {
    color: '#4b2f25',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  petTypeLabel: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 4,
    textAlign: 'center',
  },
  petConfirmQuestion: {
    color: '#b65f2f',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 17,
    textAlign: 'center',
  },
  popupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  popupCancelButton: {
    alignItems: 'center',
    backgroundColor: '#ead4ad',
    borderColor: '#6b432f',
    borderWidth: 2,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  popupConfirmButton: {
    alignItems: 'center',
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    borderWidth: 2,
    flex: 1.7,
    height: 42,
    justifyContent: 'center',
  },
  popupCancelText: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  popupConfirmText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
});

