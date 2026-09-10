import type { ImageSourcePropType } from 'react-native';
import { getItemImage } from '../items/itemImages';
import { ItemCode, itemsByCode } from '../items/itemCatalog';
import {
  inventoryExpansionSlotCount,
  type InventoryCapacityCategory,
  type InventoryItemCategory,
} from '../inventory/types';

export type ShopCategory = 'object' | 'wallpaper' | 'flooring' | 'misc';
export type ShopUpgradeId = 'decor-inventory-expansion' | 'inventory-expansion';

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
  id: ItemCode;
  inventoryCategory: InventoryItemCategory;
  kind: 'inventory-item';
};

export type InventoryCapacityShopItem = BaseShopItem & {
  capacityCategory: InventoryCapacityCategory;
  id: ShopUpgradeId;
  kind: 'inventory-capacity';
  slotIncrease: number;
};

export type ShopItem = InventoryCapacityShopItem | InventoryShopItem;

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
  'cacao-flooring',
  'dark-walnut-flooring',
  'white-oak-flooring',
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
  };
});

const upgradeShopItems: InventoryCapacityShopItem[] = [
  {
    capacityCategory: 'general',
    category: 'misc',
    description: `일반 아이템 가방 공간이 ${inventoryExpansionSlotCount}칸 늘어나요.`,
    id: 'inventory-expansion',
    image: require('../../../assets/ui/inventory-button.png'),
    kind: 'inventory-capacity',
    name: '가방 확장하기',
    price: 500,
    slotIncrease: inventoryExpansionSlotCount,
    symbol: '+',
  },
  {
    capacityCategory: 'decor',
    category: 'misc',
    description: `꾸미기 아이템 가방 공간이 ${inventoryExpansionSlotCount}칸 늘어나요.`,
    id: 'decor-inventory-expansion',
    image: require('../../../assets/ui/inventory-button.png'),
    kind: 'inventory-capacity',
    name: '꾸미기 가방 확장하기',
    price: 500,
    slotIncrease: inventoryExpansionSlotCount,
    symbol: '+',
  },
];

export const shopItems: ShopItem[] = [
  ...inventoryShopItems,
  ...upgradeShopItems,
];
