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
import { toast } from 'sonner';

export default function RoutinesView() {
  const { syncUser } = useDashboard();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'remaining' | 'done'>('all');

  const loadRoutines = async () => {
    try {
      const list = await getAllRoutines();
      setRoutines(list);
    } catch (err) {
      console.error(err);
      toast.error('خطا در بارگذاری لیست روتین‌ها. ❌');
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
      toast.success(`روتین "${newRoutine.title}" با موفقیت ذخیره شد! ✅`);
      await loadRoutines();
    } catch (err) {
      toast.error('خطا در ثبت روتین جدید. ❌');
    }
  };

  const handleDeleteRoutine = async (id: string, title: string) => {
    try {
      await deleteRoutine(id);
      toast.success(`روتین "${title}" حذف گردید. 🗑️`);
      await loadRoutines();
    } catch (err) {
      toast.error('خطا در حذف روتین. ❌');
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

        if (nextCompleted) {
          toast.success('آفرین! روتین انجام شد و ۱۵ امتیاز XP گرفتید! 🎉');
        } else {
          toast.info('عادت لغو شد. ۱۵ امتیاز کسر گردید. ℹ️');
        }
      } else {
        toast.error(res.error || 'خطا در بروزرسانی امتیازات در سرور. ❌');
      }
      await loadRoutines();
    } catch (err) {
      console.error(err);
      toast.error('خطا در تغییر وضعیت پیشرفت. ❌');
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
    <div className="space-y-6 animate-pop">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Creation Form Column */}
        <div className="lg:col-span-1">
          <AddRoutineForm onCreate={handleCreateRoutine} />
        </div>

        {/* Routines List & Filters Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Card (Gamified representation) */}
          {totalCount > 0 && (
            <div className="card-playful p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-text-main dark:text-slate-200">
                  🎯 پیشرفت امروز روتین‌ها
                </span>
                <span className="text-xs font-bold text-text-muted">
                  <span className="font-num font-black text-sm text-primary">{completedCount}</span> از <span className="font-num font-black text-sm">{totalCount}</span> عادت (<span className="font-num font-black text-sm text-primary">{completionPercentage}%</span>)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-slate-800/60 h-2.5 rounded-full overflow-hidden border border-zinc-200/30 dark:border-slate-800/40 relative">
                <div
                  className="bg-gradient-to-r from-primary to-primary-down h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute inset-0 shimmer-bg shimmer-anim" />
                </div>
              </div>
            </div>
          )}

          {/* Main List Box */}
          <div className="card-playful">
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-text-main dark:text-slate-100">📋 روتین‌های روزانه</h2>
                <p className="text-xs text-text-muted font-bold mt-1">تیک کارهای انجام شده را بزنید تا امتیاز بگیرید.</p>
              </div>
              
              {/* Filter Tabs Group */}
              <div className="flex bg-zinc-200/40 dark:bg-slate-800/30 p-1 rounded-2xl border border-card-border/50 self-start sm:self-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 ${
                    filter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-primary shadow-sm scale-[1.02]'
                      : 'text-text-muted hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  همه (<span className="font-num">{totalCount}</span>)
                </button>
                <button
                  onClick={() => setFilter('remaining')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 ${
                    filter === 'remaining'
                      ? 'bg-white dark:bg-slate-800 text-primary shadow-sm scale-[1.02]'
                      : 'text-text-muted hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  مانده (<span className="font-num">{remainingCount}</span>)
                </button>
                <button
                  onClick={() => setFilter('done')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 ${
                    filter === 'done'
                      ? 'bg-white dark:bg-slate-800 text-primary shadow-sm scale-[1.02]'
                      : 'text-text-muted hover:text-text-main dark:hover:text-white'
                  }`}
                >
                  انجام شده (<span className="font-num">{completedCount}</span>)
                </button>
              </div>
            </div>

            {/* Scroll container */}
            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3.5 scrollbar-thin">
              {filteredRoutines.length === 0 ? (
                <div className="text-center py-14 text-text-muted font-bold bg-zinc-50/20 dark:bg-slate-800/10 border border-dashed border-card-border rounded-3xl animate-pop">
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
