import * as SQLite from 'expo-sqlite';

const databaseName = 'habit-town.db';
const giftBoxCountMetadataKey = 'gift_box_count';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function loadGiftBoxCount(): Promise<number> {
  const db = await getGiftBoxDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM gift_box_metadata WHERE key = ?',
    giftBoxCountMetadataKey,
  );

  return normalizeGiftBoxCount(row?.value);
}

export async function increaseGiftBoxCount(amount = 1): Promise<number> {
  const db = await getGiftBoxDatabase();
  const currentCount = await loadGiftBoxCount();
  const nextCount = Math.max(0, currentCount + amount);

  await saveGiftBoxCount(db, nextCount);

  return nextCount;
}

export async function consumeGiftBox(): Promise<number | null> {
  const db = await getGiftBoxDatabase();
  const currentCount = await loadGiftBoxCount();

  if (currentCount <= 0) {
    return null;
  }

  const nextCount = currentCount - 1;
  await saveGiftBoxCount(db, nextCount);

  return nextCount;
}

async function getGiftBoxDatabase() {
  databasePromise ??= openGiftBoxDatabase();
  return databasePromise;
}

async function openGiftBoxDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS gift_box_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  return db;
}

async function saveGiftBoxCount(db: SQLite.SQLiteDatabase, count: number): Promise<void> {
  await db.runAsync(
    `INSERT INTO gift_box_metadata (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    giftBoxCountMetadataKey,
    String(count),
  );
}

function normalizeGiftBoxCount(value: string | undefined): number {
  const count = Number(value);

  return Number.isInteger(count) && count > 0 ? count : 0;
}
