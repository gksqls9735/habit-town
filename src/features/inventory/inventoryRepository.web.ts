import { starterInventoryItems } from './inventoryCatalog';
import { InventoryItem, InventoryItemCategory } from './types';

const inventoryStorageKey = 'habit-town.inventory.v1';
const inventoryCategories: readonly InventoryItemCategory[] = [
  'decor',
  'material',
  'pet-care',
  'tool',
];

let memoryItems: InventoryItem[] | null = null;

/**
 * Loads inventory without pulling the native SQLite worker into the web bundle.
 */
export async function loadInventoryItems(): Promise<InventoryItem[]> {
  return cloneItems(readInventoryItems());
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
