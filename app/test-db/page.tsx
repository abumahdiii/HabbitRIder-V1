"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  saveRoutine,
  getAllRoutines,
  deleteRoutine,
  saveProfile,
  getProfile,
  Routine,
  UserProfile
} from '../services/db';
import { getAuthUser, updateDisplayNameAction, logoutAction, getLeaderboardAction, addXpAction } from '../actions/auth';
import { ServerUser } from '../services/serverDb';

// Enable dev mode logs on console
if (typeof window !== 'undefined') {
  (window as any).DEV_MODE = true;
}

export default function UnifiedDashboard() {
  const router = useRouter();
  
  // App views: 'routines' | 'leaderboard' | 'profile'
  const [activeTab, setActiveTab] = useState<'routines' | 'leaderboard' | 'profile'>('routines');

  // Server state
  const [serverUser, setServerUser] = useState<ServerUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<ServerUser[]>([]);

  // Client local DB state
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('مطالعه');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load all server & local DB data
  const loadData = async () => {
    try {
      // 1. Get authenticated user
      const sUser = await getAuthUser();
      if (!sUser) {
        router.push('/login');
        return;
      }
      setServerUser(sUser);
      setDisplayName(sUser.displayName);

      // 2. Fetch Leaderboard
      const board = await getLeaderboardAction();
      setLeaderboard(board);

      // 3. Fetch Local Routines from IndexedDB
      const localRoutinesList = await getAllRoutines();
      setRoutines(localRoutinesList);

      // 4. Fetch Local Profile from IndexedDB (or initialize it if empty)
      let lProf = await getProfile();
      if (!lProf) {
        lProf = {
          id: 'current',
          displayName: sUser.displayName,
          avatar: '🐰',
          xp: sUser.xp,
          streak: sUser.streak,
          level: sUser.level,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await saveProfile(lProf);
      }
      setLocalProfile(lProf);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('خطا در بارگذاری اطلاعات پایگاه‌داده محلی.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update display name (Server action + Local DB update)
  const handleUpdateProfileName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!displayName.trim() || !serverUser) return;

    try {
      const res = await updateDisplayNameAction(displayName);
      if (res.success && res.user) {
        setServerUser(res.user);
        
        // Sync local IndexedDB profile name as well
        if (localProfile) {
          const updatedLocalProf = { ...localProfile, displayName: displayName.trim() };
          await saveProfile(updatedLocalProf);
          setLocalProfile(updatedLocalProf);
        }

        setMessage('نام نمایشی با موفقیت در لیدربرد و پروفایل بروز شد!');
        const board = await getLeaderboardAction();
        setLeaderboard(board);
      } else {
        setError(res.error || 'خطایی رخ داد.');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور.');
    }
  };

  // Add routine locally in IndexedDB
  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRoutine: Routine = {
      id: 'routine_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      category,
      schedule: { type: 'daily' },
      streak: 0,
      completedToday: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await saveRoutine(newRoutine);
      setTitle('');
      setMessage(`روتین "${newRoutine.title}" با موفقیت ذخیره شد!`);
      const localRoutinesList = await getAllRoutines();
      setRoutines(localRoutinesList);
    } catch (err) {
      setError('خطا در ثبت روتین محلی.');
    }
  };

  // Delete routine locally in IndexedDB
  const handleDeleteRoutine = async (id: string, name: string) => {
    try {
      await deleteRoutine(id);
      setMessage(`روتین "${name}" حذف گردید.`);
      const localRoutinesList = await getAllRoutines();
      setRoutines(localRoutinesList);
    } catch (err) {
      setError('خطا در حذف روتین.');
    }
  };

  // Tick / Complete Routine (adds 15 XP to both server and local profile)
  const handleToggleRoutineCompletion = async (routine: Routine) => {
    const nextCompleted = !routine.completedToday;
    const xpChange = nextCompleted ? 15 : -15; // Complete (+15 XP), uncheck (-15 XP)
    const streakChange = nextCompleted ? 1 : -1;

    try {
      // 1. Update routine state in IndexedDB
      const updatedRoutine: Routine = {
        ...routine,
        completedToday: nextCompleted,
        streak: Math.max(0, routine.streak + streakChange),
        updatedAt: Date.now()
      };
      await saveRoutine(updatedRoutine);

      // 2. Call Server Action to update XP & Streak in Server DB
      const serverRes = await addXpAction(xpChange, streakChange);
      
      if (serverRes.success && serverRes.user) {
        setServerUser(serverRes.user);

        // 3. Update local profile in IndexedDB
        if (localProfile) {
          const updatedLocalProf = {
            ...localProfile,
            xp: serverRes.user.xp,
            level: serverRes.user.level,
            streak: serverRes.user.streak || localProfile.streak
          };
          await saveProfile(updatedLocalProf);
          setLocalProfile(updatedLocalProf);
        }

        setMessage(nextCompleted ? 'آفرین! روتین انجام شد و ۱۵ امتیاز XP گرفتید! 🎉' : 'عادت لغو شد. ۱۵ امتیاز کسر گردید.');
        const board = await getLeaderboardAction();
        setLeaderboard(board);
      }
      
      const localRoutinesList = await getAllRoutines();
      setRoutines(localRoutinesList);
    } catch (err) {
      console.error(err);
      setError('خطا در بروزرسانی وضعیت پیشرفت.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutAction();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900" dir="rtl">
        <div className="text-xl font-bold text-primary animate-pulse">در حال ورود به دنیای هبیت رایدر... 🏄‍♂️🐰</div>
      </div>
    );
  }

  // XP progress calculation for progress bar (each level is 100 XP)
  const xpInCurrentLevel = (serverUser?.xp || 0) % 100;

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 font-sans" dir="rtl">
      
      {/* 1. RIGHT SIDEBAR MENU - Unified SPA Navigation */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-l-2 border-card-border flex flex-col justify-between p-6">
        <div>
          {/* Logo & Mascot */}
          <div className="flex flex-col items-center text-center mb-8 border-b-2 border-card-border pb-6">
            <div className="text-6xl mb-3 hover:scale-110 transition-transform cursor-pointer">🏄‍♂️🐰</div>
            <h1 className="text-2xl font-black text-primary tracking-tight">هبیت رایدر</h1>
            <span className="text-[10px] bg-accent/25 text-accent-down px-2 py-0.5 rounded-full font-extrabold mt-1">
              نسخه آزمایشی v0.1
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-3">
            <button
              onClick={() => { setActiveTab('routines'); setMessage(''); setError(''); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-extrabold text-base transition-all ${
                activeTab === 'routines'
                  ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'text-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-text-main border-2 border-transparent'
              }`}
            >
              <span className="text-xl">📝</span>
              داشبورد عادت‌ها
            </button>

            <button
              onClick={() => { setActiveTab('leaderboard'); setMessage(''); setError(''); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-extrabold text-base transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'text-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-text-main border-2 border-transparent'
              }`}
            >
              <span className="text-xl">🏆</span>
              جدول رده‌بندی
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setMessage(''); setError(''); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-extrabold text-base transition-all ${
                activeTab === 'profile'
                  ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'text-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-text-main border-2 border-transparent'
              }`}
            >
              <span className="text-xl">👤</span>
              تنظیمات پروفایل
            </button>
          </nav>
        </div>

        {/* User Quick Info & Logout */}
        <div className="border-t-2 border-card-border pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-full">🦉</div>
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-text-main truncate">{serverUser?.displayName}</div>
              <div className="text-xs text-text-muted">لول {serverUser?.level}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-3d btn-3d-danger !py-2 text-xs"
          >
            خروج از حساب
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        
        {/* TOP STATUS BAR - Unified header containing gamified stats */}
        <header className="h-20 bg-white dark:bg-zinc-900 border-b-2 border-card-border px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-black text-xl text-text-main">
              {activeTab === 'routines' && '📝 روتین‌های روزانه من'}
              {activeTab === 'leaderboard' && '🏆 رده‌بندی قهرمانان'}
              {activeTab === 'profile' && '👤 ویرایش مشخصات لیدربرد'}
            </span>
          </div>

          {/* Gamified Health / Stats Row */}
          <div className="flex items-center gap-6">
            {/* Streak */}
            <div className="flex items-center gap-2 bg-accent/10 border-2 border-accent/30 px-3.5 py-1.5 rounded-2xl">
              <span className="text-xl">🔥</span>
              <span className="font-extrabold text-accent-down text-sm">{serverUser?.streak || 0} روز</span>
            </div>

            {/* XP and Level Bar */}
            <div className="flex items-center gap-3 bg-primary/10 border-2 border-primary/30 px-3.5 py-1.5 rounded-2xl">
              <span className="text-xl">⚡</span>
              <div className="flex flex-col">
                <span className="font-extrabold text-primary-down text-sm leading-none">{serverUser?.xp} XP</span>
                {/* Micro progress bar */}
                <div className="w-20 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${xpInCurrentLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Health / Hearts */}
            <div className="flex items-center gap-2 bg-danger/10 border-2 border-danger/30 px-3.5 py-1.5 rounded-2xl">
              <span className="text-xl">❤️</span>
              <span className="font-extrabold text-danger text-sm">۵/۵</span>
            </div>
          </div>
        </header>

        {/* VIEW CONTENTS */}
        <div className="p-8 flex-1 overflow-y-auto">
          {message && (
            <div className="mb-6 p-4 rounded-2xl bg-secondary/10 border-2 border-secondary text-secondary font-bold text-center animate-pulse">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-danger/10 border-2 border-danger text-danger font-bold text-center">
              ⚠️ {error}
            </div>
          )}

          {/* VIEW: Routines Tab */}
          {activeTab === 'routines' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Add Routine card */}
              <div className="lg:col-span-1">
                <div className="card-playful">
                  <h2 className="text-xl font-bold mb-4 text-text-main flex items-center gap-2">
                    ➕ افزودن عادت جدید
                  </h2>
                  <form onSubmit={handleCreateRoutine} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-text-muted mb-2">عنوان عادت:</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثلاً: ۳۰ دقیقه ورزش هوازی"
                        className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-text-muted mb-2">دسته‌بندی عادت:</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold text-sm"
                      >
                        <option value="مطالعه">📚 مطالعه و تحقیق</option>
                        <option value="ورزش">💪 ورزش و تندرستی</option>
                        <option value="کدنویسی">💻 برنامه‌نویسی و پروژه</option>
                        <option value="زبان">🗣️ یادگیری زبان</option>
                      </select>
                    </div>

                    <button type="submit" className="w-full btn-3d btn-3d-primary text-sm font-black mt-2">
                      ثبت در پایگاه‌داده محلی
                    </button>
                  </form>
                </div>
              </div>

              {/* Routines list with LOCAL scroll limit */}
              <div className="lg:col-span-2">
                <div className="card-playful">
                  <h2 className="text-xl font-bold mb-1 text-text-main">📋 لیست روتین‌های روزانه</h2>
                  <p className="text-xs text-text-muted mb-4">برای دریافت امتیاز XP، روتین‌های انجام شده خود را تیک بزنید.</p>
                  
                  {/* LOCAL SCROLL CONTAINER - Prevents full page scrolls */}
                  <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
                    {routines.length === 0 ? (
                      <div className="text-center py-12 text-text-muted bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-card-border rounded-2xl">
                        عادی یافت نشد! روتینی اضافه کنید تا مسیر قهرمانی شروع شود.
                      </div>
                    ) : (
                      routines.map((routine) => {
                        let categoryBadgeColor = 'bg-secondary/15 text-secondary border-secondary/35';
                        if (routine.category === 'ورزش') categoryBadgeColor = 'bg-primary/15 text-primary border-primary/35';
                        if (routine.category === 'کدنویسی') categoryBadgeColor = 'bg-purple-500/15 text-purple-600 border-purple-500/35';
                        if (routine.category === 'زبان') categoryBadgeColor = 'bg-accent/15 text-accent-down border-accent/35';

                        return (
                          <div
                            key={routine.id}
                            className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${
                              routine.completedToday
                                ? 'bg-primary/5 border-primary/50'
                                : 'bg-background border-card-border hover:border-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Complete tick button */}
                              <button
                                onClick={() => handleToggleRoutineCompletion(routine)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${
                                  routine.completedToday
                                    ? 'bg-primary border-primary text-white scale-105'
                                    : 'border-card-border bg-zinc-100 hover:border-primary text-transparent'
                                }`}
                              >
                                ✓
                              </button>

                              <div>
                                <div className={`font-bold ${routine.completedToday ? 'line-through text-text-muted' : 'text-text-main'}`}>
                                  {routine.title}
                                </div>
                                <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${categoryBadgeColor}`}>
                                  {routine.category}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {routine.streak > 0 && (
                                <span className="text-xs font-black text-accent-down">
                                  🔥 {routine.streak}
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteRoutine(routine.id, routine.title)}
                                className="btn-3d btn-3d-danger !p-2 text-[10px] font-bold"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="max-w-xl mx-auto card-playful">
              <h2 className="text-xl font-bold mb-4 text-text-main">🏆 جدول رقابتی لیدربرد</h2>
              <div className="space-y-3">
                {leaderboard.map((user, index) => {
                  const isMe = user.username === serverUser?.username;
                  const rank = index + 1;
                  let rankMark = '⭐';
                  if (rank === 1) rankMark = '🥇';
                  else if (rank === 2) rankMark = '🥈';
                  else if (rank === 3) rankMark = '🥉';

                  return (
                    <div
                      key={user.username}
                      className={`flex justify-between items-center p-3.5 rounded-2xl border-2 transition-all ${
                        isMe
                          ? 'border-primary bg-primary/5 font-bold'
                          : 'border-card-border bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xl w-6 text-center font-black text-text-muted">
                          {rankMark === '⭐' ? rank : rankMark}
                        </div>
                        <div className="text-3xl">{user.avatar}</div>
                        <div>
                          <div className="text-sm font-bold text-text-main flex items-center gap-1.5">
                            {user.displayName}
                            {isMe && <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">شما</span>}
                          </div>
                          <div className="text-[10px] text-text-muted">سطح {user.level} • استریک 🔥 {user.streak} روز</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="font-extrabold text-primary-down text-sm">⚡ {user.xp}</span>
                        <span className="text-[9px] text-text-muted block">XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto card-playful">
              <h2 className="text-xl font-bold mb-6 text-text-main">👤 ویرایش مشخصات حساب کاربری</h2>
              
              <form onSubmit={handleUpdateProfileName} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2">نام نمایشی لیدربرد:</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold text-sm"
                    required
                  />
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-card-border rounded-xl space-y-2 text-sm text-right">
                  <div className="flex justify-between">
                    <span className="text-text-muted">نام کاربری سیستمی:</span>
                    <span className="font-bold text-text-main">@{serverUser?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">سطح فعلی:</span>
                    <span className="font-bold text-secondary-down">سطح {serverUser?.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">کل امتیازات (XP):</span>
                    <span className="font-bold text-primary-down">⚡ {serverUser?.xp} XP</span>
                  </div>
                </div>

                <button type="submit" className="w-full btn-3d btn-3d-primary text-sm font-black">
                  بروزرسانی مشخصات
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
