import type { ImageSourcePropType } from 'react-native';
import { getItemImage } from '../items/itemImages';
import { ItemCode, itemsByCode } from '../items/itemCatalog';
import type { InventoryItemCategory } from '../inventory/types';

export type ShopCategory = 'object' | 'wallpaper' | 'flooring';

export type ShopItem = {
  category: ShopCategory;
  description: string;
  id: ItemCode;
  image: ImageSourcePropType;
  inventoryCategory: InventoryItemCategory;
  name: string;
  price: number;
  symbol: string;
};

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
  'cacao-flooring',
] as const satisfies readonly ItemCode[];

export const shopItems: ShopItem[] = shopItemCodes.map((id) => {
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
    name: item.name,
    price: item.shop.price,
    symbol: item.symbol,
  };
});
