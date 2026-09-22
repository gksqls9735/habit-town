import type { AppLanguage } from './types';

const storageKey = 'habit-town.app.language';

let memoryLanguage: AppLanguage | null = null;

export async function loadLanguage(): Promise<AppLanguage | null> {
  if (memoryLanguage) {
    return memoryLanguage;
  }

  const storage = getBrowserStorage();
  const value = storage ? storage.getItem(storageKey) : null;

  if (isValidLanguage(value)) {
    memoryLanguage = value;
    return value;
  }

  return null;
}

export async function saveLanguage(language: AppLanguage): Promise<void> {
  memoryLanguage = language;
  const storage = getBrowserStorage();

  if (storage) {
    try {
      storage.setItem(storageKey, language);
    } catch {
      // In-memory state keeps the language usable when browser persistence is unavailable.
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

function isValidLanguage(value: string | null): value is AppLanguage {
  return value === 'en' || value === 'ko';
}
