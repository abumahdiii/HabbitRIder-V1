'use client';

import React from 'react';
import { Routine } from '../../services/db';

interface RoutineItemProps {
  routine: Routine;
  onToggle: (routine: Routine) => void;
  onDelete: (id: string, title: string) => void;
  onEdit: (routine: Routine) => void;
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

export default function RoutineItem({ routine, onToggle, onDelete, onEdit }: RoutineItemProps) {
  let categoryBadgeColor = 'bg-indigo-500/5 text-indigo-600 border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400';
  if (routine.category === 'ورزش') {
    categoryBadgeColor = 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-400';
  } else if (routine.category === 'کدنویسی') {
    categoryBadgeColor = 'bg-purple-500/5 text-purple-600 border-purple-500/10 dark:bg-purple-500/10 dark:text-purple-400';
  } else if (routine.category === 'زبان') {
    categoryBadgeColor = 'bg-amber-500/5 text-amber-600 border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-400';
  }

  return (
    <div
      className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 ${
        routine.completedToday
          ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-xs'
          : 'bg-white/50 dark:bg-slate-900/35 border-card-border hover:border-zinc-300 dark:hover:border-slate-700'
      }`}
    >
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
  );
}
