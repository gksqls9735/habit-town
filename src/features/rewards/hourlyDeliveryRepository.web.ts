const storageKey = 'habit-town.delivery.hourly-last-time';

let memoryLastTime: number | null = null;

export async function loadLastHourlyDeliveryTime(): Promise<number | null> {
  if (memoryLastTime !== null) {
    return memoryLastTime;
  }

  const storage = getBrowserStorage();
  const ms = storage ? Number(storage.getItem(storageKey)) : 0;
  const value = Number.isFinite(ms) && ms > 0 ? ms : null;

  if (value !== null) {
    memoryLastTime = value;
  }

  return value;
}

export async function saveLastHourlyDeliveryTime(timestampMs: number): Promise<void> {
  memoryLastTime = timestampMs;
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(storageKey, String(timestampMs));
    } catch {
      // In-memory state keeps the timestamp usable when browser persistence is unavailable.
    }
  }
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
