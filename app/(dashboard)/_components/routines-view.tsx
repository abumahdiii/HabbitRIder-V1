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
  const [filter, setFilter] = useState<'all' | 'remaining' | 'done'>('all');

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

  // Stats calculation
  const totalCount = routines.length;
  const completedCount = routines.filter(r => r.completedToday).length;
  const remainingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter implementation
  const filteredRoutines = routines.filter(r => {
    if (filter === 'remaining') return !r.completedToday;
    if (filter === 'done') return r.completedToday;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-slate-800 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-64 bg-zinc-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-20 bg-zinc-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            <div className="h-20 bg-zinc-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
            <div className="h-20 bg-zinc-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Feedback */}
      {message && (
        <div className="p-4 rounded-2xl bg-secondary/15 border-2 border-secondary/35 text-secondary font-black text-center animate-pop">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-danger/10 border-2 border-danger/30 text-danger font-black text-center animate-pop">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creation Form Column */}
        <div className="lg:col-span-1">
          <AddRoutineForm onCreate={handleCreateRoutine} />
        </div>

        {/* Routines List & Filters Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Card (Gamified representation) */}
          {totalCount > 0 && (
            <div className="card-playful bg-white dark:bg-slate-900 border-card-border p-5">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-black text-text-main dark:text-slate-200">
                  🎯 پیشرفت امروز روتین‌ها
                </span>
                <span className="text-xs font-bold text-primary-down">
                  {completedCount} از {totalCount} عادت ({completionPercentage}٪)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden border border-zinc-200/50 dark:border-slate-800 relative">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute inset-0 shimmer-bg shimmer-anim" />
                </div>
              </div>
            </div>
          )}

          {/* Main List Box */}
          <div className="card-playful bg-white dark:bg-slate-900 border-card-border">
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-text-main dark:text-slate-100">📋 روتین‌های روزانه</h2>
                <p className="text-xs text-text-muted font-bold mt-1">تیک کارهای انجام شده را بزنید تا امتیاز بگیرید.</p>
              </div>
              
              {/* Filter Tabs Group */}
              <div className="flex bg-zinc-100 dark:bg-slate-800/80 p-1 rounded-xl border border-zinc-200/50 dark:border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    filter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  همه ({totalCount})
                </button>
                <button
                  onClick={() => setFilter('remaining')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    filter === 'remaining'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  مانده ({remainingCount})
                </button>
                <button
                  onClick={() => setFilter('done')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    filter === 'done'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  انجام شده ({completedCount})
                </button>
              </div>
            </div>

            {/* Scroll container */}
            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3.5 scrollbar-thin">
              {filteredRoutines.length === 0 ? (
                <div className="text-center py-14 text-text-muted font-bold bg-zinc-50/50 dark:bg-slate-800/20 border-2 border-dashed border-card-border rounded-3xl animate-pop">
                  <div className="text-5xl mb-3 select-none animate-float">🏄‍♂️🐰</div>
                  {filter === 'remaining'
                    ? 'تبریک! روتین مانده‌ای برای انجام وجود ندارد. 🏆'
                    : filter === 'done'
                    ? 'هنوز هیچ روتینی را تکمیل نکرده‌اید! دست به کار شوید. ⚡'
                    : 'روتینی یافت نشد! یک روتین جدید بسازید تا ماجراجویی آغاز شود.'}
                </div>
              ) : (
                filteredRoutines.map((routine) => (
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
