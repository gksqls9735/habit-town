const petNameStorageKeyPrefix = 'habit-town.pet.name.';

const memoryPetNames: Record<string, string> = {};

export async function loadPetName(petId: string): Promise<string | null> {
  return readPetName(petId);
}

export async function savePetName(petId: string, name: string): Promise<string> {
  const normalizedName = normalizePetName(name);

  if (!normalizedName) {
    throw new Error('Pet name is required.');
  }

  memoryPetNames[petId] = normalizedName;
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(getPetNameStorageKey(petId), normalizedName);
    } catch {
      // In-memory state keeps the name usable when browser persistence is unavailable.
    }
  }

  return normalizedName;
}

function readPetName(petId: string): string | null {
  if (memoryPetNames[petId]) {
    return memoryPetNames[petId];
  }

  const storage = getBrowserStorage();
  const name = storage ? normalizePetName(storage.getItem(getPetNameStorageKey(petId)) ?? '') : '';

  if (name) {
    memoryPetNames[petId] = name;
    return name;
  }

  return null;
}

function getPetNameStorageKey(petId: string): string {
  return `${petNameStorageKeyPrefix}${petId}`;
}

function normalizePetName(name: string): string {
  return name.trim().slice(0, 12);
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
