import * as SQLite from 'expo-sqlite';
import { starterInventoryItems } from './inventoryCatalog';
import { InventoryItem, InventoryItemCategory } from './types';

const databaseName = 'habit-town.db';

type InventoryItemRow = {
  category: InventoryItemCategory;
  description: string;
  equipped: number;
  id: string;
  is_new: number;
  name: string;
  quantity: number;
  symbol: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Loads the native inventory from the device-local SQLite database.
 */
export async function loadInventoryItems(): Promise<InventoryItem[]> {
  const db = await getInventoryDatabase();
  const rows = await db.getAllAsync<InventoryItemRow>(
    `SELECT id, name, description, category, quantity, equipped, is_new, symbol
     FROM inventory_items ORDER BY owned_at ASC`,
  );
  return rows.map(mapInventoryItemRow);
}

/**
 * Adds an item while merging quantities for inventory entries already owned.
 */
export async function saveInventoryItem(item: InventoryItem) {
  const db = await getInventoryDatabase();
  await db.runAsync(
    `INSERT INTO inventory_items
      (id, name, description, category, quantity, equipped, is_new, symbol, owned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       description = excluded.description,
       category = excluded.category,
       quantity = inventory_items.quantity + excluded.quantity,
       is_new = 1,
       symbol = excluded.symbol`,
    item.id, item.name, item.description, item.category, item.quantity,
    item.equipped ? 1 : 0, item.isNew ? 1 : 0, item.symbol, Date.now(),
  );
}

/**
 * Persists an item's equipped state and clears its new-item marker.
 */
export async function setInventoryItemEquipped(id: string, equipped: boolean) {
  const db = await getInventoryDatabase();
  await db.runAsync('UPDATE inventory_items SET equipped = ?, is_new = 0 WHERE id = ?', equipped ? 1 : 0, id);
}

/**
 * Clears the new-item marker after the user inspects an item.
 */
export async function markInventoryItemSeen(id: string) {
  const db = await getInventoryDatabase();
  await db.runAsync('UPDATE inventory_items SET is_new = 0 WHERE id = ?', id);
}

/**
 * Permanently removes an item from the device-local inventory.
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  const db = await getInventoryDatabase();
  await db.runAsync('DELETE FROM inventory_items WHERE id = ?', id);
}

async function getInventoryDatabase() {
  databasePromise ??= openInventoryDatabase();
  return databasePromise;
}

async function openInventoryDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      equipped INTEGER NOT NULL,
      is_new INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      owned_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const seedRow = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM inventory_metadata WHERE key = 'starter_inventory_seeded'",
  );
  if (!seedRow) {
    const countRow = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM inventory_items',
    );
    await db.withTransactionAsync(async () => {
      if ((countRow?.count ?? 0) === 0) {
        for (const item of starterInventoryItems) {
          await insertInventoryItem(db, item);
        }
      }
      await db.runAsync(
        "INSERT INTO inventory_metadata (key, value) VALUES ('starter_inventory_seeded', '1')",
      );
    });
  }
  return db;
}

async function insertInventoryItem(db: SQLite.SQLiteDatabase, item: InventoryItem) {
  await db.runAsync(
    `INSERT OR IGNORE INTO inventory_items
      (id, name, description, category, quantity, equipped, is_new, symbol, owned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    item.id, item.name, item.description, item.category, item.quantity,
    item.equipped ? 1 : 0, item.isNew ? 1 : 0, item.symbol, Date.now(),
  );
}

function mapInventoryItemRow(row: InventoryItemRow): InventoryItem {
  return { category: row.category, description: row.description, equipped: row.equipped === 1, id: row.id, isNew: row.is_new === 1, name: row.name, quantity: row.quantity, symbol: row.symbol };
}
