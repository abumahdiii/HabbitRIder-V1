import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.agents', 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

export interface ServerUser {
  username: string;
  passwordHash: string; // Stored directly (plain text or simple base64) for MVP testing simplicity
  displayName: string;
  avatar: string;
  xp: number;
  streak: number;
  level: number;
  isPremium?: boolean;
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

function ensureReportsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    logDebug(`Creating directory: ${DATA_DIR}`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REPORTS_FILE)) {
    logDebug(`Creating JSON db file: ${REPORTS_FILE}`);
    fs.writeFileSync(REPORTS_FILE, JSON.stringify([], null, 2), 'utf-8');
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
    level: 1,
    isPremium: false
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

// ==========================================
// Copyright Violation Reports
// ==========================================

export interface CopyrightReport {
  id: string;
  routineId: string;
  routineTitle: string;
  resourceName: string;
  resourceUrl: string;
  reportedBy: string;
  reason: string;
  createdAt: number;
  status?: 'pending' | 'resolved_removed' | 'resolved_dismissed';
}

export function getAllCopyrightReports(): CopyrightReport[] {
  ensureReportsFile();
  try {
    const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    logDebug('Error parsing reports.json database', e);
    return [];
  }
}

export function saveCopyrightReport(report: CopyrightReport) {
  ensureReportsFile();
  const reports = getAllCopyrightReports();
  report.status = report.status || 'pending';
  reports.push(report);
  logDebug(`Saving new copyright report for resource: ${report.resourceName}`);
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
}

export function resolveCopyrightReport(reportId: string, action: 'approve' | 'reject'): boolean {
  ensureReportsFile();
  const reports = getAllCopyrightReports();
  const report = reports.find((r) => r.id === reportId);
  if (!report) return false;

  report.status = action === 'approve' ? 'resolved_removed' : 'resolved_dismissed';
  logDebug(`Resolving report ${reportId} with action ${action}. Status set to: ${report.status}`);
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  return true;
}

export function manuallyUpgradeUser(username: string): ServerUser | undefined {
  const users = getAllUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    user.isPremium = true;
    saveAllUsers(users);
    logDebug(`User "${username}" manually upgraded to premium plan.`);
  }
  return user;
}

// ==========================================
// Crypto Transactions
// ==========================================

export interface CryptoTransaction {
  id: string;
  username: string;
  amount: string; // e.g. "3.00 USDT"
  gateway: 'MetaMask' | 'NOWPayments';
  status: 'completed' | 'pending';
  createdAt: number;
}

function ensureTransactionsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    logDebug(`Creating directory: ${DATA_DIR}`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    logDebug(`Creating JSON db file: ${TRANSACTIONS_FILE}`);
    // Initialise with some mock transactions for testing
    const initialTx: CryptoTransaction[] = [
      { id: 'tx_1', username: 'rabbit_racer', amount: '5.00 USDT', gateway: 'NOWPayments', status: 'completed', createdAt: Date.now() - 3600000 * 24 },
      { id: 'tx_2', username: 'lazy_sloth', amount: '3.00 USDT', gateway: 'MetaMask', status: 'completed', createdAt: Date.now() - 3600000 * 12 },
      { id: 'tx_3', username: 'smart_owl', amount: '3.00 USDT', gateway: 'MetaMask', status: 'pending', createdAt: Date.now() - 3600000 * 2 }
    ];
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(initialTx, null, 2), 'utf-8');
  }
}

export function getAllCryptoTransactions(): CryptoTransaction[] {
  ensureTransactionsFile();
  try {
    const raw = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    logDebug('Error parsing transactions.json database', e);
    return [];
  }
}

export function saveCryptoTransaction(tx: CryptoTransaction) {
  ensureTransactionsFile();
  const txs = getAllCryptoTransactions();
  txs.push(tx);
  logDebug(`Saving new crypto transaction: ${tx.id} for user ${tx.username}`);
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(txs, null, 2), 'utf-8');
}
