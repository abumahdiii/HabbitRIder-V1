'use server';

import { cookies } from 'next/headers';
import { findUserByUsername, createServerUser, updateUserDisplayName, updateUserProfile, getAllUsers, saveAllUsers, ServerUser } from '../services/serverDb';

const SESSION_COOKIE_NAME = 'habbitrider_session';

export type ActionState<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// Helper for DEV_MODE logs
function logDebug(message: string, ...args: unknown[]) {
  if (process.env.DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    console.log(`[AUTH ACTION DEBUG] ${message}`, ...args);
  }
}

export async function getAuthUser(): Promise<ServerUser | null> {
  logDebug('Retrieving session user...');
  const cookieStore = await cookies();
  const sessionVal = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionVal) {
    logDebug('No session cookie found.');
    return null;
  }
  
  const user = findUserByUsername(sessionVal);
  if (!user) {
    logDebug(`Session cookie user "${sessionVal}" not found in database.`);
    return null;
  }
  
  logDebug(`Authenticated user: ${user.username}`);
  return user;
}

export async function loginAction(username: string, passwordHash: string): Promise<ActionState> {
  logDebug(`Login attempt for username: ${username}`);
  
  if (!username.trim() || !passwordHash) {
    return { success: false, error: 'نام کاربری و رمز عبور الزامی است.' };
  }

  const user = findUserByUsername(username.trim());
  if (!user || user.passwordHash !== passwordHash) {
    logDebug(`Invalid credentials for user: ${username}`);
    return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, user.username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week session
    path: '/'
  });

  logDebug(`Login successful. Session set for ${user.username}`);
  return { success: true };
}

export async function signupAction(username: string, passwordHash: string, displayName: string): Promise<ActionState> {
  logDebug(`Signup attempt for username: ${username}`);
  
  if (!username.trim() || !passwordHash || !displayName.trim()) {
    return { success: false, error: 'تمامی فیلدها الزامی هستند.' };
  }

  const cleanUsername = username.trim();
  const existing = findUserByUsername(cleanUsername);
  if (existing) {
    logDebug(`Signup failed. Username already exists: ${cleanUsername}`);
    return { success: false, error: 'این نام کاربری قبلاً ثبت شده است.' };
  }

  const user = createServerUser(cleanUsername, passwordHash, displayName.trim());
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, user.username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  logDebug(`Signup successful. User registered and session set for ${user.username}`);
  return { success: true };
}

export async function logoutAction(): Promise<ActionState> {
  logDebug('Logout requested.');
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  logDebug('Session deleted successfully.');
  return { success: true };
}

export async function updateDisplayNameAction(displayName: string): Promise<ActionState<ServerUser>> {
  logDebug(`Request to update display name to: ${displayName}`);
  const user = await getAuthUser();
  if (!user) {
    logDebug('Update display name failed: Unauthorized.');
    return { success: false, error: 'شما لاگین نکرده‌اید.' };
  }

  if (!displayName.trim()) {
    return { success: false, error: 'نام نمایشی نمی‌تواند خالی باشد.' };
  }

  const updated = updateUserDisplayName(user.username, displayName);
  if (!updated) {
    return { success: false, error: 'کاربر یافت نشد.' };
  }

  logDebug(`Display name successfully updated for ${user.username}`);
  return { success: true, data: updated };
}

export async function updateProfileAction(displayName: string, avatar: string): Promise<ActionState<ServerUser>> {
  logDebug(`Request to update profile to: name=${displayName}, avatar=${avatar}`);
  const user = await getAuthUser();
  if (!user) {
    logDebug('Update profile failed: Unauthorized.');
    return { success: false, error: 'شما لاگین نکرده‌اید.' };
  }

  if (!displayName.trim()) {
    return { success: false, error: 'نام نمایشی نمی‌تواند خالی باشد.' };
  }
  if (!avatar.trim()) {
    return { success: false, error: 'انتخاب آواتار الزامی است.' };
  }

  const updated = updateUserProfile(user.username, displayName, avatar);
  if (!updated) {
    return { success: false, error: 'کاربر یافت نشد.' };
  }

  logDebug(`Profile successfully updated for ${user.username}`);
  return { success: true, data: updated };
}

export async function getLeaderboardAction(): Promise<ServerUser[]> {
  logDebug('Fetching leaderboard list...');
  const users = getAllUsers();
  // Sort by XP descending
  const sorted = users.sort((a, b) => b.xp - a.xp);
  return sorted;
}

export async function addXpAction(xpAmount: number, streakChange: number = 0): Promise<ActionState<ServerUser>> {
  logDebug(`Adding ${xpAmount} XP and changing streak by ${streakChange} for active user...`);
  const user = await getAuthUser();
  if (!user) return { success: false, error: 'عدم دسترسی' };

  const users = getAllUsers();
  const dbUser = users.find(u => u.username.toLowerCase() === user.username.toLowerCase());
  if (dbUser) {
    dbUser.xp += xpAmount;
    dbUser.level = Math.floor(dbUser.xp / 100) + 1;
    dbUser.streak = Math.max(0, dbUser.streak + streakChange);
    saveAllUsers(users);
    logDebug(`User ${user.username} state updated. New XP: ${dbUser.xp}, Level: ${dbUser.level}, Streak: ${dbUser.streak}`);
    return { success: true, data: dbUser };
  }
  return { success: false, error: 'کاربر یافت نشد' };
}


