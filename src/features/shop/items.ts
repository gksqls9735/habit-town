import type { ImageSourcePropType } from 'react-native';
import { getItemImage } from '../items/itemImages';
import { ItemCode, itemsByCode } from '../items/itemCatalog';
import type { CareMeterKey } from '../rewards/rewardSystem';
import {
  inventoryExpansionSlotCount,
  type InventoryCapacityCategory,
  type InventoryItemCategory,
} from '../inventory/types';

export type ShopCategory = 'action' | 'object' | 'wallpaper' | 'flooring' | 'misc';
export type ShopUpgradeId = 'decor-inventory-expansion' | 'goal-slot-expansion' | 'inventory-expansion';

type BaseShopItem = {
  category: ShopCategory;
  description: string;
  id: string;
  image: ImageSourcePropType;
  name: string;
  price: number;
  symbol: string;
};

export type InventoryShopItem = BaseShopItem & {
  careEffect?: {
    increase: number;
    meter: CareMeterKey;
  };
  id: ItemCode;
  inventoryCategory: InventoryItemCategory;
  kind: 'inventory-item';
};

export type InventoryCapacityShopItem = BaseShopItem & {
  capacityCategory: InventoryCapacityCategory;
  id: Exclude<ShopUpgradeId, 'goal-slot-expansion'>;
  kind: 'inventory-capacity';
  slotIncrease: number;
};

export type GoalCapacityShopItem = BaseShopItem & {
  id: 'goal-slot-expansion';
  kind: 'goal-capacity';
  slotIncrease: number;
};

export type ShopItem = GoalCapacityShopItem | InventoryCapacityShopItem | InventoryShopItem;

const shopItemCodes = [
  'pet-rug',
  'toy-ball',
  'pet-cushion',
  'pet-food-bowl',
  'wall-clock',
  'potted-sprout',
  'coral-floor-lamp',
  'low-bookshelf',
  'sprout-wall-art',
  'toy-storage-basket',
  'ivory-wallpaper',
  'sage-ivory-wallpaper',
  'powder-blue-wallpaper',
  'strawberry-cream-wallpaper',
  'cloud-sky-wallpaper',
  'sage-flower-wallpaper',
  'cacao-flooring',
  'dark-walnut-flooring',
  'white-oak-flooring',
  'herringbone-oak-flooring',
  'mint-checker-flooring',
  'terracotta-mosaic-flooring',
  'pet-shampoo-action-object',
  'pet-toothpaste-action-object',
  'dental-chew-action-object',
  'premium-kibble-action-object',
  'treat-biscuit-jar-action-object',
  'wet-food-can-action-object',
  'special-meal-plate-action-object',
  'bouncy-ball-action-object',
  'plush-chick-action-object',
  'feather-wand-action-object',
  'rope-toy-action-object',
  'play-tunnel-action-object',
] as const satisfies readonly ItemCode[];

const inventoryShopItems: InventoryShopItem[] = shopItemCodes.map((id) => {
  const item = itemsByCode[id];
  const image = getItemImage(id);

  if (!item.shop || !image) {
    throw new Error(`Shop item ${id} is missing catalog or image data.`);
  }

  return {
    category: item.shop.category,
    description: item.description,
    id,
    image,
    inventoryCategory: item.category,
    kind: 'inventory-item',
    name: item.name,
    price: item.shop.price,
    symbol: item.symbol,
    ...(item.shop.careMeter && typeof item.shop.careIncrease === 'number'
      ? { careEffect: { increase: item.shop.careIncrease, meter: item.shop.careMeter } }
      : {}),
  };
});

const upgradeShopItems: (GoalCapacityShopItem | InventoryCapacityShopItem)[] = [
  {
    category: 'misc',
    description: '올해 목표 입력 가능 개수가 1개 늘어나요.',
    id: 'goal-slot-expansion',
    image: require('../../../assets/png/objects/misc/goal-slot-expansion-icon.png'),
    kind: 'goal-capacity',
    name: '목표 슬롯 추가',
    price: 1000,
    slotIncrease: 1,
    symbol: '+',
  },
  {
    capacityCategory: 'general',
    category: 'misc',
    description: `일반 아이템 가방 공간이 ${inventoryExpansionSlotCount}칸 늘어나요.`,
    id: 'inventory-expansion',
    image: require('../../../assets/png/objects/misc/inventory-expansion-icon.png'),
    kind: 'inventory-capacity',
    name: '가방 확장하기',
    price: 1000,
    slotIncrease: inventoryExpansionSlotCount,
    symbol: '+',
  },
  {
    capacityCategory: 'decor',
    category: 'misc',
    description: `꾸미기 아이템 가방 공간이 ${inventoryExpansionSlotCount}칸 늘어나요.`,
    id: 'decor-inventory-expansion',
    image: require('../../../assets/png/objects/misc/decor-inventory-expansion-icon.png'),
    kind: 'inventory-capacity',
    name: '꾸미기 가방 확장하기',
    price: 1000,
    slotIncrease: inventoryExpansionSlotCount,
    symbol: '+',
  },
];

export const shopItems: ShopItem[] = [
  ...inventoryShopItems,
  ...upgradeShopItems,
];
