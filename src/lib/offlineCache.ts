// Offline cache using IndexedDB
const DB_NAME = 'LegalDiaryCache';
const DB_VERSION = 1;
const STORES = {
  USERS: 'users',
  DIARIES: 'diaries',
  REQUESTS: 'requests',
  RELATIONSHIPS: 'relationships',
};

let db: IDBDatabase | null = null;

// Initialize IndexedDB
export async function initCache(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.USERS)) {
        database.createObjectStore(STORES.USERS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.DIARIES)) {
        database.createObjectStore(STORES.DIARIES, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.REQUESTS)) {
        database.createObjectStore(STORES.REQUESTS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.RELATIONSHIPS)) {
        database.createObjectStore(STORES.RELATIONSHIPS, { keyPath: 'id' });
      }
    };
  });
}

// Save data to cache
export async function saveToCache(storeName: string, data: any): Promise<void> {
  if (!db) await initCache();
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    if (Array.isArray(data)) {
      // Save multiple items
      data.forEach(item => store.put(item));
    } else {
      // Save single item
      store.put(data);
    }
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Get data from cache
export async function getFromCache(storeName: string, key?: string): Promise<any> {
  if (!db) await initCache();
  
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    if (key) {
      // Get single item
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      // Get all items
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }
  });
}

// Clear cache
export async function clearCache(): Promise<void> {
  if (!db) await initCache();
  
  const stores = [STORES.USERS, STORES.DIARIES, STORES.REQUESTS, STORES.RELATIONSHIPS];
  
  for (const storeName of stores) {
    await new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export { STORES };
