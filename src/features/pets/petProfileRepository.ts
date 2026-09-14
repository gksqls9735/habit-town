import * as SQLite from 'expo-sqlite';

const databaseName = 'habit-town.db';
const petNameKeyPrefix = 'pet_name:';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function loadPetName(petId: string): Promise<string | null> {
  const db = await getPetProfileDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM pet_profile_metadata WHERE key = ?',
    getPetNameKey(petId),
  );
  const name = normalizePetName(row?.value ?? '');

  return name || null;
}

export async function savePetName(petId: string, name: string): Promise<string> {
  const normalizedName = normalizePetName(name);

  if (!normalizedName) {
    throw new Error('Pet name is required.');
  }

  const db = await getPetProfileDatabase();
  await db.runAsync(
    `INSERT INTO pet_profile_metadata (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    getPetNameKey(petId),
    normalizedName,
  );

  return normalizedName;
}

async function getPetProfileDatabase() {
  databasePromise ??= openPetProfileDatabase();
  return databasePromise;
}

async function openPetProfileDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS pet_profile_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  return db;
}

function getPetNameKey(petId: string): string {
  return `${petNameKeyPrefix}${petId}`;
}

function normalizePetName(name: string): string {
  return name.trim().slice(0, 12);
}
