import * as SQLite from 'expo-sqlite';
import { DecorPlacement } from './types';

const databaseName = 'habit-town.db';

type DecorPlacementRow = {
  item_id: string;
  layer_order: number;
  x: number;
  y: number;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function loadDecorPlacements(): Promise<DecorPlacement[]> {
  const db = await getDecorPlacementDatabase();
  const rows = await db.getAllAsync<DecorPlacementRow>(
    'SELECT item_id, layer_order, x, y FROM room_decor_placements ORDER BY layer_order ASC, updated_at ASC',
  );

  return rows.map((row) => ({
    itemId: row.item_id,
    layerOrder: normalizeLayerOrder(row.layer_order),
    x: clampPlacementCoordinate(row.x),
    y: clampPlacementCoordinate(row.y),
  }));
}

export async function saveDecorPlacement(placement: DecorPlacement): Promise<void> {
  const db = await getDecorPlacementDatabase();
  await db.runAsync(
    `INSERT INTO room_decor_placements (item_id, layer_order, x, y, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(item_id) DO UPDATE SET
       layer_order = excluded.layer_order,
       x = excluded.x,
       y = excluded.y,
       updated_at = excluded.updated_at`,
    placement.itemId,
    normalizeLayerOrder(placement.layerOrder),
    clampPlacementCoordinate(placement.x),
    clampPlacementCoordinate(placement.y),
    Date.now(),
  );
}

export async function deleteDecorPlacement(itemId: string): Promise<void> {
  const db = await getDecorPlacementDatabase();
  await db.runAsync('DELETE FROM room_decor_placements WHERE item_id = ?', itemId);
}

async function getDecorPlacementDatabase() {
  databasePromise ??= openDecorPlacementDatabase();
  return databasePromise;
}

async function openDecorPlacementDatabase() {
  const db = await SQLite.openDatabaseAsync(databaseName);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS room_decor_placements (
      item_id TEXT PRIMARY KEY NOT NULL,
      layer_order INTEGER NOT NULL DEFAULT 0,
      x REAL NOT NULL,
      y REAL NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(room_decor_placements)');
  if (!columns.some((column) => column.name === 'layer_order')) {
    await db.execAsync(
      'ALTER TABLE room_decor_placements ADD COLUMN layer_order INTEGER NOT NULL DEFAULT 0',
    );
  }

  return db;
}

function normalizeLayerOrder(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function clampPlacementCoordinate(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0.5));
}
