import * as SQLite from 'expo-sqlite';
import type { AppLanguage } from './types';

const databaseName = 'habit-town.db';
const languageKey = 'app_language';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function loadLanguage(): Promise<AppLanguage | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    languageKey,
  );
  const value = row?.value?.trim();

  return isValidLanguage(value) ? value : null;
}

export async function saveLanguage(language: AppLanguage): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    languageKey,
    language,
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

function isValidLanguage(value: string | undefined): value is AppLanguage {
  return value === 'en' || value === 'ko';
}
