'use client';

import React, { useState, useEffect } from 'react';
import {
  saveRoutine,
  getAllRoutines,
  deleteRoutine,
  saveProfile,
  getProfile,
  Routine,
  UserProfile,
  RoutineResource
} from '../../services/db';
import { addXpAction, reportCopyrightAction } from '../../actions/auth';
import { useDashboard } from './dashboard-context';
import RoutineItem from './routine-item';
import AddRoutineForm from './add-routine-form';
import { toast } from 'sonner';

// Helper to get YYYY-MM-DD in local time
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper to check if a routine is scheduled for a given date
const isRoutineScheduledForDate = (routine: Routine, date: Date): boolean => {
  const schedule = routine.schedule;
  if (!schedule || schedule.type === 'daily') return true;

  if (schedule.type === 'weekly' || schedule.type === 'custom') {
    if (!schedule.days || schedule.days.length === 0) return false;
    // JS getDay() returns 0 for Sunday, 1 for Monday, etc.
    const day = date.getDay();
    return schedule.days.includes(day);
  }

  if (schedule.type === 'monthly') {
    const dayOfMonth = date.getDate();
    return schedule.dayOfMonth === dayOfMonth;
  }

  return true;
};

export default function RoutinesView() {
  const { syncUser } = useDashboard();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'remaining' | 'done'>('all');
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [reportingResource, setReportingResource] = useState<{ routine: Routine; resource: RoutineResource } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const loadRoutines = async () => {
    try {
      const list = await getAllRoutines();
      const todayString = getTodayString();
      let updatedList = [...list];
      let hasChanges = false;

      // Reset routines completed status if a new day has started
      for (let i = 0; i < updatedList.length; i++) {
        const routine = updatedList[i];
        
        // If the routine is completed, but the last completed date is not today,
        // we reset the completed state for the new day.
        if (routine.completedToday && routine.lastCompletedDate !== todayString) {
          updatedList[i] = {
            ...routine,
            completedToday: false,
            updatedAt: Date.now()
          };
          await saveRoutine(updatedList[i]);
          hasChanges = true;
        } 
        // If a new day has started, and the routine was NOT completed,
        // we reset the streak to 0 (unless it was already 0).
        // To be safe, we check if there's a last completed date and it's not today.
        else if (!routine.completedToday && routine.lastCompletedDate && routine.lastCompletedDate !== todayString) {
          // Check if it was scheduled between the lastCompletedDate and today to break streak
          // For simplicity and standard habit tracking, we reset streak if they missed it on a new day.
          if (routine.streak > 0) {
            updatedList[i] = {
              ...routine,
              streak: 0,
              updatedAt: Date.now()
            };
            await saveRoutine(updatedList[i]);
            hasChanges = true;
          }
        }
      }

      setRoutines(updatedList);
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

  const handleCreateRoutine = async (
    title: string,
    category: string,
    schedule: Routine['schedule'],
    extraFields?: Partial<Routine>
  ) => {
    const newRoutine: Routine = {
      id: 'routine_' + Math.random().toString(36).substring(2, 9),
      title,
      category,
      schedule,
      streak: 0,
      completedToday: false,
      ...extraFields,
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

  const handleUpdateRoutine = async (updatedRoutine: Routine) => {
    try {
      // Find old routine to see if completion state has changed
      const oldRoutine = routines.find((r) => r.id === updatedRoutine.id);
      const completionChanged = oldRoutine && oldRoutine.completedToday !== updatedRoutine.completedToday;

      await saveRoutine(updatedRoutine);

      if (completionChanged) {
        const nextCompleted = updatedRoutine.completedToday;
        const xpChange = nextCompleted ? 15 : -15;
        const streakChange = nextCompleted ? 1 : -1;

        // Sync XP/Streak on Server
        const res = await addXpAction(xpChange, streakChange);
        if (res.success && res.data) {
          // Sync context stats
          syncUser(res.data);

          // Sync local IndexedDB profile
          const localProf = await getProfile();
          if (localProf) {
            const updatedLocalProf: UserProfile = {
              ...localProf,
              xp: res.data.xp,
              level: res.data.level,
              streak: res.data.streak,
              updatedAt: Date.now(),
            };
            await saveProfile(updatedLocalProf);
          }
        }
      } else {
        toast.success(`تغییرات روتین "${updatedRoutine.title}" ثبت شد! 📝`);
      }

      setEditingRoutine(null);
      await loadRoutines();
    } catch (err) {
      toast.error('خطا در بروزرسانی روتین. ❌');
    }
  };

  const handleSendReport = async () => {
    if (!reportingResource) return;
    if (!reportReason.trim()) {
      toast.error('لطفاً دلیل تخلف را بنویسید.');
      return;
    }

    setIsReporting(true);
    try {
      const res = await reportCopyrightAction(
        reportingResource.routine.id,
        reportingResource.routine.title,
        reportingResource.resource.name,
        reportingResource.resource.url,
        reportReason.trim()
      );
      if (res.success) {
        toast.success('گزارش تخلف کپی‌رایت شما با موفقیت ثبت شد و بررسی خواهد شد. ⚠️');
        setReportingResource(null);
        setReportReason('');
      } else {
        toast.error(res.error || 'خطا در ثبت گزارش تخلف. ❌');
      }
    } catch (err) {
      toast.error('خطای سیستمی رخ داد. ❌');
    } finally {
      setIsReporting(false);
    }
  };

  const handleDeleteRoutine = async (id: string, title: string) => {
    try {
      await deleteRoutine(id);
      toast.success(`روتین "${title}" حذف گردید. 🗑️`);
      if (editingRoutine?.id === id) {
        setEditingRoutine(null);
      }
      await loadRoutines();
    } catch (err) {
      toast.error('خطا در حذف روتین. ❌');
    }
  };

  const handleToggleRoutineCompletion = async (routine: Routine) => {
    const nextCompleted = !routine.completedToday;
    const xpChange = nextCompleted ? 15 : -15;
    const streakChange = nextCompleted ? 1 : -1;
    const todayString = getTodayString();

    try {
      // 1. Update in IndexedDB
      const updatedRoutine: Routine = {
        ...routine,
        completedToday: nextCompleted,
        streak: Math.max(0, routine.streak + streakChange),
        lastCompletedDate: nextCompleted ? todayString : routine.lastCompletedDate,
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

  // Base list of routines filtering by viewMode (today vs all)
  const baseRoutines = routines.filter((r) => {
    if (viewMode === 'today') {
      return isRoutineScheduledForDate(r, new Date());
    }
    return true;
  });

  // Stats calculation based on today's routines
  const todayCount = routines.filter(r => isRoutineScheduledForDate(r, new Date())).length;
  const todayCompletedCount = routines.filter(r => isRoutineScheduledForDate(r, new Date()) && r.completedToday).length;
  const completionPercentage = todayCount > 0 ? Math.round((todayCompletedCount / todayCount) * 100) : 0;

  // Filter implementation (All, Remaining, Done)
  const filteredRoutines = baseRoutines.filter(r => {
    if (filter === 'remaining') return !r.completedToday;
    if (filter === 'done') return r.completedToday;
    return true;
  });

  const totalCount = baseRoutines.length;
  const completedCount = baseRoutines.filter(r => r.completedToday).length;
  const remainingCount = totalCount - completedCount;

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
        
        {/* Creation & Edit Form Column */}
        <div className="lg:col-span-1">
          <AddRoutineForm
            onCreate={handleCreateRoutine}
            editingRoutine={editingRoutine}
            onUpdate={handleUpdateRoutine}
            onCancelEdit={() => setEditingRoutine(null)}
          />
        </div>

        {/* Routines List & Filters Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Card (Gamified representation for today) */}
          {todayCount > 0 && (
            <div className="card-playful p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black text-text-main dark:text-slate-200">
                  🎯 پیشرفت روتین‌های امروز
                </span>
                <span className="text-xs font-bold text-text-muted">
                  <span className="font-num font-black text-sm text-primary">{todayCompletedCount}</span> از <span className="font-num font-black text-sm">{todayCount}</span> عادت (<span className="font-num font-black text-sm text-primary">{completionPercentage}%</span>)
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
            
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-text-main dark:text-slate-100 flex items-center gap-2">
                  <span>📋</span>
                  {viewMode === 'today' ? 'روتین‌های امروز شما' : 'همه روتین‌های تعریف شده'}
                </h2>
                <p className="text-xs text-text-muted font-bold mt-1">تیک کارهای انجام شده را بزنید تا امتیاز بگیرید.</p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {/* View Mode Switcher (Today vs All) */}
                <div className="flex bg-zinc-200/40 dark:bg-slate-800/30 p-1 rounded-2xl border border-card-border/50">
                  <button
                    onClick={() => setViewMode('today')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-300 cursor-pointer ${
                      viewMode === 'today'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-main dark:hover:text-white'
                    }`}
                  >
                    امروز
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-300 cursor-pointer ${
                      viewMode === 'all'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-main dark:hover:text-white'
                    }`}
                  >
                    همه عادت‌ها
                  </button>
                </div>

                {/* Filter Tabs Group */}
                <div className="flex bg-zinc-200/40 dark:bg-slate-800/30 p-1 rounded-2xl border border-card-border/50">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-300 cursor-pointer ${
                      filter === 'all'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-main dark:hover:text-white'
                    }`}
                  >
                    کل (<span className="font-num">{totalCount}</span>)
                  </button>
                  <button
                    onClick={() => setFilter('remaining')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-300 cursor-pointer ${
                      filter === 'remaining'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-main dark:hover:text-white'
                    }`}
                  >
                    مانده (<span className="font-num">{remainingCount}</span>)
                  </button>
                  <button
                    onClick={() => setFilter('done')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all duration-300 cursor-pointer ${
                      filter === 'done'
                        ? 'bg-white dark:bg-slate-800 text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-main dark:hover:text-white'
                    }`}
                  >
                    انجام شده (<span className="font-num">{completedCount}</span>)
                  </button>
                </div>
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
                    : viewMode === 'today'
                    ? 'امروز هیچ روتینی در برنامه شما نیست! می‌توانید به تب «همه عادت‌ها» مراجعه کنید.'
                    : 'روتینی یافت نشد! یک روتین جدید بسازید تا ماجراجویی آغاز شود.'}
                </div>
              ) : (
                filteredRoutines.map((routine) => (
                  <RoutineItem
                    key={routine.id}
                    routine={routine}
                    onToggle={handleToggleRoutineCompletion}
                    onDelete={handleDeleteRoutine}
                    onEdit={setEditingRoutine}
                    onUpdate={handleUpdateRoutine}
                    onReportCopyright={(rot, res) => setReportingResource({ routine: rot, resource: res })}
                  />
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Copyright violation report modal */}
      {reportingResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-pop">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-card-border shadow-2xl space-y-4" dir="rtl">
            <h3 className="text-sm font-black text-text-main dark:text-slate-100 flex items-center gap-2">
              <span>⚠️</span> گزارش نقض کپی‌رایت منبع
            </h3>
            <p className="text-xs text-text-muted font-medium">
              در حال گزارش منبع <span className="font-bold text-text-main dark:text-slate-200">«{reportingResource.resource.name}»</span> مربوط به روتین <span className="font-bold text-text-main dark:text-slate-200">«{reportingResource.routine.title}»</span>.
            </p>
            <div className="space-y-2">
              <label htmlFor="report-reason" className="block text-[11px] font-black text-text-muted">علت گزارش/نقض کپی‌رایت:</label>
              <textarea
                id="report-reason"
                rows={3}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="مثال: این کتاب دارای کپی‌رایت رسمی است..."
                className="w-full px-3 py-2 rounded-xl border border-card-border bg-zinc-500/5 text-text-main text-xs font-medium focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setReportingResource(null); setReportReason(''); }}
                disabled={isReporting}
                className="flex-1 py-2 bg-zinc-200 dark:bg-slate-800 text-text-main text-xs font-black rounded-xl cursor-pointer border-0"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSendReport}
                disabled={isReporting}
                className="flex-1 py-2 bg-danger text-white text-xs font-black rounded-xl cursor-pointer shadow-md hover:bg-danger-down border-0"
              >
                {isReporting ? 'در حال ثبت...' : 'ثبت گزارش ⚠️'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
