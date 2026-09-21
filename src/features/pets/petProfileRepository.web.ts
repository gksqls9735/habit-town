const activePetIdStorageKey = 'habit-town.pet.active-id';
const petNameStorageKeyPrefix = 'habit-town.pet.name.';
const petRoomNameStorageKeyPrefix = 'habit-town.pet.room-name.';

let memoryActivePetId = '';
const memoryPetNames: Record<string, string> = {};
const memoryPetRoomNames: Record<string, string> = {};

export async function loadActivePetId(): Promise<string | null> {
  return readActivePetId();
}

export async function saveActivePetId(petId: string): Promise<string> {
  const normalizedPetId = normalizePetId(petId);

  if (!normalizedPetId) {
    throw new Error('Pet id is required.');
  }

  memoryActivePetId = normalizedPetId;
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(activePetIdStorageKey, normalizedPetId);
    } catch {
      // In-memory state keeps the selection usable when browser persistence is unavailable.
    }
  }

  return normalizedPetId;
}

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

export async function loadPetRoomName(petId: string): Promise<string | null> {
  return readPetRoomName(petId);
}

export async function savePetRoomName(petId: string, roomName: string): Promise<string> {
  const normalizedRoomName = normalizePetRoomName(roomName);

  if (!normalizedRoomName) {
    throw new Error('Pet room name is required.');
  }

  memoryPetRoomNames[petId] = normalizedRoomName;
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(getPetRoomNameStorageKey(petId), normalizedRoomName);
    } catch {
      // In-memory state keeps the room name usable when browser persistence is unavailable.
    }
  }

  return normalizedRoomName;
}

function readActivePetId(): string | null {
  if (memoryActivePetId) {
    return memoryActivePetId;
  }

  const storage = getBrowserStorage();
  const petId = storage ? normalizePetId(storage.getItem(activePetIdStorageKey) ?? '') : '';

  if (petId) {
    memoryActivePetId = petId;
    return petId;
  }

  return null;
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

function readPetRoomName(petId: string): string | null {
  if (memoryPetRoomNames[petId]) {
    return memoryPetRoomNames[petId];
  }

  const storage = getBrowserStorage();
  const roomName = storage
    ? normalizePetRoomName(storage.getItem(getPetRoomNameStorageKey(petId)) ?? '')
    : '';

  if (roomName) {
    memoryPetRoomNames[petId] = roomName;
    return roomName;
  }

  return null;
}

function getPetNameStorageKey(petId: string): string {
  return `${petNameStorageKeyPrefix}${petId}`;
}

function getPetRoomNameStorageKey(petId: string): string {
  return `${petRoomNameStorageKeyPrefix}${petId}`;
}

function normalizePetId(petId: string): string {
  return petId.trim().slice(0, 32);
}

function normalizePetName(name: string): string {
  return name.trim().slice(0, 12);
}

function normalizePetRoomName(roomName: string): string {
  return roomName.trim().slice(0, 16);
}

function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
