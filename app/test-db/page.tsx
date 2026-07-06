"use client";

import React, { useState, useEffect } from 'react';
import {
  saveRoutine,
  getAllRoutines,
  deleteRoutine,
  saveProfile,
  getProfile,
  Routine,
  UserProfile
} from '../services/db';

// Enable debug mode logs on client console
if (typeof window !== 'undefined') {
  (window as any).DEV_MODE = true;
}

export default function TestDBPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('مطالعه');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch from IndexedDB
  const refreshData = async () => {
    try {
      const list = await getAllRoutines();
      setRoutines(list);
      
      const prof = await getProfile();
      if (prof) {
        setProfile(prof);
        setDisplayName(prof.displayName);
      }
    } catch (error) {
      console.error('Failed to load data from IndexedDB:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

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
      await refreshData();
    } catch (error) {
      setMessage('خطا در ذخیره‌سازی روتین.');
      console.error(error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteRoutine(id);
      setMessage(`روتین "${name}" حذف شد.`);
      await refreshData();
    } catch (error) {
      setMessage('خطا در حذف روتین.');
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const newXP = (profile?.xp || 0) + 15; // Incremental XP
    const newStreak = (profile?.streak || 0) + 1;
    const currentLvl = Math.floor(newXP / 100) + 1;

    const updatedProfile: UserProfile = {
      id: 'current',
      displayName: displayName.trim(),
      avatar: '🦉', // Duo owl
      xp: newXP,
      streak: newStreak,
      level: currentLvl,
      createdAt: profile?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    try {
      await saveProfile(updatedProfile);
      setMessage('پروفایل با موفقیت بروزرسانی شد و ۱۵ امتیاز XP گرفتید!');
      await refreshData();
    } catch (error) {
      setMessage('خطا در ذخیره پروفایل.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <header className="text-center my-8">
        <h1 className="text-4xl font-extrabold text-primary mb-2 flex items-center justify-center gap-2">
          <span>🦉</span> هبیت رایدر (HabbitRider)
        </h1>
        <p className="text-text-muted">محیط تست مستقل کلاینت و بررسی صحت عملکرد IndexedDB</p>
      </header>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-secondary/10 border-2 border-secondary text-secondary font-bold text-center">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Profile Card */}
        <div className="card-playful flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-text-main flex items-center gap-2">
              👤 اطلاعات پروفایل لیدربرد
            </h2>
            
            {profile ? (
              <div className="bg-background border-2 border-card-border p-4 rounded-2xl mb-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl">{profile.avatar}</div>
                  <div>
                    <div className="text-xl font-bold text-text-main">{profile.displayName}</div>
                    <div className="text-sm text-text-muted">لول {profile.level}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-accent/15 border-2 border-accent rounded-xl p-2">
                    <div className="text-xs text-text-muted">استریک (روز)</div>
                    <div className="text-lg font-bold text-accent-down">🔥 {profile.streak} روز</div>
                  </div>
                  <div className="bg-primary/15 border-2 border-primary rounded-xl p-2">
                    <div className="text-xs text-text-muted">امتیاز کل (XP)</div>
                    <div className="text-lg font-bold text-primary-down">⚡ {profile.xp} XP</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-text-muted bg-background border-2 border-dashed border-card-border rounded-2xl mb-6">
                پروفایلی پیدا نشد. نام خود را زیر ثبت کنید تا ایجاد شود!
              </div>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">نام نمایشی در لیدربرد:</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="مثلاً: ابومهدی"
                className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-secondary transition-all"
                required
              />
            </div>
            <button type="submit" className="w-full btn-3d btn-3d-secondary">
              بروزرسانی پروفایل و کسب XP
            </button>
          </form>
        </div>

        {/* Routines Management Card */}
        <div className="card-playful">
          <h2 className="text-2xl font-bold mb-4 text-text-main">📝 ایجاد روتین جدید</h2>
          <form onSubmit={handleCreateRoutine} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">عنوان روتین عادت:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مطالعه روزانه ۵ صفحه کتاب"
                className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-2">دسته‌بندی:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all"
              >
                <option value="مطالعه">📚 مطالعه و تحقیق</option>
                <option value="ورزش">💪 ورزش و تندرستی</option>
                <option value="کدنویسی">💻 برنامه‌نویسی و پروژه</option>
                <option value="زبان">🗣️ یادگیری زبان</option>
              </select>
            </div>

            <button type="submit" className="w-full btn-3d btn-3d-primary">
              ثبت روتین در IndexedDB
            </button>
          </form>

          <div>
            <h3 className="text-lg font-bold text-text-main mb-3">روتین‌های ثبت شده محلی ({routines.length})</h3>
            {routines.length === 0 ? (
              <div className="text-center py-6 text-text-muted bg-background border-2 border-dashed border-card-border rounded-2xl">
                هیچ روتینی ثبت نشده است. اولین روتین خود را بسازید!
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="flex justify-between items-center p-3 rounded-xl border-2 border-card-border bg-background hover:border-text-muted transition-all"
                  >
                    <div>
                      <div className="font-bold text-text-main">{routine.title}</div>
                      <div className="text-xs text-text-muted">دسته‌بندی: {routine.category}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(routine.id, routine.title)}
                      className="btn-3d btn-3d-danger !p-2 text-xs"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="text-center mt-12 text-xs text-text-muted">
        تمامی روتین‌ها و آمار به صورت محلی روی همین مرورگر در IndexedDB ذخیره شده و با لود مجدد صفحه باقی می‌مانند.
      </footer>
    </div>
  );
}
