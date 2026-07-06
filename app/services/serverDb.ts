import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.agents', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

export interface ServerUser {
  username: string;
  passwordHash: string; // Stored directly (plain text or simple base64) for MVP testing simplicity
  displayName: string;
  avatar: string;
  xp: number;
  streak: number;
  level: number;
}

// Helper for DEV_MODE logs
function logDebug(message: string, ...args: unknown[]) {
  if (process.env.DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    console.log(`[SERVER DEBUG] ${message}`, ...args);
  }
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    logDebug(`Creating directory: ${DATA_DIR}`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    logDebug(`Creating JSON db file: ${DATA_FILE}`);
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllUsers(): ServerUser[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    logDebug('Error parsing users.json database', e);
    return [];
  }
}

export function saveAllUsers(users: ServerUser[]) {
  ensureDataFile();
  logDebug('Saving users database state...');
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function findUserByUsername(username: string): ServerUser | undefined {
  const users = getAllUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export function createServerUser(username: string, passwordHash: string, displayName: string): ServerUser {
  const users = getAllUsers();
  
  // Quick base setup for mock users if none exist, to populate the leaderboard
  if (users.length === 0) {
    users.push(
      { username: 'rabbit_racer', passwordHash: '123', displayName: '🐰 خرگوش قهرمان', avatar: '🐰', xp: 450, streak: 8, level: 5 },
      { username: 'lazy_sloth', passwordHash: '123', displayName: '🦥 تنبل تن‌پرور', avatar: '🦥', xp: 85, streak: 1, level: 1 },
      { username: 'smart_owl', passwordHash: '123', displayName: '🦉 جغد دانا', avatar: '🦉', xp: 890, streak: 15, level: 9 }
    );
  }

  const newUser: ServerUser = {
    username: username.trim(),
    passwordHash,
    displayName: displayName.trim(),
    avatar: '🦉', // default mascot
    xp: 0,
    streak: 0,
    level: 1
  };
  
  users.push(newUser);
  saveAllUsers(users);
  logDebug(`Created new server user: ${username}`);
  return newUser;
}

export function updateUserDisplayName(username: string, displayName: string): ServerUser | undefined {
  const users = getAllUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    logDebug(`Updating display name for user ${username}: ${user.displayName} -> ${displayName}`);
    user.displayName = displayName.trim();
    saveAllUsers(users);
  }
  return user;
}

export function updateUserProfile(username: string, displayName: string, avatar: string): ServerUser | undefined {
  const users = getAllUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    logDebug(`Updating profile for user ${username}: name=${displayName}, avatar=${avatar}`);
    user.displayName = displayName.trim();
    user.avatar = avatar;
    saveAllUsers(users);
  }
  return user;
}
