import { useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TodayTasksModal } from '../../features/goals/components/TodayTasksModal';
import { YearlyGoalModal } from '../../features/goals/components/YearlyGoalModal';
import { useGoalPlanner } from '../../features/goals/hooks/useGoalPlanner';
import { getRemainingTaskBadge } from '../../features/goals/utils';
import { CalendarModal } from '../../features/calendar/components/CalendarModal';
import { InventoryModal } from '../../features/inventory/components/InventoryModal';
import { PetCareActions, PetStatusHud } from './components/PetCareOverlay';
import { HomeActionRail } from './components/HomeActionRail';
import { LocalDevControls } from './components/LocalDevControls';
import { PetRoomPopup } from './components/PetRoomPopup';
import { StaticPet } from './components/StaticPet';
import { leftActions, pets, rightActions } from './homeData';
import { clamp, isLocalhostDevWeb } from './homeUtils';
import { GrowthStage, PetDefinition, RailAction, RailMetrics } from './types';

const roomBackgroundImage = require('../../../assets/rooms/basic-room-background.png');
const pixelFontFamily = 'Galmuri11';
/*
 * Animation assets are temporarily disabled. Keep these requires here so the
 * pet animations can be restored without hunting down asset paths later.
 *
 * const catBabyRollFrames = [
 *   require('../../../assets/pets/animations/applied/cat/roll/cat-baby-roll-frame-0.png'),
 *   require('../../../assets/pets/animations/applied/cat/roll/cat-baby-roll-frame-1.png'),
 *   require('../../../assets/pets/animations/applied/cat/roll/cat-baby-roll-frame-2.png'),
 *   require('../../../assets/pets/animations/applied/cat/roll/cat-baby-roll-frame-3.png'),
 * ];
 * const hamsterBabyRollSpritesheet = require(
 *   '../../../assets/pets/animations/applied/hamster/roll/hamster-baby-roll-spritesheet.png',
 * );
 * const catBabyWalkSpritesheet = require(
 *   '../../../assets/pets/animations/applied/cat/walk/cat-baby-walk-spritesheet.png',
 * );
 * const hamsterBabyWalkSpritesheet = require(
 *   '../../../assets/pets/animations/clean/hamster-baby-walk-spritesheet.png',
 * );
 * const dogBabyWalkSpritesheet = require(
 *   '../../../assets/pets/animations/clean/dog-baby-walk-spritesheet.png',
 * );
 */

/*
type PetAnimationKind = 'idle' | 'roll' | 'walk';

type PetAnimationState = {
  direction: -1 | 1;
  frame: number;
  kind: PetAnimationKind;
};
*/

export function HomeScreen() {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isPetRoomOpen, setIsPetRoomOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLocalDevMenuOpen, setIsLocalDevMenuOpen] = useState(false);
  const [activePetId, setActivePetId] = useState<PetDefinition['id']>('hamster');
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
    rewardProgress,
    selectedTaskGoalId,
    setSelectedTaskGoalId,
    setYearlyGoalDifficulty,
    setYearlyGoalDraft,
    togglePlanExpanded,
    toggleTask,
    yearlyGoalDraft,
    yearlyGoalDifficulty,
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
  const activePet = pets.find((pet) => pet.id === activePetId) ?? pets[0];
  const currentStage = rewardProgress.stage;
  const characterSize = Math.round(132 * roomScale);
  const characterBottom = Math.max(100, Math.round(height * (compactHeight ? 0.15 : 0.18)));
  const showLocalDevButton = isLocalhostDevWeb();
  const rightRailActions: RailAction[] = [
    ...rightActions.map((action) =>
      action.label === '가방'
        ? { ...action, onPress: () => setIsInventoryOpen(true) }
        : action,
    ),
    {
      image: require('../../../assets/ui/pet-room-button.png'),
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

    if (action.label === '캘린더') {
      return { ...action, onPress: () => setIsCalendarOpen(true) };
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
              <StaticPet
                pet={activePet}
                stage={currentStage}
                size={characterSize}
              />
              <View style={styles.roomNameTag}>
                <Text style={styles.roomNameText}>{activePet.roomName}</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <PetStatusHud
          petImage={activePet.stages[currentStage]}
          petName={activePet.name}
          progress={rewardProgress}
        />
        <PetCareActions />

        {showLocalDevButton ? (
          <LocalDevControls
            isOpen={isLocalDevMenuOpen}
            onToggle={() => setIsLocalDevMenuOpen((current) => !current)}
          />
        ) : null}

        <HomeActionRail
          actions={leftRailActions}
          metrics={railMetrics}
          style={{ gap: railMetrics.gap, left: sideInset, top: railTop }}
        />

        <HomeActionRail
          actions={rightRailActions}
          metrics={railMetrics}
          style={{ gap: railMetrics.gap, right: sideInset, top: railTop }}
        />

        {isPetRoomOpen ? (
          <PetRoomPopup
            activePetId={activePetId}
            currentStage={currentStage}
            onClose={() => setIsPetRoomOpen(false)}
            onSelectPet={(petId) => {
              setActivePetId(petId);
              setIsPetRoomOpen(false);
            }}
            pets={pets}
            scale={scale}
            width={popupWidth}
          />
        ) : null}

        <InventoryModal
          onClose={() => setIsInventoryOpen(false)}
          visible={isInventoryOpen}
          width={popupWidth}
        />

        {isCalendarOpen ? <CalendarModal
          onClose={() => setIsCalendarOpen(false)}
          plans={dailyPlans}
          onToggleTask={toggleTask}
          isLoading={goalPlanner.isLoadingGoalData}
          isBusy={isGeneratingPlan}
          errorMessage={goalError}
        /> : null}
        <YearlyGoalModal
          difficulty={yearlyGoalDifficulty}
          errorMessage={goalError}
          isGenerating={isGeneratingPlan}
          onChangeDifficulty={setYearlyGoalDifficulty}
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

/*
function AnimatedPet({
  movementRange,
  pet,
  stage,
  size,
}: {
  movementRange: number;
  pet: PetDefinition;
  stage: GrowthStage;
  size: number;
}) {
  const [animation, setAnimation] = useState<PetAnimationState>({
    direction: 1,
    frame: 0,
    kind: 'idle',
  });
  const movementX = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);
  const canUseBabyCatAnimation = pet.id === 'cat' && stage === 'baby';
  const canUseBabyHamsterAnimation = pet.id === 'hamster' && stage === 'baby';
  const canUseBabyDogAnimation = pet.id === 'dog' && stage === 'baby';
  const canUseRollAnimation = canUseBabyCatAnimation || canUseBabyHamsterAnimation;
  const canUseWalkAnimation =
    canUseBabyCatAnimation || canUseBabyHamsterAnimation || canUseBabyDogAnimation;

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
        canUseRollAnimation && Math.random() <= 0.46 ? 'roll' : 'walk';
      const requestedDirection: -1 | 1 = Math.random() > 0.5 ? 1 : -1;
      const distance =
        kind === 'walk'
          ? randomBetween(movementRange * 0.45, movementRange)
          : randomBetween(movementRange * 0.24, movementRange * 0.62);
      let nextX = clamp(
        currentX.current + distance * requestedDirection,
        -movementRange,
        movementRange,
      );

      if (Math.abs(nextX - currentX.current) < 12) {
        nextX = clamp(
          currentX.current - distance * requestedDirection,
          -movementRange,
          movementRange,
        );
      }

      const movementDelta = nextX - currentX.current;
      const direction: -1 | 1 = movementDelta >= 0 ? 1 : -1;

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
  }, [
    canUseBabyCatAnimation,
    canUseBabyDogAnimation,
    canUseRollAnimation,
    canUseWalkAnimation,
    movementRange,
    movementX,
    pet.id,
    stage,
  ]);

  const petSource = pet.stages[stage];
  const frameHeight = size;
  const frameWidth = size;
  const rollFrameScales = canUseBabyHamsterAnimation
    ? [1, 1, 1, 1]
    : [1.06, 1.1, 1.18, 1.1];
  const rollFrameScale =
    animation.kind === 'roll' ? rollFrameScales[animation.frame] : 1;
  const rollFrameSize = Math.round(size * rollFrameScale);
  const maxFrameSize = Math.round(size * Math.max(...rollFrameScales));
  const rollFrameSource = catBabyRollFrames[animation.frame];
  const walkSheetSource = canUseBabyDogAnimation
    ? dogBabyWalkSpritesheet
    : canUseBabyHamsterAnimation
      ? hamsterBabyWalkSpritesheet
      : catBabyWalkSpritesheet;

  return (
    <Animated.View
      style={[
        styles.animatedPetWrap,
        {
          transform: [{ translateX: movementX }],
          height: maxFrameSize,
          width: maxFrameSize,
        },
      ]}
    >
      <View
        style={[
          styles.characterShadow,
          {
            top: Math.round(maxFrameSize * 0.76),
            width: Math.round(frameWidth * 0.9),
          },
        ]}
      />
      <View
        style={[
          styles.petFrameAnchor,
          { transform: [{ scaleX: -animation.direction }] },
        ]}
      >
        {animation.kind === 'idle' ||
        (animation.kind === 'roll' && !canUseRollAnimation) ||
        (animation.kind === 'walk' && !canUseWalkAnimation) ? (
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
        ) : animation.kind === 'roll' && canUseBabyHamsterAnimation ? (
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
              source={hamsterBabyRollSpritesheet}
              style={[
                styles.petSpritesheet,
                pixelatedImageStyle,
                {
                  height: frameHeight,
                  transform: [{ translateX: -animation.frame * frameWidth }],
                  width: frameWidth * 4,
                },
              ]}
            />
          </View>
        ) : animation.kind === 'roll' ? (
          <Image
            accessibilityIgnoresInvertColors
            source={rollFrameSource}
            style={[
              styles.activePetSprite,
              pixelatedImageStyle,
              {
                height: rollFrameSize,
                width: rollFrameSize,
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
              source={walkSheetSource}
              style={[
                styles.petSpritesheet,
                pixelatedImageStyle,
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
*/

/*
function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
*/


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
});



