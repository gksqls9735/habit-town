export type InventoryItemCategory = 'decor' | 'material' | 'pet-care' | 'tool';

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
