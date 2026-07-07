import { openDB, IDBPDatabase } from 'idb';

export interface UranaiSchema {
  profile: { key: number; value: Record<string, unknown> };
  fortunes: { key: number; value: Record<string, unknown>; indexes: { 'by-date': string } };
}

let _db: IDBPDatabase<UranaiSchema> | null = null;

export async function getDatabase() {
  if (_db) return _db;
  _db = await openDB<UranaiSchema>('uranai-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('fortunes')) {
        const store = db.createObjectStore('fortunes', { keyPath: 'id', autoIncrement: true });
        store.createIndex('by-date', 'savedAt');
      }
    },
  });
  return _db;
}
