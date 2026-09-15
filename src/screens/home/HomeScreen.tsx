import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  Pressable,
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
import { useI18n } from '../../features/i18n';
import { InventoryModal } from '../../features/inventory/components/InventoryModal';
import {
  consumeInventoryItem,
  increaseInventoryCapacity,
  loadInventoryCapacity,
  loadInventoryItems,
  resetInventory,
  saveInventoryItem,
} from '../../features/inventory/inventoryRepository';
import {
  initialInventorySlotCount,
  inventoryExpansionSlotCount,
  type InventoryItem,
} from '../../features/inventory/types';
import { getItemImage } from '../../features/items/itemImages';
import { getItemCareEffect, getItemShopCategory } from '../../features/items/itemCatalog';
import {
  loadPetName,
  loadPetRoomName,
  savePetName,
  savePetRoomName,
} from '../../features/pets/petProfileRepository';
import {
  DeliveryEventReason,
  drawDeliveryMessage,
} from '../../features/rewards/deliveryMessages';
import { DeliveryReward, drawDeliveryReward } from '../../features/rewards/eventRewards';
import {
  consumeGiftBox,
  increaseGiftBoxCount,
  loadGiftBoxCount,
} from '../../features/rewards/giftBoxRepository';
import { experiencePerGrowthStage, growthStages } from '../../features/rewards/rewardSystem';
import type { CareMeterKey } from '../../features/rewards/rewardSystem';
import {
  loadDecorPlacements,
  saveDecorPlacement,
} from '../../features/room/decorPlacementRepository';
import { ShopModal } from '../../features/shop/components/ShopModal';
import type { InventoryCapacityShopItem, ShopItem, ShopUpgradeId } from '../../features/shop/items';
import {
  CareItemUsePopup,
  type CareUsableItem,
} from './components/CareItemUsePopup';
import { DeliveryRewardPopup } from './components/DeliveryRewardPopup';
import { EventPopup } from './components/EventPopup';
import { GiftRewardPopup } from './components/GiftRewardPopup';
import {
  PetCareActions,
  PetStatusHud,
} from './components/PetCareOverlay';
import { HomeActionRail } from './components/HomeActionRail';
import { LocalDevControls } from './components/LocalDevControls';
import { PetRoomPopup } from './components/PetRoomPopup';
import { PetSettingsPopup } from './components/PetSettingsPopup';
import { PetStatusPopup } from './components/PetStatusPopup';
import { RewardDeliveryEvent } from './components/RewardDeliveryEvent';
import { StaticPet } from './components/StaticPet';
import { leftActions, pets, rightActions } from './homeData';
import { clamp, isLocalhostDevWeb } from './homeUtils';
import { GrowthStage, PetDefinition, RailAction, RailMetrics } from './types';

const roomWallpaperImage = require('../../../assets/png/backgrounds/basic-room-wallpaper.png');
const roomFloorImage = require('../../../assets/png/backgrounds/basic-room-floor.png');
const pixelFontFamily = 'Galmuri11';
const localDevCurrencyGrantAmount = 1000;
const localDevExperienceGrantAmount = 10;
const maxInventoryCapacityPurchases = 3;

type RoomBackgroundImages = {
  floor: ImageSourcePropType;
  wallpaper: ImageSourcePropType;
};

type PetNameMap = Partial<Record<PetDefinition['id'], string>>;
type PetRoomNameMap = Partial<Record<PetDefinition['id'], string>>;

type PlacedDecorItem = {
  item: InventoryItem;
  x: number;
  y: number;
};

function getGrowthStageIndex(stage: GrowthStage) {
  return growthStages.indexOf(stage);
}

function getCareUsableItems(
  items: readonly InventoryItem[],
  meter: CareMeterKey,
): CareUsableItem[] {
  return items.flatMap((item) => {
    const careEffect = getItemCareEffect(item.id);

    return careEffect && careEffect.meter === meter && item.quantity > 0
      ? [{ ...item, careEffect }]
      : [];
  });
}
/*
 * Animation assets are temporarily disabled. Keep these requires here so the
 * pet animations can be restored without hunting down asset paths later.
 *
 * const catBabyRollFrames = [
 *   require('../../../assets/png/animals/animations/applied/cat/roll/cat-baby-roll-frame-0.png'),
 *   require('../../../assets/png/animals/animations/applied/cat/roll/cat-baby-roll-frame-1.png'),
 *   require('../../../assets/png/animals/animations/applied/cat/roll/cat-baby-roll-frame-2.png'),
 *   require('../../../assets/png/animals/animations/applied/cat/roll/cat-baby-roll-frame-3.png'),
 * ];
 * const hamsterBabyRollSpritesheet = require(
 *   '../../../assets/png/animals/animations/applied/hamster/roll/hamster-baby-roll-spritesheet.png',
 * );
 * const catBabyWalkSpritesheet = require(
 *   '../../../assets/png/animals/animations/applied/cat/walk/cat-baby-walk-spritesheet.png',
 * );
 * const hamsterBabyWalkSpritesheet = require(
 *   '../../../assets/png/animals/animations/clean/hamster-baby-walk-spritesheet.png',
 * );
 * const dogBabyWalkSpritesheet = require(
 *   '../../../assets/png/animals/animations/clean/dog-baby-walk-spritesheet.png',
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
  const [isPetStatusOpen, setIsPetStatusOpen] = useState(false);
  const [isPetSettingsOpen, setIsPetSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isGiftRewardOpen, setIsGiftRewardOpen] = useState(false);
  const [isClaimingGiftReward, setIsClaimingGiftReward] = useState(false);
  const [giftBoxCount, setGiftBoxCount] = useState(0);
  const [giftReward, setGiftReward] = useState<DeliveryReward | null>(null);
  const [giftRewardError, setGiftRewardError] = useState('');
  const [ownedShopItemIds, setOwnedShopItemIds] = useState<string[]>([]);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isLocalDevMenuOpen, setIsLocalDevMenuOpen] = useState(false);
  const [rewardDeliveryEventKey, setRewardDeliveryEventKey] = useState(0);
  const [isRewardParcelAvailable, setIsRewardParcelAvailable] = useState(false);
  const [deliveryReward, setDeliveryReward] = useState<DeliveryReward | null>(null);
  const [deliveryRewardMessage, setDeliveryRewardMessage] = useState('');
  const [deliveryEventReason, setDeliveryEventReason] = useState<DeliveryEventReason>('manual');
  const [isDeliveryRewardPopupOpen, setIsDeliveryRewardPopupOpen] = useState(false);
  const [isClaimingDeliveryReward, setIsClaimingDeliveryReward] = useState(false);
  const [deliveryRewardError, setDeliveryRewardError] = useState('');
  const [activePetId, setActivePetId] = useState<PetDefinition['id']>('hamster');
  const [customPetNames, setCustomPetNames] = useState<PetNameMap>({});
  const [customPetRoomNames, setCustomPetRoomNames] = useState<PetRoomNameMap>({});
  const [inventoryRefreshVersion, setInventoryRefreshVersion] = useState(0);
  const [capacityPurchaseCounts, setCapacityPurchaseCounts] = useState<Record<ShopUpgradeId, number>>({
    'decor-inventory-expansion': 0,
    'inventory-expansion': 0,
  });
  const [isSavingPetName, setIsSavingPetName] = useState(false);
  const [petStatusError, setPetStatusError] = useState('');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [activeCareMeter, setActiveCareMeter] = useState<CareMeterKey | null>(null);
  const [careUsableItems, setCareUsableItems] = useState<CareUsableItem[]>([]);
  const [careItemError, setCareItemError] = useState('');
  const [isUsingCareItem, setIsUsingCareItem] = useState(false);
  const [placementItem, setPlacementItem] = useState<InventoryItem | null>(null);
  const [placedDecorItems, setPlacedDecorItems] = useState<Record<string, PlacedDecorItem>>({});
  const [roomLayout, setRoomLayout] = useState({ height: 0, width: 0 });
  const [roomBackgroundImages, setRoomBackgroundImages] = useState<RoomBackgroundImages>({
    floor: roomFloorImage,
    wallpaper: roomWallpaperImage,
  });
  const { language, setLanguage, t } = useI18n();
  const goalPlanner = useGoalPlanner();
  const {
    abandonYearlyGoal,
    addYearlyGoal,
    careMeters,
    closeTodayTasks,
    closeYearlyGoal,
    dailyPlans,
    fillCareMeter,
    grantCurrencyReward,
    grantExperienceReward,
    generateAdditionalTaskForSelectedGoal,
    generateBasicTasksForSelectedGoal,
    goalError,
    hasUsedTaskRefresh,
    isGeneratingPlan,
    isLoadingGoalData,
    isTodayTasksOpen,
    isYearlyGoalOpen,
    openTodayTasks,
    openYearlyGoal,
    openYearlyGoalFromTodayTasks,
    refreshOneIncompleteTaskForSelectedGoal,
    resetPetStatus,
    rewardProgress,
    selectedTaskGoalId,
    setSelectedTaskGoalId,
    setYearlyGoalDifficulty,
    setYearlyGoalDraft,
    spendCurrencyReward,
    toggleTask,
    yearlyGoalDraft,
    yearlyGoalDifficulty,
    yearlyGoals,
    activeYearlyGoals,
    activeDailyPlans,
    toggleYearlyGoalCompletion,
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
  const activePetDefaultName = t(`pet.${activePet.id}.name`, undefined, activePet.name);
  const activePetDefaultRoomName = t(`pet.${activePet.id}.room`, undefined, activePet.roomName);
  const activePetDisplayName = customPetNames[activePet.id] ?? activePetDefaultName;
  const activePetRoomName = customPetRoomNames[activePet.id] ?? activePetDefaultRoomName;
  const currentStage = rewardProgress.stage;
  const previousGrowthStageRef = useRef<GrowthStage | null>(null);
  const characterSize = Math.round(132 * roomScale);
  const characterBottom = Math.max(100, Math.round(height * (compactHeight ? 0.15 : 0.18)));
  const showLocalDevButton = isLocalhostDevWeb();
  const openGiftRewardPopup = () => {
    setGiftReward(null);
    setGiftRewardError('');
    setIsGiftRewardOpen(true);
  };
  const sendGiftReward = async () => {
    try {
      const nextGiftBoxCount = await increaseGiftBoxCount();
      setGiftBoxCount(nextGiftBoxCount);
      openGiftRewardPopup();
    } catch {
      setGiftRewardError(t('home.error.giftSend'));
      setIsGiftRewardOpen(true);
    }
  };
  const refreshCapacityPurchaseCounts = useCallback(async () => {
    const [generalCapacity, decorCapacity] = await Promise.all([
      loadInventoryCapacity('general'),
      loadInventoryCapacity('decor'),
    ]);

    setCapacityPurchaseCounts({
      'decor-inventory-expansion': getCapacityPurchaseCount(decorCapacity),
      'inventory-expansion': getCapacityPurchaseCount(generalCapacity),
    });
  }, []);
  const rightRailActions: RailAction[] = [
    ...rightActions.map((action) => {
      const translatedAction = { ...action, label: t(`home.action.${action.id}`, undefined, action.label) };

      if (action.id === 'gift') {
        return {
          ...translatedAction,
          badge: giftBoxCount > 0 ? String(giftBoxCount) : undefined,
          onPress: openGiftRewardPopup,
        };
      }

      if (action.id === 'inventory') {
        return { ...translatedAction, onPress: () => setIsInventoryOpen(true) };
      }

      return translatedAction;
    }),
    {
      id: 'petRoom',
      image: require('../../../assets/ui/pet-room-button.png'),
      label: t('home.action.petRoom'),
      onPress: () => setIsPetRoomOpen(true),
      symbol: 'R',
    },
    {
      id: 'event',
      image: require('../../../assets/ui/event-button.png'),
      label: t('home.action.event'),
      onPress: () => setIsEventOpen(true),
      symbol: 'E',
    },
  ];
  const popupWidth = Math.min(width - 32, 360);
  const leftRailActions: RailAction[] = leftActions.map((action) => {
    const translatedAction = { ...action, label: t(`home.action.${action.id}`, undefined, action.label) };

    if (action.id === 'todayTasks') {
      return {
        ...translatedAction,
        badge: getRemainingTaskBadge(activeDailyPlans),
        onPress: openTodayTasks,
      };
    }

    if (action.id === 'yearlyGoal') {
      return {
        ...translatedAction,
        onPress: openYearlyGoal,
      };
    }

    if (action.id === 'calendar') {
      return { ...translatedAction, onPress: () => setIsCalendarOpen(true) };
    }

    if (action.id === 'shop') {
      return {
        ...translatedAction,
        onPress: () => {
          setIsShopOpen(true);
          void Promise.all([
            loadInventoryItems().then((items) => setOwnedShopItemIds(items.map((item) => item.id))),
            refreshCapacityPurchaseCounts(),
          ]);
        },
      };
    }

    return translatedAction;
  });
  const startRewardDelivery = useCallback((reason: DeliveryEventReason = 'manual') => {
    setDeliveryReward(null);
    setDeliveryRewardMessage('');
    setDeliveryEventReason(reason);
    setDeliveryRewardError('');
    setIsDeliveryRewardPopupOpen(false);
    setIsRewardParcelAvailable(true);
    setRewardDeliveryEventKey((current) => current + 1);
  }, []);
  const refreshRoomBackgroundImages = useCallback(() => {
    void Promise.all([loadInventoryItems(), loadDecorPlacements()]).then(([items, placements]) => {
      const equippedWallpaper = items.find(
        (item) => item.equipped && getItemShopCategory(item.id) === 'wallpaper',
      );
      const equippedFlooring = items.find(
        (item) => item.equipped && getItemShopCategory(item.id) === 'flooring',
      );

      setRoomBackgroundImages({
        floor: equippedFlooring ? getItemImage(equippedFlooring.id) ?? roomFloorImage : roomFloorImage,
        wallpaper: equippedWallpaper
          ? getItemImage(equippedWallpaper.id) ?? roomWallpaperImage
          : roomWallpaperImage,
      });
      setPlacedDecorItems(Object.fromEntries(
        placements
          .map((placement) => {
            const item = items.find((candidate) => candidate.id === placement.itemId);

            return item ? [item.id, { item, x: placement.x, y: placement.y }] : null;
          })
          .filter((entry): entry is [string, PlacedDecorItem] => entry !== null),
      ));
    });
  }, []);
  useEffect(() => {
    refreshRoomBackgroundImages();
  }, [refreshRoomBackgroundImages]);

  useEffect(() => {
    void refreshCapacityPurchaseCounts();
  }, [refreshCapacityPurchaseCounts]);

  useEffect(() => {
    void loadGiftBoxCount().then(setGiftBoxCount).catch(() => {
      setGiftRewardError(t('home.error.giftLoad'));
    });
  }, [t]);

  useEffect(() => {
    void Promise.all(
      pets.map(async (pet) => {
        const [petName, roomName] = await Promise.all([
          loadPetName(pet.id),
          loadPetRoomName(pet.id),
        ]);

        return [pet.id, petName, roomName] as const;
      }),
    ).then((entries) => {
      setCustomPetNames(Object.fromEntries(
        entries
          .filter((entry): entry is readonly [PetDefinition['id'], string, string | null] => Boolean(entry[1]))
          .map(([petId, petName]) => [petId, petName]),
      ) as PetNameMap);
      setCustomPetRoomNames(Object.fromEntries(
        entries
          .filter((entry): entry is readonly [PetDefinition['id'], string | null, string] => Boolean(entry[2]))
          .map(([petId, , roomName]) => [petId, roomName]),
      ) as PetRoomNameMap);
    }).catch(() => {
      setPetStatusError(t('home.error.profileLoad'));
    });
  }, [t]);

  useEffect(() => {
    if (isLoadingGoalData) {
      return;
    }

    const previousStage = previousGrowthStageRef.current;

    if (previousStage === null) {
      previousGrowthStageRef.current = currentStage;
      return;
    }

    previousGrowthStageRef.current = currentStage;

    if (getGrowthStageIndex(currentStage) > getGrowthStageIndex(previousStage)) {
      startRewardDelivery('growth');
    }
  }, [currentStage, isLoadingGoalData, startRewardDelivery]);
  const handleLocalDevAction = (label: string) => {
    if (label === 'event:parcel') {
      startRewardDelivery();
      return;
    }

    if (label === 'event:gift') {
      void sendGiftReward();
      return;
    }

    if (label === 'data:currency') {
      grantCurrencyReward(localDevCurrencyGrantAmount);
      return;
    }

    if (label === 'data:growth') {
      grantExperienceReward(localDevExperienceGrantAmount);
      return;
    }

    if (label === 'data:growthFull') {
      grantExperienceReward(experiencePerGrowthStage);
      return;
    }

    if (label === 'reset') {
      resetPetStatus();
      void resetInventory().then(() => {
        setCapacityPurchaseCounts({
          'decor-inventory-expansion': 0,
          'inventory-expansion': 0,
        });
        setInventoryRefreshVersion((version) => version + 1);
        void refreshRoomBackgroundImages();
      });
    }
  };
  const closeDeliveryReward = () => {
    if (isClaimingDeliveryReward) return;
    setIsDeliveryRewardPopupOpen(false);
  };
  const discardDeliveryReward = () => {
    if (isClaimingDeliveryReward) return;
    setDeliveryReward(null);
    setDeliveryRewardMessage('');
    setDeliveryRewardError('');
    setIsDeliveryRewardPopupOpen(false);
    setIsRewardParcelAvailable(false);
  };
  const openDeliveryReward = () => {
    setDeliveryReward((current) => current ?? drawDeliveryReward());
    setDeliveryRewardMessage((current) => current || drawDeliveryMessage(deliveryEventReason, t));
    setDeliveryRewardError('');
    setIsDeliveryRewardPopupOpen(true);
  };
  const acceptDeliveryReward = async () => {
    if (!deliveryReward || isClaimingDeliveryReward) return;

    setIsClaimingDeliveryReward(true);
    setDeliveryRewardError('');

    try {
      if (deliveryReward.kind === 'currency') {
        grantCurrencyReward(deliveryReward.amount);
      } else {
        await saveInventoryItem(deliveryReward.item);
        setInventoryRefreshVersion((version) => version + 1);
      }

      setDeliveryReward(null);
      setDeliveryRewardMessage('');
      setIsDeliveryRewardPopupOpen(false);
      setIsRewardParcelAvailable(false);
    } catch {
      setDeliveryRewardError(t('home.error.deliverySave'));
    } finally {
      setIsClaimingDeliveryReward(false);
    }
  };
  const closeGiftReward = () => {
    if (isClaimingGiftReward) return;

    setGiftReward(null);
    setGiftRewardError('');
    setIsGiftRewardOpen(false);
  };
  const openGiftBox = async () => {
    if (giftBoxCount <= 0 || isClaimingGiftReward) return;

    let didConsumeGiftBox = false;
    setIsClaimingGiftReward(true);
    setGiftRewardError('');

    try {
      const nextGiftBoxCount = await consumeGiftBox();

      if (nextGiftBoxCount === null) {
        setGiftBoxCount(0);
        setGiftRewardError(t('home.error.giftMissing'));
        return;
      }

      didConsumeGiftBox = true;
      setGiftBoxCount(nextGiftBoxCount);

      const reward = drawDeliveryReward();

      if (reward.kind === 'currency') {
        grantCurrencyReward(reward.amount);
      } else {
        await saveInventoryItem(reward.item);
      }

      setGiftReward(reward);
    } catch {
      if (didConsumeGiftBox) {
        try {
          const restoredGiftBoxCount = await increaseGiftBoxCount();
          setGiftBoxCount(restoredGiftBoxCount);
        } catch {
          // Keep the visible error below when the rollback persistence also fails.
        }
      }

      setGiftRewardError(t('home.error.giftOpen'));
    } finally {
      setIsClaimingGiftReward(false);
    }
  };
  const closePetStatus = () => {
    if (isSavingPetName) return;

    setPetStatusError('');
    setIsPetSettingsOpen(false);
    setIsPetStatusOpen(false);
  };
  const updateActivePetProfile = async (name: string, roomName: string) => {
    const normalizedName = name.trim();
    const normalizedRoomName = roomName.trim();

    if (!normalizedName) {
      setPetStatusError(t('home.error.nameRequired'));
      return;
    }

    if (!normalizedRoomName) {
      setPetStatusError(t('home.error.roomNameRequired'));
      return;
    }

    setIsSavingPetName(true);
    setPetStatusError('');

    try {
      const [savedName, savedRoomName] = await Promise.all([
        savePetName(activePet.id, normalizedName),
        savePetRoomName(activePet.id, normalizedRoomName),
      ]);

      setCustomPetNames((current) => ({ ...current, [activePet.id]: savedName }));
      setCustomPetRoomNames((current) => ({ ...current, [activePet.id]: savedRoomName }));
      setIsPetStatusOpen(false);
    } catch {
      setPetStatusError(t('home.error.profileSave'));
    } finally {
      setIsSavingPetName(false);
    }
  };
  const openCareItemPopup = async (meter: CareMeterKey) => {
    setActiveCareMeter(meter);
    setCareItemError('');

    try {
      const items = await loadInventoryItems();
      setCareUsableItems(getCareUsableItems(items, meter));
    } catch {
      setCareUsableItems([]);
      setCareItemError(t('home.error.careLoad'));
    }
  };
  const closeCareItemPopup = () => {
    if (isUsingCareItem) return;

    setActiveCareMeter(null);
    setCareUsableItems([]);
    setCareItemError('');
  };
  const useCareItem = async (item: CareUsableItem, quantity: number) => {
    if (isUsingCareItem) return;

    setIsUsingCareItem(true);
    setCareItemError('');

    try {
      const consumed = await consumeInventoryItem(item.id, quantity);

      if (!consumed) {
        setCareItemError(t('home.error.careQuantity'));
        return;
      }

      fillCareMeter(item.careEffect.meter, item.careEffect.increase * quantity);
      setActiveCareMeter(null);
      setCareUsableItems([]);
    } catch {
      setCareItemError(t('home.error.careUse'));
    } finally {
      setIsUsingCareItem(false);
    }
  };
  const purchaseShopItem = async (item: ShopItem): Promise<boolean> => {
    const itemPrice = getShopItemPrice(item, capacityPurchaseCounts);
    if (rewardProgress.coins < itemPrice) return false;

    try {
      if (item.kind === 'inventory-capacity') {
        const currentCapacity = await loadInventoryCapacity(item.capacityCategory);
        const purchaseCount = getCapacityPurchaseCount(currentCapacity);

        if (purchaseCount >= maxInventoryCapacityPurchases) return false;

        const nextPrice = getInventoryCapacityPrice(item, purchaseCount);
        const purchased = spendCurrencyReward(nextPrice);

        if (!purchased) return false;

        await increaseInventoryCapacity(item.capacityCategory, item.slotIncrease);
        await refreshCapacityPurchaseCounts();
        setInventoryRefreshVersion((version) => version + 1);
        return true;
      }

      await saveInventoryItem({
        category: item.inventoryCategory,
        description: item.description,
        equipped: false,
        id: item.id,
        isNew: true,
        name: item.name,
        quantity: 1,
        symbol: item.symbol,
      });
      const purchased = spendCurrencyReward(item.price);

      if (!purchased) return false;

      setOwnedShopItemIds((current) => current.includes(item.id) ? current : [...current, item.id]);
      setInventoryRefreshVersion((version) => version + 1);
      return true;
    } catch {
      return false;
    }
  };
  const getDisplayedShopItemPrice = useCallback(
    (item: ShopItem) => getShopItemPrice(item, capacityPurchaseCounts),
    [capacityPurchaseCounts],
  );
  const isShopItemSoldOut = useCallback(
    (item: ShopItem) => item.kind === 'inventory-capacity'
      && (capacityPurchaseCounts[item.id] ?? 0) >= maxInventoryCapacityPurchases,
    [capacityPurchaseCounts],
  );
  const beginDecorPlacement = (item: InventoryItem) => {
    setPlacementItem(item);
    setIsInventoryOpen(false);
  };
  const updateRoomLayout = (event: LayoutChangeEvent) => {
    const { height: roomHeight, width: roomWidth } = event.nativeEvent.layout;

    setRoomLayout({ height: roomHeight, width: roomWidth });
  };
  const placeDecorItem = (event: GestureResponderEvent) => {
    if (!placementItem) return;

    const { locationX, locationY } = event.nativeEvent;
    const x = clamp(locationX / Math.max(roomLayout.width || width, 1), 0.05, 0.95);
    const y = clamp(locationY / Math.max(roomLayout.height || height, 1), 0.08, 0.94);

    const placement = {
      item: placementItem,
      x,
      y,
    };

    setPlacedDecorItems((current) => ({
      ...current,
      [placementItem.id]: placement,
    }));
    void saveDecorPlacement({ itemId: placementItem.id, x, y });
    setPlacementItem(null);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.shell}>
        <View style={styles.room}>
          <View
            accessibilityIgnoresInvertColors
            onLayout={updateRoomLayout}
            style={styles.roomBackground}
          >
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="stretch"
              source={roomBackgroundImages.wallpaper}
              style={styles.roomWallpaperImage}
            />
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="stretch"
              source={roomBackgroundImages.floor}
              style={styles.roomFloorImage}
            />
            {Object.values(placedDecorItems).map((placedItem) => (
              <PlacedDecorObject
                item={placedItem.item}
                key={placedItem.item.id}
                roomScale={roomScale}
                x={placedItem.x}
                y={placedItem.y}
              />
            ))}
            <View style={[styles.characterStage, { bottom: characterBottom }]}>
              <StaticPet
                onPress={() => {
                  setPetStatusError('');
                  setIsPetStatusOpen(true);
                }}
                pet={activePet}
                petName={activePetDisplayName}
                stage={currentStage}
                size={characterSize}
              />
            </View>
            {placementItem ? (
              <Pressable
                accessibilityLabel={t('home.placementA11y', { name: placementItem.name })}
                accessibilityRole="button"
                onPress={placeDecorItem}
                style={styles.placementLayer}
              >
                <View style={styles.placementToolbar}>
                  <Text style={styles.placementText}>{t('home.placementText', { name: placementItem.name })}</Text>
                  <Pressable
                    accessibilityLabel={t('home.placementCancel')}
                    accessibilityRole="button"
                    onPress={(event) => {
                      event.stopPropagation();
                      setPlacementItem(null);
                    }}
                    style={styles.placementCancelButton}
                  >
                    <Text style={styles.placementCancelText}>{t('actions.cancel')}</Text>
                  </Pressable>
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>

        <PetStatusHud
          careMeters={careMeters}
          onPressPet={() => {
            setPetStatusError('');
            setIsPetStatusOpen(true);
          }}
          petImage={activePet.stages[currentStage]}
          petName={activePetDisplayName}
          progress={rewardProgress}
          roomName={activePetRoomName}
        />
        <PetCareActions onCareAction={openCareItemPopup} />
        <CareItemUsePopup
          errorMessage={careItemError}
          isBusy={isUsingCareItem}
          items={careUsableItems}
          meter={activeCareMeter}
          onClose={closeCareItemPopup}
          onUseItem={(item, quantity) => void useCareItem(item, quantity)}
          visible={activeCareMeter !== null}
          width={popupWidth}
        />

        {showLocalDevButton ? (
          <LocalDevControls
            isOpen={isLocalDevMenuOpen}
            onAction={handleLocalDevAction}
            onToggle={() => setIsLocalDevMenuOpen((current) => !current)}
          />
        ) : null}

        <RewardDeliveryEvent
          bottom={characterBottom}
          eventKey={rewardDeliveryEventKey}
          height={height}
          isParcelAvailable={isRewardParcelAvailable}
          onOpenParcel={openDeliveryReward}
          width={width}
        />

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
            petDisplayNames={customPetNames}
            petRoomNames={customPetRoomNames}
            onSelectPet={(petId) => {
              setActivePetId(petId);
              setIsPetRoomOpen(false);
            }}
            pets={pets}
            scale={scale}
            width={popupWidth}
          />
        ) : null}

        <PetStatusPopup
          defaultName={activePetDefaultName}
          defaultRoomName={activePetDefaultRoomName}
          displayName={activePetDisplayName}
          displayRoomName={activePetRoomName}
          errorMessage={petStatusError}
          isSaving={isSavingPetName}
          onClose={closePetStatus}
          onOpenSettings={() => setIsPetSettingsOpen(true)}
          onSaveProfile={updateActivePetProfile}
          petImage={activePet.stages[currentStage]}
          progress={rewardProgress}
          visible={isPetStatusOpen}
          width={popupWidth}
        />

        <PetSettingsPopup
          language={language}
          onChangeLanguage={setLanguage}
          onClose={() => setIsPetSettingsOpen(false)}
          onTogglePushNotifications={() => setPushNotificationsEnabled((current) => !current)}
          pushNotificationsEnabled={pushNotificationsEnabled}
          visible={isPetSettingsOpen}
          width={popupWidth}
        />

        <InventoryModal
          onBeginDecorPlacement={beginDecorPlacement}
          onInventoryChanged={refreshRoomBackgroundImages}
          onClose={() => setIsInventoryOpen(false)}
          key={inventoryRefreshVersion}
          refreshVersion={inventoryRefreshVersion}
          visible={isInventoryOpen}
          width={popupWidth}
        />

        <ShopModal
          coinBalance={rewardProgress.coins}
          getItemPrice={getDisplayedShopItemPrice}
          isItemSoldOut={isShopItemSoldOut}
          onClose={() => setIsShopOpen(false)}
          onPurchase={purchaseShopItem}
          ownedItemIds={ownedShopItemIds}
          visible={isShopOpen}
        />
        <GiftRewardPopup
          giftBoxCount={giftBoxCount}
          isBusy={isClaimingGiftReward}
          onClose={closeGiftReward}
          onOpenBox={openGiftBox}
          reward={giftReward}
          visible={isGiftRewardOpen}
          width={popupWidth}
        />
        {giftRewardError ? (
          <View style={styles.deliveryRewardError}>
            <Text style={styles.deliveryRewardErrorText}>{giftRewardError}</Text>
          </View>
        ) : null}

        <EventPopup
          onClose={() => setIsEventOpen(false)}
          visible={isEventOpen}
          width={popupWidth}
        />

        {isCalendarOpen ? <CalendarModal
          onClose={() => setIsCalendarOpen(false)}
          plans={dailyPlans}
          yearlyGoals={yearlyGoals}
          onToggleTask={toggleTask}
          isLoading={goalPlanner.isLoadingGoalData}
          isBusy={isGeneratingPlan}
          errorMessage={goalError}
        /> : null}
        <DeliveryRewardPopup
          isBusy={isClaimingDeliveryReward}
          onAccept={acceptDeliveryReward}
          onClose={closeDeliveryReward}
          onDiscard={discardDeliveryReward}
          message={deliveryRewardMessage}
          reward={deliveryReward}
          visible={isDeliveryRewardPopupOpen}
          width={popupWidth}
        />
        {deliveryRewardError ? (
          <View style={styles.deliveryRewardError}>
            <Text style={styles.deliveryRewardErrorText}>{deliveryRewardError}</Text>
          </View>
        ) : null}
        <YearlyGoalModal
          difficulty={yearlyGoalDifficulty}
          errorMessage={goalError}
          isGenerating={isGeneratingPlan || isLoadingGoalData}
          onChangeDifficulty={setYearlyGoalDifficulty}
          onChangeDraft={setYearlyGoalDraft}
          onClose={closeYearlyGoal}
          onSave={addYearlyGoal}
          value={yearlyGoalDraft}
          visible={isYearlyGoalOpen}
          width={popupWidth}
        />
        <TodayTasksModal
          errorMessage={goalError}
          hasUsedTaskRefresh={hasUsedTaskRefresh}
          isGenerating={isGeneratingPlan}
          onAbandonGoal={abandonYearlyGoal}
          onClose={closeTodayTasks}
          onGenerate={generateAdditionalTaskForSelectedGoal}
          onGenerateTodayTasks={generateBasicTasksForSelectedGoal}
          onOpenGoal={openYearlyGoalFromTodayTasks}
          onRefreshOneTask={refreshOneIncompleteTaskForSelectedGoal}
          onSelectGoal={setSelectedTaskGoalId}
          onToggleGoalCompletion={toggleYearlyGoalCompletion}
          onToggleTask={toggleTask}
          plans={dailyPlans}
          selectedGoalId={selectedTaskGoalId}
          visible={isTodayTasksOpen}
          width={popupWidth}
          yearlyGoals={activeYearlyGoals}
        />
      </View>
    </SafeAreaView>
  );
}

function getCapacityPurchaseCount(capacity: number): number {
  return clamp(
    Math.floor((capacity - initialInventorySlotCount) / inventoryExpansionSlotCount),
    0,
    maxInventoryCapacityPurchases,
  );
}

function getInventoryCapacityPrice(item: InventoryCapacityShopItem, purchaseCount: number): number {
  return item.price * (purchaseCount + 1);
}

function getShopItemPrice(
  item: ShopItem,
  capacityPurchaseCounts: Record<ShopUpgradeId, number>,
): number {
  return item.kind === 'inventory-capacity'
    ? getInventoryCapacityPrice(item, capacityPurchaseCounts[item.id] ?? 0)
    : item.price;
}

function PlacedDecorObject({
  item,
  roomScale,
  x,
  y,
}: {
  item: InventoryItem;
  roomScale: number;
  x: number;
  y: number;
}) {
  const { t } = useI18n();
  const image = getItemImage(item.id);
  const size = Math.round(64 * roomScale);

  return (
    <View
      accessibilityLabel={t('home.placedDecorA11y', { name: item.name })}
      style={[
        styles.placedDecorObject,
        {
          height: size,
          left: `${x * 100}%`,
          marginLeft: -Math.round(size / 2),
          marginTop: -Math.round(size / 2),
          top: `${y * 100}%`,
          width: size,
        },
      ]}
    >
      {image ? (
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={image}
          style={styles.placedDecorImage}
        />
      ) : (
        <Text style={styles.placedDecorFallback}>{item.symbol}</Text>
      )}
    </View>
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
    position: 'relative',
  },
  roomWallpaperImage: {
    height: '72%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  roomFloorImage: {
    bottom: 0,
    height: '28%',
    left: 0,
    position: 'absolute',
    right: 0,
    width: '100%',
  },
  placedDecorFallback: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  placedDecorImage: {
    height: '100%',
    width: '100%',
  },
  placedDecorObject: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  placementCancelButton: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 8,
  },
  placementCancelText: {
    color: '#5c3529',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  placementLayer: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingTop: 72,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 30,
  },
  placementText: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  placementToolbar: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  characterStage: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  deliveryRewardError: {
    alignSelf: 'center',
    backgroundColor: '#ffe2c0',
    borderColor: '#a34c39',
    borderWidth: 2,
    bottom: 24,
    maxWidth: '88%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'absolute',
    zIndex: 50,
  },
  deliveryRewardErrorText: {
    color: '#693c31',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 15,
    textAlign: 'center',
  },
});



