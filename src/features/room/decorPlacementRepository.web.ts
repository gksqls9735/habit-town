import { DecorPlacement } from './types';

const decorPlacementStorageKey = 'habit-town.room.decorPlacements.v1';

let memoryPlacements: DecorPlacement[] | null = null;

export async function loadDecorPlacements(): Promise<DecorPlacement[]> {
  return clonePlacements(readDecorPlacements());
}

export async function saveDecorPlacement(placement: DecorPlacement): Promise<void> {
  const placements = readDecorPlacements();
  const nextPlacement = normalizePlacement(placement);
  const existingIndex = placements.findIndex((entry) => entry.itemId === nextPlacement.itemId);

  if (existingIndex === -1) {
    placements.push(nextPlacement);
  } else {
    placements[existingIndex] = nextPlacement;
  }

  writeDecorPlacements(placements);
}

export async function deleteDecorPlacement(itemId: string): Promise<void> {
  writeDecorPlacements(readDecorPlacements().filter((placement) => placement.itemId !== itemId));
}

function readDecorPlacements(): DecorPlacement[] {
  if (memoryPlacements) {
    return clonePlacements(memoryPlacements);
  }

  const storage = getBrowserStorage();
  if (storage) {
    try {
      const storedValue: unknown = JSON.parse(storage.getItem(decorPlacementStorageKey) ?? '[]');
      if (Array.isArray(storedValue)) {
        memoryPlacements = storedValue.filter(isDecorPlacement).map(normalizePlacement);
        return clonePlacements(memoryPlacements);
      }
    } catch {
      // Invalid browser data is ignored and replaced with an empty room layout.
    }
  }

  writeDecorPlacements([]);
  return [];
}

function writeDecorPlacements(placements: readonly DecorPlacement[]): void {
  memoryPlacements = clonePlacements(placements);
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(decorPlacementStorageKey, JSON.stringify(memoryPlacements));
    } catch {
      // In-memory state keeps placements usable when browser persistence is unavailable.
    }
  }
}

function normalizePlacement(placement: DecorPlacement): DecorPlacement {
  return {
    itemId: placement.itemId,
    layerOrder: normalizeLayerOrder(placement.layerOrder),
    x: clampPlacementCoordinate(placement.x),
    y: clampPlacementCoordinate(placement.y),
  };
}

function isDecorPlacement(value: unknown): value is DecorPlacement {
  if (!value || typeof value !== 'object') return false;
  const placement = value as Record<string, unknown>;

  return typeof placement.itemId === 'string'
    && (placement.layerOrder === undefined
      || (typeof placement.layerOrder === 'number' && Number.isFinite(placement.layerOrder)))
    && typeof placement.x === 'number'
    && Number.isFinite(placement.x)
    && typeof placement.y === 'number'
    && Number.isFinite(placement.y);
}

function normalizeLayerOrder(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value ?? 0)) : 0;
}

function clonePlacements(placements: readonly DecorPlacement[]): DecorPlacement[] {
  return placements.map((placement) => ({ ...placement }));
}

function clampPlacementCoordinate(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.5));
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
