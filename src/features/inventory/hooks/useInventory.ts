import { useCallback, useEffect, useState } from 'react';
import {
  deleteInventoryItem,
  loadInventoryItems,
  markInventoryItemSeen,
  setInventoryItemEquipped,
} from '../inventoryRepository';
import { InventoryItem } from '../types';

const inventoryLoadTimeoutMs = 8_000;

/**
 * Manages inventory loading and item state while keeping storage failures recoverable.
 */
export function useInventory() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);

  const refresh = useCallback(async () => {
    try {
      setErrorMessage('');
      setIsLoading(true);
      setItems(await loadInventoryItemsWithTimeout());
    } catch {
      setErrorMessage('가방을 불러오지 못했어요. 다시 열어 주세요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const selectItem = useCallback(async (id: string) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, isNew: false } : item));
    try {
      await markInventoryItemSeen(id);
    } catch {
      setErrorMessage('아이템 확인 상태를 저장하지 못했어요.');
      await refresh();
    }
  }, [refresh]);

  const toggleEquipped = useCallback(async (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return;
    const equipped = !item.equipped;
    setItems((current) => current.map((candidate) => candidate.id === id ? { ...candidate, equipped, isNew: false } : candidate));
    try {
      await setInventoryItemEquipped(id, equipped);
    } catch {
      setErrorMessage('장착 상태를 저장하지 못했어요.');
      await refresh();
    }
  }, [items, refresh]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) return false;

    setItems((current) => current.filter((candidate) => candidate.id !== id));
    try {
      await deleteInventoryItem(id);
      setErrorMessage('');
      return true;
    } catch {
      setErrorMessage('아이템을 버리지 못했어요. 다시 시도해 주세요.');
      await refresh();
      return false;
    }
  }, [items, refresh]);

  return { deleteItem, errorMessage, isLoading, items, refresh, selectItem, toggleEquipped };
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
