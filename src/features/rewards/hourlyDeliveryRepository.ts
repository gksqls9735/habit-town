import * as SQLite from 'expo-sqlite';

const databaseName = 'habit-town.db';
const lastDeliveryTimeKey = 'hourly_delivery_last_time';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function loadLastHourlyDeliveryTime(): Promise<number | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    lastDeliveryTimeKey,
  );
  const ms = Number(row?.value);

  return Number.isFinite(ms) && ms > 0 ? ms : null;
}

export async function saveLastHourlyDeliveryTime(timestampMs: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    lastDeliveryTimeKey,
    String(timestampMs),
  );
}

async function getDatabase() {
  databasePromise ??= openDatabase();
  return databasePromise;
}

async function openDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  return db;
}
