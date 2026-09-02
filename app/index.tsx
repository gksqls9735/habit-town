import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TodayTasksModal } from '../src/features/goals/components/TodayTasksModal';
import { YearlyGoalModal } from '../src/features/goals/components/YearlyGoalModal';
import { useGoalPlanner } from '../src/features/goals/hooks/useGoalPlanner';
import { getRemainingTaskBadge } from '../src/features/goals/utils';

const roomBackgroundImage = require('../assets/rooms/basic-room-background.png');
const catBabyRollSpritesheet = require('../assets/pets/animations/cat-baby-roll-spritesheet.png');
const catBabyWalkSpritesheet = require('../assets/pets/animations/cat-baby-walk-spritesheet.png');
const pixelFontFamily = 'Galmuri11';

type RailAction = {
  badge?: string;
  image?: ImageSourcePropType;
  label: string;
  onPress?: () => void;
  symbol: string;
};

type RailMetrics = {
  buttonWidth: number;
  gap: number;
  iconSize: number;
  labelFontSize: number;
};

type GrowthStage = 'baby' | 'child' | 'teen' | 'adult';

type PetDefinition = {
  id: 'cat' | 'hamster' | 'dog';
  name: string;
  roomName: string;
  stages: Record<GrowthStage, ImageSourcePropType>;
};

type PetAnimationKind = 'idle' | 'roll' | 'walk';

type PetAnimationState = {
  direction: -1 | 1;
  frame: number;
  kind: PetAnimationKind;
};

const leftActions: RailAction[] = [
  {
    image: require('../assets/ui/today-tasks-button.png'),
    label: '오늘 할일',
    symbol: '!',
  },
  {
    image: require('../assets/ui/yearly-goals-button-v2.png'),
    label: '올해 목표',
    symbol: 'Y',
  },
  {
    image: require('../assets/ui/calendar-button.png'),
    label: '캘린더',
    symbol: 'C',
  },
  {
    image: require('../assets/ui/shop-button.png'),
    label: '상점',
    symbol: '$',
  },
];

const rightActions: RailAction[] = [
  { image: require('../assets/ui/reward-button.png'), label: '보상', symbol: 'G' },
  { image: require('../assets/ui/inventory-button.png'), label: '가방', symbol: 'I' },
];

const pets: PetDefinition[] = [
  {
    id: 'cat',
    name: '고양이',
    roomName: '고양이 방',
    stages: {
      adult: require('../assets/pets/cat-adult.png'),
      baby: require('../assets/pets/cat-baby.png'),
      child: require('../assets/pets/cat-child.png'),
      teen: require('../assets/pets/cat-teen.png'),
    },
  },
  {
    id: 'hamster',
    name: '햄스터',
    roomName: '햄스터 방',
    stages: {
      adult: require('../assets/pets/hamster-adult.png'),
      baby: require('../assets/pets/hamster-baby.png'),
      child: require('../assets/pets/hamster-child.png'),
      teen: require('../assets/pets/hamster-teen.png'),
    },
  },
  {
    id: 'dog',
    name: '강아지',
    roomName: '강아지 방',
    stages: {
      adult: require('../assets/pets/dog-adult.png'),
      baby: require('../assets/pets/dog-baby.png'),
      child: require('../assets/pets/dog-child.png'),
      teen: require('../assets/pets/dog-teen.png'),
    },
  },
];

export default function HomeScreen() {
  const [isPetRoomOpen, setIsPetRoomOpen] = useState(false);
  const [activePetId, setActivePetId] = useState<PetDefinition['id']>('cat');
  const goalPlanner = useGoalPlanner();
  const {
    addYearlyGoal,
    closeTodayTasks,
    closeYearlyGoal,
    dailyPlans,
    expandedPlanIds,
    generateAdditionalTaskForSelectedGoal,
    goalError,
    hasUsedTaskRefresh,
    isGeneratingPlan,
    isTodayTasksOpen,
    isYearlyGoalOpen,
    openTodayTasks,
    openYearlyGoal,
    openYearlyGoalFromTodayTasks,
    refreshOneIncompleteTaskForSelectedGoal,
    selectedTaskGoalId,
    setSelectedTaskGoalId,
    setYearlyGoalDraft,
    togglePlanExpanded,
    toggleTask,
    yearlyGoalDraft,
    yearlyGoals,
  } = goalPlanner;
  const { height, width } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const scale = clamp(shortestSide / 390, 0.78, 1.08);
  const compactHeight = height < 720;
  const roomScale = clamp(Math.min(width / 390, height / 844), 0.82, 1.12);
  const railMetrics: RailMetrics = {
    buttonWidth: Math.round(58 * scale),
    gap: compactHeight ? 4 : Math.round(10 * scale),
    iconSize: Math.round(42 * scale),
    labelFontSize: compactHeight ? 9 : 10,
  };
  const railTop = compactHeight ? 126 : Math.round(148 * roomScale);
  const sideInset = Math.max(6, Math.round(width * 0.02));
  const activePet = pets[0];
  const currentStage: GrowthStage = 'baby';
  const characterSize = Math.round(132 * roomScale);
  const characterBottom = compactHeight ? '15%' : '18%';
  const rightRailActions: RailAction[] = [
    ...rightActions,
    {
      image: require('../assets/ui/pet-room-button.png'),
      label: '펫룸',
      onPress: () => setIsPetRoomOpen(true),
      symbol: 'R',
    },
  ];
  const popupWidth = Math.min(width - 32, 360);
  const leftRailActions: RailAction[] = leftActions.map((action) => {
    if (action.label === '오늘 할일') {
      return {
        ...action,
        badge: getRemainingTaskBadge(dailyPlans),
        onPress: openTodayTasks,
      };
    }

    if (action.label === '올해 목표') {
      return {
        ...action,
        onPress: openYearlyGoal,
      };
    }

    return action;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.shell}>
        <View style={styles.room}>
          <ImageBackground
            accessibilityIgnoresInvertColors
            imageStyle={styles.roomBackgroundImage}
            resizeMode="cover"
            source={roomBackgroundImage}
            style={styles.roomBackground}
          >
            <View style={[styles.characterStage, { bottom: characterBottom }]}>
              <AnimatedBabyCat
                movementRange={Math.round(Math.min(width * 0.24, 104) * roomScale)}
                size={characterSize}
              />
              <View style={styles.roomNameTag}>
                <Text style={styles.roomNameText}>{activePet.roomName}</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View
          style={[
            styles.overlayBlock,
            styles.hud,
            {
              left: Math.max(8, Math.round(Math.min(width, 430) * 0.025)),
              right: Math.max(8, Math.round(Math.min(width, 430) * 0.025)),
            },
          ]}
        >
          <View style={styles.hudPanel}>
            <View style={styles.hudCornerTopLeft} />
            <View style={styles.hudCornerTopRight} />
            <View style={styles.hudCornerBottomLeft} />
            <View style={styles.hudCornerBottomRight} />
            <View style={styles.levelBadge}>
              <View style={styles.levelBadgeAccent} />
              <Text style={styles.levelLabel}>LV. 7</Text>
            </View>
            <View style={styles.expTrack}>
              <View style={styles.expFill}>
                <View style={styles.expFillHighlight} />
              </View>
            </View>
          </View>
          <CurrencyPill label="145" variant="gem" />
          <CurrencyPill label="1,390" variant="coin" />
        </View>

        <View
          style={[
            styles.leftRail,
            { gap: railMetrics.gap, left: sideInset, top: railTop },
          ]}
        >
          {leftRailActions.map((action) => (
            <RailButton action={action} key={action.label} metrics={railMetrics} />
          ))}
        </View>

        <View
          style={[
            styles.rightRail,
            { gap: railMetrics.gap, right: sideInset, top: railTop },
          ]}
        >
          {rightRailActions.map((action) => (
            <RailButton action={action} key={action.label} metrics={railMetrics} />
          ))}
        </View>

        {isPetRoomOpen ? (
          <PetRoomPopup
            activePetId={activePetId}
            currentStage={currentStage}
            onClose={() => setIsPetRoomOpen(false)}
            onSelectPet={(petId) => {
              setActivePetId(petId);
              setIsPetRoomOpen(false);
            }}
            scale={scale}
            width={popupWidth}
          />
        ) : null}

        <YearlyGoalModal
          errorMessage={goalError}
          isGenerating={isGeneratingPlan}
          onChangeDraft={setYearlyGoalDraft}
          onClose={closeYearlyGoal}
          onSave={addYearlyGoal}
          yearlyGoals={yearlyGoals}
          value={yearlyGoalDraft}
          visible={isYearlyGoalOpen}
          width={popupWidth}
        />
        <TodayTasksModal
          errorMessage={goalError}
          hasUsedTaskRefresh={hasUsedTaskRefresh}
          isGenerating={isGeneratingPlan}
          onClose={closeTodayTasks}
          onGenerate={generateAdditionalTaskForSelectedGoal}
          onOpenGoal={openYearlyGoalFromTodayTasks}
          onRefreshOneTask={refreshOneIncompleteTaskForSelectedGoal}
          onSelectGoal={setSelectedTaskGoalId}
          onTogglePlan={togglePlanExpanded}
          onToggleTask={toggleTask}
          plans={dailyPlans}
          selectedGoalId={selectedTaskGoalId}
          expandedPlanIds={expandedPlanIds}
          visible={isTodayTasksOpen}
          width={popupWidth}
          yearlyGoals={yearlyGoals}
        />
      </View>
    </SafeAreaView>
  );
}

function AnimatedBabyCat({
  movementRange,
  size,
}: {
  movementRange: number;
  size: number;
}) {
  const [animation, setAnimation] = useState<PetAnimationState>({
    direction: 1,
    frame: 0,
    kind: 'idle',
  });
  const movementX = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);

  useEffect(() => {
    let frameTimer: ReturnType<typeof setInterval> | undefined;
    let actionTimer: ReturnType<typeof setTimeout> | undefined;
    let isMounted = true;

    const clearFrameTimer = () => {
      if (frameTimer) {
        clearInterval(frameTimer);
        frameTimer = undefined;
      }
    };

    const scheduleNextAction = () => {
      const delay = randomBetween(1800, 5200);
      actionTimer = setTimeout(runAction, delay);
    };

    const runAction = () => {
      clearFrameTimer();

      const kind: Exclude<PetAnimationKind, 'idle'> =
        Math.random() > 0.46 ? 'walk' : 'roll';
      const direction: -1 | 1 = Math.random() > 0.5 ? 1 : -1;
      const distance =
        kind === 'walk'
          ? randomBetween(movementRange * 0.45, movementRange)
          : randomBetween(movementRange * 0.24, movementRange * 0.62);
      let nextX = clamp(currentX.current + distance * direction, -movementRange, movementRange);

      if (Math.abs(nextX - currentX.current) < 12) {
        nextX = clamp(currentX.current - distance * direction, -movementRange, movementRange);
      }

      setAnimation({ direction, frame: 0, kind });

      frameTimer = setInterval(() => {
        setAnimation((current) => ({
          ...current,
          frame: (current.frame + 1) % 4,
        }));
      }, kind === 'walk' ? 130 : 155);

      Animated.timing(movementX, {
        duration: kind === 'walk' ? 1120 : 1280,
        easing: Easing.inOut(Easing.quad),
        toValue: nextX,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) {
          return;
        }

        currentX.current = nextX;
        clearFrameTimer();
        setAnimation((current) => ({
          direction: current.direction,
          frame: 0,
          kind: 'idle',
        }));
        scheduleNextAction();
      });
    };

    scheduleNextAction();

    return () => {
      isMounted = false;
      clearFrameTimer();
      if (actionTimer) {
        clearTimeout(actionTimer);
      }
      movementX.stopAnimation();
    };
  }, [movementRange, movementX]);

  const frameHeight = size;
  const frameWidth = size;
  const sheetSource =
    animation.kind === 'roll' ? catBabyRollSpritesheet : catBabyWalkSpritesheet;

  return (
    <Animated.View
      style={[
        styles.animatedPetWrap,
        {
          transform: [{ translateX: movementX }],
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
      <View style={{ transform: [{ scaleX: -animation.direction }] }}>
        {animation.kind === 'idle' ? (
          <Image
            accessibilityIgnoresInvertColors
            source={pets[0].stages.baby}
            style={[
              styles.activePetSprite,
              {
                height: size,
                width: size,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.spriteViewport,
              {
                height: frameHeight,
                width: frameWidth,
              },
            ]}
          >
            <Image
              accessibilityIgnoresInvertColors
              source={sheetSource}
              style={[
                styles.petSpritesheet,
                {
                  height: frameHeight,
                  transform: [{ translateX: -animation.frame * frameWidth }],
                  width: frameWidth * 4,
                },
              ]}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}


function CurrencyPill({
  label,
  variant,
}: {
  label: string;
  variant: 'coin' | 'gem';
}) {
  return (
    <View style={styles.currencyPill}>
      <PixelCurrencyIcon variant={variant} />
      <Text style={styles.currencyText}>{label}</Text>
    </View>
  );
}

function PixelCurrencyIcon({ variant }: { variant: 'coin' | 'gem' }) {
  if (variant === 'gem') {
    return (
      <View style={styles.gemIcon}>
        <View style={styles.gemTop} />
        <View style={styles.gemMiddle} />
        <View style={styles.gemBottom} />
      </View>
    );
  }

  return (
    <View style={styles.coinIcon}>
      <View style={styles.coinHighlight} />
      <View style={styles.coinCore} />
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
        style={[
          styles.railLabel,
          {
            fontSize: metrics.labelFontSize,
            maxWidth: metrics.buttonWidth,
          },
        ]}
        numberOfLines={1}
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

function PetRoomPopup({
  activePetId,
  currentStage,
  onClose,
  onSelectPet,
  scale,
  width,
}: {
  activePetId: PetDefinition['id'];
  currentStage: GrowthStage;
  onClose: () => void;
  onSelectPet: (petId: PetDefinition['id']) => void;
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
  screen: {
    backgroundColor: '#eef5ef',
    flex: 1,
  },
  shell: {
    flex: 1,
    marginHorizontal: 'auto',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  overlayBlock: {
    zIndex: 10,
  },
  hud: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minHeight: 42,
    position: 'absolute',
    top: 8,
  },
  hudPanel: {
    alignItems: 'center',
    backgroundColor: '#a3907a',
    borderColor: '#3d2d28',
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    flexShrink: 1,
    height: 36,
    minWidth: 0,
    padding: 4,
    position: 'relative',
  },
  hudCornerTopLeft: {
    backgroundColor: '#3d2d28',
    height: 2,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 12,
  },
  hudCornerTopRight: {
    backgroundColor: '#3d2d28',
    height: 2,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
  },
  hudCornerBottomLeft: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    height: 2,
    left: 0,
    position: 'absolute',
    width: 12,
  },
  hudCornerBottomRight: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    height: 2,
    position: 'absolute',
    right: 0,
    width: 12,
  },
  levelBadge: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    borderColor: '#6b432f',
    borderWidth: 2,
    flexShrink: 0,
    height: 28,
    justifyContent: 'center',
    minWidth: 56,
    position: 'relative',
  },
  levelBadgeAccent: {
    backgroundColor: '#f3d1a5',
    bottom: 2,
    height: 3,
    left: 3,
    position: 'absolute',
    right: 3,
  },
  levelLabel: {
    color: '#4f2f26',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  expTrack: {
    backgroundColor: '#fff8ea',
    borderColor: '#6b432f',
    borderLeftWidth: 0,
    borderWidth: 2,
    flex: 1,
    flexShrink: 1,
    height: 28,
    minWidth: 48,
    overflow: 'hidden',
    padding: 3,
  },
  expFill: {
    backgroundColor: '#d7a36d',
    height: '100%',
    position: 'relative',
    width: '68%',
  },
  expFillHighlight: {
    backgroundColor: '#f6c474',
    height: 3,
    left: 2,
    position: 'absolute',
    right: 2,
    top: 2,
  },
  currencyPill: {
    alignItems: 'center',
    backgroundColor: '#a3907a',
    borderColor: '#3d2d28',
    borderWidth: 2,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    height: 36,
    justifyContent: 'center',
    minWidth: 64,
    paddingHorizontal: 5,
  },
  gemIcon: {
    alignItems: 'center',
    height: 17,
    justifyContent: 'center',
    width: 17,
  },
  gemTop: {
    backgroundColor: '#f3fbff',
    height: 3,
    width: 7,
  },
  gemMiddle: {
    backgroundColor: '#8fd0e8',
    borderColor: '#5f8fa3',
    borderWidth: 2,
    height: 9,
    width: 15,
  },
  gemBottom: {
    backgroundColor: '#66aec8',
    height: 5,
    width: 7,
  },
  coinIcon: {
    alignItems: 'center',
    backgroundColor: '#f6c474',
    borderColor: '#8f5e33',
    borderWidth: 2,
    height: 17,
    justifyContent: 'center',
    position: 'relative',
    width: 17,
  },
  coinHighlight: {
    backgroundColor: '#ffe2a7',
    height: 3,
    left: 3,
    position: 'absolute',
    top: 3,
    width: 4,
  },
  coinCore: {
    backgroundColor: '#b36b31',
    height: 7,
    width: 7,
  },
  currencyText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  room: {
    backgroundColor: '#f2dfbd',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  roomBackground: {
    flex: 1,
  },
  roomBackgroundImage: {
    height: '100%',
    width: '100%',
  },
  characterStage: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  animatedPetWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  characterShadow: {
    backgroundColor: '#73504b',
    height: 18,
    opacity: 0.26,
    position: 'absolute',
  },
  activePetSprite: {
    resizeMode: 'contain',
  },
  spriteViewport: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  petSpritesheet: {
    resizeMode: 'stretch',
  },
  roomNameTag: {
    alignItems: 'center',
    backgroundColor: '#fff2d8',
    borderColor: '#76503d',
    borderWidth: 3,
    marginTop: -8,
    minWidth: 86,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roomNameText: {
    color: '#5e4235',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  leftRail: {
    position: 'absolute',
    zIndex: 5,
  },
  rightRail: {
    position: 'absolute',
    zIndex: 5,
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
  generatedRailIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatedRailImage: {
    height: '140%',
    resizeMode: 'contain',
    width: '140%',
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
