export type InventoryItemCategory = 'decor' | 'material' | 'pet-care' | 'tool';
export type InventoryCapacityCategory = 'decor' | 'general';

export const initialInventorySlotCount = 24;
export const inventoryExpansionSlotCount = 6;

export type InventoryItem = {
  category: InventoryItemCategory;
  description: string;
  equipped: boolean;
  id: string;
  isNew: boolean;
  name: string;
  quantity: number;
  symbol: string;
};
