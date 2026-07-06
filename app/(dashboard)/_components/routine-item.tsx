'use client';

import React, { useState } from 'react';
import { Routine, RoutineResource } from '../../services/db';
import { reportCopyrightAction } from '../../actions/auth';
import { toast } from 'sonner';

interface RoutineItemProps {
  routine: Routine;
  onToggle: (routine: Routine) => void;
  onDelete: (id: string, title: string) => void;
  onEdit: (routine: Routine) => void;
  onUpdate?: (updatedRoutine: Routine) => Promise<void>;
}

const dayLabels: Record<number, string> = {
  6: 'شنبه',
  0: 'یکشنبه',
  1: 'دوشنبه',
  2: 'سه‌شنبه',
  3: 'چهارشنبه',
  4: 'پنجشنبه',
  5: 'جمعه',
};

const sortPersianDays = (days: number[]) => {
  const order = [6, 0, 1, 2, 3, 4, 5];
  return [...days].sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

function getScheduleText(schedule: Routine['schedule']): string {
  if (!schedule) return 'هر روز';
  
  switch (schedule.type) {
    case 'daily':
      return 'هر روز';
    case 'weekly':
    case 'custom':
      if (!schedule.days || schedule.days.length === 0) return 'زمان‌بندی نشده';
      if (schedule.days.length === 7) return 'هر روز';
      const sortedDays = sortPersianDays(schedule.days);
      const names = sortedDays.map(d => dayLabels[d]);
      return `روزهای ${names.join('، ')}`;
    case 'monthly':
      return `روز ${schedule.dayOfMonth || 1}ام هر ماه`;
    default:
      return 'هر روز';
  }
}

export default function RoutineItem({ routine, onToggle, onDelete, onEdit, onUpdate }: RoutineItemProps) {
  const [showChapters, setShowChapters] = useState(false);
  const [reportResource, setReportResource] = useState<RoutineResource | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  let categoryBadgeColor = 'bg-indigo-500/5 text-indigo-600 border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400';
  if (routine.category === 'ورزش') {
    categoryBadgeColor = 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-400';
  } else if (routine.category === 'کدنویسی') {
    categoryBadgeColor = 'bg-purple-500/5 text-purple-600 border-purple-500/10 dark:bg-purple-500/10 dark:text-purple-400';
  } else if (routine.category === 'زبان') {
    categoryBadgeColor = 'bg-amber-500/5 text-amber-600 border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-400';
  }

  const handleToggleChapter = async (chapterId: string) => {
    if (!routine.chapters || !onUpdate) return;

    const todayString = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const updatedChapters = routine.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
    );

    const completedChaptersCount = updatedChapters.filter((ch) => ch.completed).length;

    // Check if the specific chapter was completed (checked)
    const targetCh = routine.chapters.find((ch) => ch.id === chapterId);
    const wasCompleted = targetCh ? targetCh.completed : false;
    const isNowCompleted = !wasCompleted;

    let completedToday = routine.completedToday;
    let lastCompletedDate = routine.lastCompletedDate;
    let streak = routine.streak;

    if (isNowCompleted && !routine.completedToday) {
      completedToday = true;
      lastCompletedDate = todayString();
      streak = routine.streak + 1;
      toast.success('جلسه تکمیل شد! روتین امروز شما تیک خورد. 🎉');
    }

    const updatedRoutine: Routine = {
      ...routine,
      chapters: updatedChapters,
      currentProgressSession: completedChaptersCount,
      completedToday,
      lastCompletedDate,
      streak,
      updatedAt: Date.now(),
    };

    await onUpdate(updatedRoutine);
  };

  const handleSendReport = async () => {
    if (!reportResource) return;
    if (!reportReason.trim()) {
      toast.error('لطفاً دلیل تخلف را بنویسید.');
      return;
    }

    setIsReporting(true);
    try {
      const res = await reportCopyrightAction(
        routine.id,
        routine.title,
        reportResource.name,
        reportResource.url,
        reportReason.trim()
      );
      if (res.success) {
        toast.success('گزارش تخلف کپی‌رایت شما با موفقیت ثبت شد و بررسی خواهد شد. ⚠️');
        setReportResource(null);
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

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 space-y-1 ${
        routine.completedToday
          ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-xs'
          : 'bg-white/50 dark:bg-slate-900/35 border-card-border hover:border-zinc-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Playful Circle Checkbox */}
          <button
            onClick={() => onToggle(routine)}
            aria-label={routine.completedToday ? `لغو علامت گذاری ${routine.title}` : `علامت گذاری ${routine.title} به عنوان انجام شده`}
            className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 relative ${
              routine.completedToday
                ? 'bg-gradient-to-tr from-primary to-primary-down text-white scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)] rotate-6 border border-primary-down/50'
                : 'border border-card-border bg-zinc-50/50 dark:bg-slate-800/30 hover:border-primary/60 hover:bg-primary/5 text-transparent cursor-pointer'
            }`}
          >
            {routine.completedToday ? (
              <span className="animate-pop text-sm">✓</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-slate-600 transition-colors hover:bg-primary/80" />
            )}
          </button>

          <div>
            <div className={`font-black text-sm transition-all ${
              routine.completedToday 
                ? 'line-through text-text-muted dark:text-slate-500' 
                : 'text-text-main dark:text-slate-100'
            }`}>
              {routine.title}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[9px] border px-2 py-0.5 rounded-full font-black inline-block ${categoryBadgeColor}`}>
                {routine.category}
              </span>
              <span className="text-[9px] font-bold text-text-muted dark:text-slate-400 flex items-center gap-1">
                📅 {getScheduleText(routine.schedule)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Streak Badge */}
          {routine.streak > 0 && (
            <span className="text-[10px] font-black text-accent-down dark:text-accent font-num flex items-center gap-1 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 px-2 py-1 rounded-xl">
              🔥 {routine.streak}
            </span>
          )}
          
          {/* Edit Button */}
          <button
            onClick={() => onEdit(routine)}
            className="p-2 text-text-muted hover:text-primary dark:hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer text-xs"
            aria-label={`ویرایش روتین ${routine.title}`}
          >
            ✏️
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(routine.id, routine.title)}
            className="p-2 text-text-muted hover:text-danger dark:hover:text-rose-400 rounded-xl hover:bg-danger/10 dark:hover:bg-rose-500/10 transition-all duration-200 cursor-pointer text-xs"
            aria-label={`حذف روتین ${routine.title}`}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Resources List */}
      {routine.resources && routine.resources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-card-border/30 space-y-2">
          <span className="text-[10px] font-black text-text-muted dark:text-slate-400 block">📚 منابع آموزشی پیوست:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {routine.resources.map((res) => (
              <div key={res.id} className="flex justify-between items-center bg-zinc-200/20 dark:bg-slate-800/20 px-2.5 py-1.5 rounded-xl border border-card-border/30 text-xs">
                <a
                  href={res.url}
                  download={res.type === 'pdf' ? res.name + '.pdf' : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-black text-secondary dark:text-sky-400 hover:underline truncate"
                >
                  <span>{res.type === 'pdf' ? '📄' : '🔗'}</span>
                  <span className="truncate max-w-[120px]">{res.name}</span>
                </a>
                <button
                  onClick={() => setReportResource(res)}
                  title="گزارش تخلف کپی‌رایت"
                  className="p-1 text-[10px] text-text-muted hover:text-danger rounded-md hover:bg-danger/10 transition-all cursor-pointer border-0 bg-transparent"
                >
                  ⚠️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progressive Study Progress */}
      {routine.isProgressive && (
        <div className="mt-3 pt-3 border-t border-card-border/30 space-y-2.5">
          <div className="flex justify-between items-center text-[10px] font-black text-text-muted dark:text-slate-400">
            <span>📖 پیشرفت مطالعه:</span>
            <span>
              <span className="font-num text-xs font-black text-primary">
                {routine.currentProgressSession || 0}
              </span>{' '}
              از{' '}
              <span className="font-num text-xs font-black">
                {routine.totalProgressSessions || 0}
              </span>{' '}
              جلسه ({Math.round(((routine.currentProgressSession || 0) / (routine.totalProgressSessions || 1)) * 100)}%)
            </span>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-slate-800/40 h-2 rounded-full overflow-hidden border border-zinc-200/20 dark:border-slate-800/30 relative">
            <div
              className="bg-gradient-to-r from-secondary to-secondary-down h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round(((routine.currentProgressSession || 0) / (routine.totalProgressSessions || 1)) * 100)}%` }}
            />
          </div>

          {/* Toggle Chapters List Button */}
          {routine.chapters && routine.chapters.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowChapters(!showChapters)}
                className="text-[10px] font-black text-secondary hover:text-secondary-down flex items-center gap-1 cursor-pointer border-0 bg-transparent"
              >
                {showChapters ? '▼ بستن لیست جلسات' : '▲ مشاهده لیست جلسات'}
              </button>

              {showChapters && (
                <div className="p-2 bg-zinc-50/50 dark:bg-slate-900/20 rounded-xl border border-card-border/40 space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin animate-pop">
                  {routine.chapters.map((ch) => (
                    <div key={ch.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={ch.completed}
                        onChange={() => handleToggleChapter(ch.id)}
                        disabled={!onUpdate}
                        className="w-4 h-4 rounded-md border-card-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                      />
                      <span className={`font-bold transition-all ${
                        ch.completed ? 'line-through text-text-muted dark:text-slate-500' : 'text-text-main dark:text-slate-200'
                      }`}>
                        {ch.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Copyright violation report modal */}
      {reportResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-pop">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-card-border shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-text-main dark:text-slate-100 flex items-center gap-2">
              <span>⚠️</span> گزارش نقض کپی‌رایت منبع
            </h3>
            <p className="text-xs text-text-muted font-medium">
              در حال گزارش منبع <span className="font-bold text-text-main dark:text-slate-200">«{reportResource.name}»</span> مربوط به روتین <span className="font-bold text-text-main dark:text-slate-200">«{routine.title}»</span>.
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
                onClick={() => { setReportResource(null); setReportReason(''); }}
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
