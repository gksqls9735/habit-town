import itemCatalog from './itemCatalog.json';
import { InventoryItemCategory } from '../inventory/types';
import type { CareMeterKey } from '../rewards/rewardSystem';

export type ItemCode = keyof typeof itemCatalog;
export type ItemCatalogShopCategory = 'action' | 'flooring' | 'object' | 'wallpaper';

export type ItemCatalogInventoryDefaults = {
  starterQuantity: number;
  startsAsNew: boolean;
};

export type ItemCatalogShopEntry = {
  category: ItemCatalogShopCategory;
  careIncrease?: number;
  careMeter?: CareMeterKey;
  price: number;
};

export type ItemCatalogRewardRarity = 'common' | 'rare' | 'uncommon';

export type ItemCatalogDeliveryReward = {
  quantity: number;
  rarity: ItemCatalogRewardRarity;
  weight: number;
};

export type ItemCatalogRewardEntry = {
  delivery?: ItemCatalogDeliveryReward;
};

export type ItemCatalogEntry = {
  category: InventoryItemCategory;
  description: string;
  imageUrl: string | null;
  inventory?: ItemCatalogInventoryDefaults;
  name: string;
  reward?: ItemCatalogRewardEntry;
  shop?: ItemCatalogShopEntry;
  symbol: string;
};

export const itemsByCode = itemCatalog as Record<ItemCode, ItemCatalogEntry>;

export const itemCatalogEntries = Object.entries(itemsByCode) as [
  ItemCode,
  ItemCatalogEntry,
][];

export function getItemShopCategory(itemId: string): ItemCatalogShopCategory | undefined {
  if (!Object.prototype.hasOwnProperty.call(itemsByCode, itemId)) return undefined;
  return itemsByCode[itemId as ItemCode].shop?.category;
}

export function getItemCareEffect(
  itemId: string,
): { increase: number; meter: CareMeterKey } | undefined {
  if (!Object.prototype.hasOwnProperty.call(itemsByCode, itemId)) return undefined;

  const shop = itemsByCode[itemId as ItemCode].shop;

  if (!shop?.careMeter || typeof shop.careIncrease !== 'number') {
    return undefined;
  }

  return { increase: shop.careIncrease, meter: shop.careMeter };
}
