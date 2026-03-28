// IndexedDB Database Management for BloomScroll

import { DB_NAME, DB_VERSION, STORES } from '@/types'

let db: IDBDatabase | null = null

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open database'))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Bookmarks store with indexes
      if (!database.objectStoreNames.contains(STORES.BOOKMARKS)) {
        const bookmarkStore = database.createObjectStore(STORES.BOOKMARKS, {
          keyPath: 'id',
        })
        bookmarkStore.createIndex('savedAt', 'savedAt', { unique: false })
        bookmarkStore.createIndex('archived', 'archived', { unique: false })
        bookmarkStore.createIndex('url', 'url', { unique: true })
      }

      // Tags store
      if (!database.objectStoreNames.contains(STORES.TAGS)) {
        const tagStore = database.createObjectStore(STORES.TAGS, {
          keyPath: 'id',
        })
        tagStore.createIndex('name', 'name', { unique: true })
      }

      // Settings store (key-value)
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, {
          keyPath: 'key',
        })
      }
    }
  })
}

export async function closeDB(): Promise<void> {
  if (db) {
    db.close()
    db = null
  }
}

// Generic transaction helper
export async function withTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = callback(store)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Get all items from a store
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  return withTransaction(storeName, 'readonly', (store) => store.getAll())
}

// Get item by key
export async function getByKey<T>(
  storeName: string,
  key: string
): Promise<T | undefined> {
  return withTransaction(storeName, 'readonly', (store) => store.get(key))
}

// Add or update item
export async function putItem<T>(storeName: string, item: T): Promise<IDBValidKey> {
  return withTransaction(storeName, 'readwrite', (store) => store.put(item))
}

// Delete item by key
export async function deleteItem(storeName: string, key: string): Promise<void> {
  return withTransaction(storeName, 'readwrite', (store) => store.delete(key))
}

// Clear all items from a store
export async function clearStore(storeName: string): Promise<void> {
  return withTransaction(storeName, 'readwrite', (store) => store.clear())
}

// Get items by index
export async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Get all items sorted by index (descending for newest first)
export async function getAllSortedByIndex<T>(
  storeName: string,
  indexName: string,
  direction: 'next' | 'prev' = 'prev'
): Promise<T[]> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.openCursor(null, direction)
    const results: T[] = []

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
    request.onerror = () => reject(request.error)
  })
}
