'use client';

import React, { useState, useEffect } from 'react';
import {
  saveRoutine,
  getAllRoutines,
  deleteRoutine,
  saveProfile,
  getProfile,
  Routine,
  UserProfile
} from '../../services/db';
import { addXpAction } from '../../actions/auth';
import { useDashboard } from './dashboard-context';
import RoutineItem from './routine-item';
import AddRoutineForm from './add-routine-form';

export default function RoutinesView() {
  const { syncUser } = useDashboard();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadRoutines = async () => {
    try {
      const list = await getAllRoutines();
      setRoutines(list);
    } catch (err) {
      console.error(err);
      setError('خطا در بارگذاری لیست روتین‌ها.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleCreateRoutine = async (title: string, category: string) => {
    const newRoutine: Routine = {
      id: 'routine_' + Math.random().toString(36).substring(2, 9),
      title,
      category,
      schedule: { type: 'daily' },
      streak: 0,
      completedToday: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await saveRoutine(newRoutine);
      setMessage(`روتین "${newRoutine.title}" با موفقیت ذخیره شد!`);
      setTimeout(() => setMessage(''), 3000);
      await loadRoutines();
    } catch (err) {
      setError('خطا در ثبت روتین جدید.');
    }
  };

  const handleDeleteRoutine = async (id: string, title: string) => {
    try {
      await deleteRoutine(id);
      setMessage(`روتین "${title}" حذف گردید.`);
      setTimeout(() => setMessage(''), 3000);
      await loadRoutines();
    } catch (err) {
      setError('خطا در حذف روتین.');
    }
  };

  const handleToggleRoutineCompletion = async (routine: Routine) => {
    const nextCompleted = !routine.completedToday;
    const xpChange = nextCompleted ? 15 : -15;
    const streakChange = nextCompleted ? 1 : -1;

    try {
      // 1. Update in IndexedDB
      const updatedRoutine: Routine = {
        ...routine,
        completedToday: nextCompleted,
        streak: Math.max(0, routine.streak + streakChange),
        updatedAt: Date.now()
      };
      await saveRoutine(updatedRoutine);

      // 2. Call Server Action to sync XP/Streak on Server
      const res = await addXpAction(xpChange, streakChange);
      if (res.success && res.data) {
        // Sync context stats
        syncUser(res.data);

        // 3. Sync local IndexedDB profile
        const localProf = await getProfile();
        if (localProf) {
          const updatedLocalProf: UserProfile = {
            ...localProf,
            xp: res.data.xp,
            level: res.data.level,
            streak: res.data.streak,
            updatedAt: Date.now()
          };
          await saveProfile(updatedLocalProf);
        }

        setMessage(
          nextCompleted
            ? 'آفرین! روتین انجام شد و ۱۵ امتیاز XP گرفتید! 🎉'
            : 'عادت لغو شد. ۱۵ امتیاز کسر گردید.'
        );
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(res.error || 'خطا در بروزرسانی امتیازات در سرور.');
      }
      await loadRoutines();
    } catch (err) {
      console.error(err);
      setError('خطا در تغییر وضعیت پیشرفت.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-2xl" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-20 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            <div className="h-20 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            <div className="h-20 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 rounded-2xl bg-secondary/10 border-2 border-secondary text-secondary font-bold text-center animate-fade-in">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-danger/10 border-2 border-danger text-danger font-bold text-center">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add routine form column */}
        <div className="lg:col-span-1">
          <AddRoutineForm onCreate={handleCreateRoutine} />
        </div>

        {/* Routines list column */}
        <div className="lg:col-span-2">
          <div className="card-playful">
            <h2 className="text-xl font-bold mb-1 text-text-main">📋 لیست روتین‌های روزانه</h2>
            <p className="text-xs text-text-muted mb-4">برای دریافت امتیاز XP، روتین‌های انجام شده خود را تیک بزنید.</p>
            
            {/* Scroll container */}
            <div className="max-h-[420px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
              {routines.length === 0 ? (
                <div className="text-center py-12 text-text-muted bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-card-border rounded-2xl">
                  <div className="text-4xl mb-2">🏄‍♂️🐰</div>
                  عادتی یافت نشد! روتینی اضافه کنید تا مسیر قهرمانی شروع شود.
                </div>
              ) : (
                routines.map((routine) => (
                  <RoutineItem
                    key={routine.id}
                    routine={routine}
                    onToggle={handleToggleRoutineCompletion}
                    onDelete={handleDeleteRoutine}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
