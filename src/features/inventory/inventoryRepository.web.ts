import { starterInventoryItems } from './inventoryCatalog';
import {
  initialInventorySlotCount,
  InventoryCapacityCategory,
  InventoryItem,
  InventoryItemCategory,
} from './types';

const legacyInventoryCapacityStorageKey = 'habit-town.inventory.capacity.v1';
const inventoryCapacityStorageKeys: Record<InventoryCapacityCategory, string> = {
  decor: 'habit-town.inventory.capacity.decor.v1',
  general: 'habit-town.inventory.capacity.general.v1',
};
const inventoryStorageKey = 'habit-town.inventory.v1';
const inventoryCategories: readonly InventoryItemCategory[] = [
  'decor',
  'material',
  'pet-care',
  'tool',
];

let memoryItems: InventoryItem[] | null = null;
let memoryCapacities: Partial<Record<InventoryCapacityCategory, number>> = {};

/**
 * Loads inventory without pulling the native SQLite worker into the web bundle.
 */
export async function loadInventoryItems(): Promise<InventoryItem[]> {
  return cloneItems(readInventoryItems());
}

export async function loadInventoryCapacity(category: InventoryCapacityCategory): Promise<number> {
  return readInventoryCapacity(category);
}

export async function increaseInventoryCapacity(
  category: InventoryCapacityCategory,
  amount: number,
): Promise<number> {
  const nextCapacity = readInventoryCapacity(category) + amount;
  writeInventoryCapacity(category, nextCapacity);

  return nextCapacity;
}

/**
 * Adds an item to browser persistence using the same quantity merge behavior as SQLite.
 */
export async function saveInventoryItem(item: InventoryItem): Promise<void> {
  const items = readInventoryItems();
  const existingIndex = items.findIndex((candidate) => candidate.id === item.id);

  if (existingIndex === -1) {
    items.push({ ...item });
  } else {
    const existing = items[existingIndex];
    items[existingIndex] = {
      ...existing,
      category: item.category,
      description: item.description,
      isNew: true,
      name: item.name,
      quantity: existing.quantity + item.quantity,
      symbol: item.symbol,
    };
  }

  writeInventoryItems(items);
}

/**
 * Persists an item's equipped state and clears its new-item marker.
 */
export async function setInventoryItemEquipped(id: string, equipped: boolean): Promise<void> {
  updateInventoryItem(id, (item) => ({ ...item, equipped, isNew: false }));
}

export async function setInventoryItemsEquipped(
  updates: readonly { equipped: boolean; id: string }[],
): Promise<void> {
  if (updates.length === 0) return;

  const updateById = new Map(updates.map((update) => [update.id, update.equipped]));
  const items = readInventoryItems().map((item) => {
    const equipped = updateById.get(item.id);

    return equipped === undefined ? item : { ...item, equipped, isNew: false };
  });

  writeInventoryItems(items);
}

/**
 * Clears the new-item marker after the user inspects an item.
 */
export async function markInventoryItemSeen(id: string): Promise<void> {
  updateInventoryItem(id, (item) => ({ ...item, isNew: false }));
}

/**
 * Permanently removes an item from browser inventory persistence.
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  writeInventoryItems(readInventoryItems().filter((item) => item.id !== id));
}

function readInventoryItems(): InventoryItem[] {
  if (memoryItems) {
    return cloneItems(memoryItems);
  }

  const storage = getBrowserStorage();
  if (storage) {
    try {
      const storedValue: unknown = JSON.parse(storage.getItem(inventoryStorageKey) ?? 'null');
      if (Array.isArray(storedValue) && storedValue.every(isInventoryItem)) {
        memoryItems = cloneItems(storedValue);
        return cloneItems(memoryItems);
      }
    } catch {
      // Invalid or inaccessible browser data is safely replaced with the starter inventory.
    }
  }

  const starterItems = cloneItems(starterInventoryItems);
  writeInventoryItems(starterItems);
  return starterItems;
}

function readInventoryCapacity(category: InventoryCapacityCategory): number {
  const memoryCapacity = memoryCapacities[category];

  if (memoryCapacity !== undefined) {
    return memoryCapacity;
  }

  const storage = getBrowserStorage();
  if (storage) {
    const storedCapacity = Number(storage.getItem(inventoryCapacityStorageKeys[category]));
    const legacyCapacity = category === 'general'
      ? Number(storage.getItem(legacyInventoryCapacityStorageKey))
      : NaN;
    const capacity = Number.isInteger(storedCapacity) ? storedCapacity : legacyCapacity;

    if (Number.isInteger(capacity) && capacity >= initialInventorySlotCount) {
      memoryCapacities = { ...memoryCapacities, [category]: capacity };
      return capacity;
    }
  }

  writeInventoryCapacity(category, initialInventorySlotCount);
  return initialInventorySlotCount;
}

function writeInventoryCapacity(category: InventoryCapacityCategory, capacity: number): void {
  memoryCapacities = { ...memoryCapacities, [category]: capacity };
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(inventoryCapacityStorageKeys[category], String(capacity));
    } catch {
      // In-memory state keeps the capacity usable when browser persistence is unavailable.
    }
  }
}

function writeInventoryItems(items: readonly InventoryItem[]): void {
  memoryItems = cloneItems(items);
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(inventoryStorageKey, JSON.stringify(memoryItems));
    } catch {
      // In-memory state keeps the inventory usable when browser persistence is unavailable.
    }
  }
}

function updateInventoryItem(
  id: string,
  update: (item: InventoryItem) => InventoryItem,
): void {
  const items = readInventoryItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return;

  items[index] = update(items[index]);
  writeInventoryItems(items);
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function cloneItems(items: readonly InventoryItem[]): InventoryItem[] {
  return items.map((item) => ({ ...item }));
}

function isInventoryItem(value: unknown): value is InventoryItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;

  return typeof item.id === 'string'
    && typeof item.name === 'string'
    && typeof item.description === 'string'
    && typeof item.category === 'string'
    && inventoryCategories.includes(item.category as InventoryItemCategory)
    && typeof item.quantity === 'number'
    && Number.isFinite(item.quantity)
    && typeof item.equipped === 'boolean'
    && typeof item.isNew === 'boolean'
    && typeof item.symbol === 'string';
}
