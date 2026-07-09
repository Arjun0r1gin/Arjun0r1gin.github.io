export interface MediaItem {
  id: string;
  name: string;
  type: string;
  category: 'planets' | 'asteroids' | 'clouds' | 'backgrounds' | 'icons' | 'videos' | 'general';
  blob: Blob;
  url: string; // Object URL for rendering
  size: number;
  dimensions?: string;
  uploadedAt: number;
}

const DB_NAME = 'cosmos_media_db';
const STORE_NAME = 'media_items';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

const getDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const mediaDb = {
  /** Get all items stored in IndexedDB */
  async getAll(): Promise<MediaItem[]> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as MediaItem[];
        // Map Blobs to temporary object URLs so they can be rendered in <img> and <video> tags
        const itemsWithUrls = items.map((item) => ({
          ...item,
          url: URL.createObjectURL(item.blob)
        }));
        resolve(itemsWithUrls);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  /** Save a new media item */
  async save(item: Omit<MediaItem, 'url'>): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  /** Delete a media item by ID */
  async delete(id: string): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  /** Rename a media item by ID */
  async rename(id: string, newName: string): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result as MediaItem;
        if (!item) {
          return reject(new Error('Media item not found'));
        }
        item.name = newName;
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  },

  /** Replace file blob data of an existing item */
  async replace(id: string, newBlob: Blob, newSize: number, newDimensions?: string): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result as MediaItem;
        if (!item) {
          return reject(new Error('Media item not found'));
        }
        item.blob = newBlob;
        item.size = newSize;
        if (newDimensions) {
          item.dimensions = newDimensions;
        }
        item.uploadedAt = Date.now();
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }
};
