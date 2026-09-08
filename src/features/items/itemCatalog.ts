import itemCatalog from './itemCatalog.json';
import { InventoryItemCategory } from '../inventory/types';

export type ItemCode = keyof typeof itemCatalog;
export type ItemCatalogShopCategory = 'flooring' | 'object' | 'wallpaper';

export type ItemCatalogInventoryDefaults = {
  starterQuantity: number;
  startsAsNew: boolean;
};

export type ItemCatalogShopEntry = {
  category: ItemCatalogShopCategory;
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
