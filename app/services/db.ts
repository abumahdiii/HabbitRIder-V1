// Promise-based IndexedDB Service for HabbitRider
// Fully async/await compatible and client-side safe.

export interface RoutineResource {
  id: string;
  name: string;
  url: string; // web URL or local PDF Data URI
  type: 'link' | 'pdf';
}

export interface Routine {
  id: string;
  title: string;
  category: string;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    days?: number[]; // 0 for Sunday, 1 for Monday, etc.
    dayOfMonth?: number; // 1 to 31 for monthly schedule
  };
  resources?: RoutineResource[];
  chapters?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  streak: number;
  completedToday: boolean;
  lastCompletedDate?: string; // YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
  isProgressive?: boolean;
  currentProgressSession?: number;
  totalProgressSessions?: number;
}

export interface UserProfile {
  id: string; // Will use "current" as standard for single-user offline profile
  displayName: string;
  avatar: string;
  xp: number;
  streak: number;
  level: number;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'habbitrider_db';
const DB_VERSION = 1;
const STORE_ROUTINES = 'routines';
const STORE_PROFILE = 'profile';

// Helper for DEV_MODE guarded logging
function logDebug(message: string, ...args: unknown[]) {
  if (
    process.env.NEXT_PUBLIC_DEV_MODE === 'true' ||
    process.env.DEV_MODE === 'true' ||
    (typeof window !== 'undefined' && (window as Window & { DEV_MODE?: boolean }).DEV_MODE === true)
  ) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      logDebug('initDB skipped: Not in browser environment');
      reject(new Error('IndexedDB is only available in the browser.'));
      return;
    }

    logDebug('Initializing IndexedDB...');
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      logDebug('IndexedDB initialization failed', error);
      reject(new Error(`Failed to open IndexedDB: ${error?.message}`));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      logDebug('IndexedDB successfully initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      logDebug('IndexedDB upgrade needed. Creating object stores...');
      
      if (!db.objectStoreNames.contains(STORE_ROUTINES)) {
        db.createObjectStore(STORE_ROUTINES, { keyPath: 'id' });
        logDebug(`Object store "${STORE_ROUTINES}" created.`);
      }
      
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
        logDebug(`Object store "${STORE_PROFILE}" created.`);
      }
    };
  });
}

// ==========================================
// Routines CRUD
// ==========================================

export function saveRoutine(routine: Routine): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      logDebug('Saving routine...', routine);
      const transaction = db.transaction(STORE_ROUTINES, 'readwrite');
      const store = transaction.objectStore(STORE_ROUTINES);
      const request = store.put(routine);

      request.onsuccess = () => {
        logDebug(`Routine "${routine.id}" successfully saved.`);
        resolve();
      };
      
      request.onerror = () => {
        logDebug(`Error saving routine "${routine.id}":`, request.error);
        reject(request.error);
      };
    });
  });
}

export function getAllRoutines(): Promise<Routine[]> {
  return initDB().then((db) => {
    return new Promise<Routine[]>((resolve, reject) => {
      logDebug('Fetching all routines...');
      const transaction = db.transaction(STORE_ROUTINES, 'readonly');
      const store = transaction.objectStore(STORE_ROUTINES);
      const request = store.getAll();

      request.onsuccess = () => {
        logDebug(`Successfully fetched ${request.result.length} routines.`);
        resolve(request.result);
      };
      
      request.onerror = () => {
        logDebug('Error fetching routines:', request.error);
        reject(request.error);
      };
    });
  });
}

export function getRoutine(id: string): Promise<Routine | undefined> {
  return initDB().then((db) => {
    return new Promise<Routine | undefined>((resolve, reject) => {
      logDebug(`Fetching routine with ID "${id}"...`);
      const transaction = db.transaction(STORE_ROUTINES, 'readonly');
      const store = transaction.objectStore(STORE_ROUTINES);
      const request = store.get(id);

      request.onsuccess = () => {
        logDebug(`Routine with ID "${id}" fetch status:`, request.result ? 'Found' : 'Not Found');
        resolve(request.result);
      };
      
      request.onerror = () => {
        logDebug(`Error fetching routine "${id}":`, request.error);
        reject(request.error);
      };
    });
  });
}

export function deleteRoutine(id: string): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      logDebug(`Deleting routine with ID "${id}"...`);
      const transaction = db.transaction(STORE_ROUTINES, 'readwrite');
      const store = transaction.objectStore(STORE_ROUTINES);
      const request = store.delete(id);

      request.onsuccess = () => {
        logDebug(`Routine "${id}" successfully deleted.`);
        resolve();
      };
      
      request.onerror = () => {
        logDebug(`Error deleting routine "${id}":`, request.error);
        reject(request.error);
      };
    });
  });
}

// ==========================================
// User Profile CRUD
// ==========================================

export function saveProfile(profile: UserProfile): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      logDebug('Saving user profile...', profile);
      const transaction = db.transaction(STORE_PROFILE, 'readwrite');
      const store = transaction.objectStore(STORE_PROFILE);
      const request = store.put(profile);

      request.onsuccess = () => {
        logDebug(`User profile "${profile.id}" successfully saved.`);
        resolve();
      };
      
      request.onerror = () => {
        logDebug(`Error saving profile "${profile.id}":`, request.error);
        reject(request.error);
      };
    });
  });
}

export function getProfile(): Promise<UserProfile | undefined> {
  return initDB().then((db) => {
    return new Promise<UserProfile | undefined>((resolve, reject) => {
      logDebug('Fetching user profile...');
      const transaction = db.transaction(STORE_PROFILE, 'readonly');
      const store = transaction.objectStore(STORE_PROFILE);
      const request = store.get('current');

      request.onsuccess = () => {
        logDebug('User profile fetch status:', request.result ? 'Found' : 'Not Found');
        resolve(request.result);
      };
      
      request.onerror = () => {
        logDebug('Error fetching user profile:', request.error);
        reject(request.error);
      };
    });
  });
}
