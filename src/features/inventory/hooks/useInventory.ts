import { useCallback, useEffect, useState } from 'react';
import {
  deleteInventoryItem,
  loadInventoryCapacity,
  loadInventoryItems,
  markInventoryItemSeen,
  setInventoryItemEquipped,
  setInventoryItemsEquipped,
} from '../inventoryRepository';
import {
  initialInventorySlotCount,
  InventoryCapacityCategory,
  InventoryItem,
} from '../types';
import { getItemShopCategory } from '../../items/itemCatalog';
import { useI18n } from '../../i18n';

const inventoryLoadTimeoutMs = 8_000;

/**
 * Manages inventory loading and item state while keeping storage failures recoverable.
 */
export function useInventory() {
  const { t } = useI18n();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [capacities, setCapacities] = useState<Record<InventoryCapacityCategory, number>>({
    decor: initialInventorySlotCount,
    general: initialInventorySlotCount,
  });

  const refresh = useCallback(async () => {
    try {
      setErrorMessage('');
      setIsLoading(true);
      const [nextItems, generalCapacity, decorCapacity] = await Promise.all([
        loadInventoryItemsWithTimeout(),
        loadInventoryCapacity('general'),
        loadInventoryCapacity('decor'),
      ]);
      setItems(nextItems);
      setCapacities({
        decor: decorCapacity,
        general: generalCapacity,
      });
    } catch {
      setErrorMessage(t('inventory.error.load'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => { void refresh(); }, [refresh]);

  const selectItem = useCallback(async (id: string) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, isNew: false } : item));
    try {
      await markInventoryItemSeen(id);
    } catch {
      setErrorMessage(t('inventory.error.markSeen'));
      await refresh();
    }
  }, [refresh, t]);

  const toggleEquipped = useCallback(async (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;
    const equipped = !item.equipped;
    const exclusiveShopCategory = getExclusiveEquipShopCategory(item);
    const updates = exclusiveShopCategory && equipped
      ? items
          .filter((candidate) =>
            candidate.id === id || getItemShopCategory(candidate.id) === exclusiveShopCategory,
          )
          .map((candidate) => ({ id: candidate.id, equipped: candidate.id === id }))
      : [{ id, equipped }];

    setItems((current) => current.map((candidate) => {
      const update = updates.find((entry) => entry.id === candidate.id);

      return update ? { ...candidate, equipped: update.equipped, isNew: false } : candidate;
    }));
    try {
      if (updates.length > 1) {
        await setInventoryItemsEquipped(updates);
      } else {
        await setInventoryItemEquipped(id, equipped);
      }
    } catch {
      setErrorMessage(t('inventory.error.equip'));
      await refresh();
    }
  }, [items, refresh, t]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return false;

    setItems((current) => current.filter((candidate) => candidate.id !== id));
    try {
      await deleteInventoryItem(id);
      setErrorMessage('');
      return true;
    } catch {
      setErrorMessage(t('inventory.error.delete'));
      await refresh();
      return false;
    }
  }, [items, refresh, t]);

  return { capacities, deleteItem, errorMessage, isLoading, items, refresh, selectItem, toggleEquipped };
}

async function loadInventoryItemsWithTimeout(): Promise<InventoryItem[]> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('Inventory load timed out.')),
      inventoryLoadTimeoutMs,
    );
  });

  try {
    return await Promise.race([loadInventoryItems(), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function getExclusiveEquipShopCategory(item: InventoryItem) {
  const shopCategory = getItemShopCategory(item.id);

  return shopCategory === 'wallpaper' || shopCategory === 'flooring'
    ? shopCategory
    : undefined;
}
