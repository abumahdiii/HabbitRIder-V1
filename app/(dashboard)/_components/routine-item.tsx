'use client';

import React from 'react';
import { Routine } from '../../services/db';

interface RoutineItemProps {
  routine: Routine;
  onToggle: (routine: Routine) => void;
  onDelete: (id: string, title: string) => void;
}

export default function RoutineItem({ routine, onToggle, onDelete }: RoutineItemProps) {
  let categoryBadgeColor = 'bg-secondary/10 text-secondary border-secondary/30 dark:bg-secondary/20';
  if (routine.category === 'ورزش') {
    categoryBadgeColor = 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20';
  } else if (routine.category === 'کدنویسی') {
    categoryBadgeColor = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:bg-purple-500/20';
  } else if (routine.category === 'زبان') {
    categoryBadgeColor = 'bg-accent/10 text-accent-down border-accent/30 dark:bg-accent/20';
  }

  return (
    <div
      className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
        routine.completedToday
          ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 shadow-sm'
          : 'bg-background border-card-border hover:border-zinc-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-4">
        
        {/* Playful Circle Checkbox */}
        <button
          onClick={() => onToggle(routine)}
          aria-label={routine.completedToday ? `لغو علامت گذاری ${routine.title}` : `علامت گذاری ${routine.title} به عنوان انجام شده`}
          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-base transition-all duration-200 ${
            routine.completedToday
              ? 'bg-primary border-primary text-white scale-105 shadow-md rotate-6'
              : 'border-card-border bg-zinc-50 dark:bg-slate-800 hover:border-primary hover:bg-primary/5 text-transparent cursor-pointer'
          }`}
        >
          ✓
        </button>

        <div>
          <div className={`font-black text-sm transition-all ${
            routine.completedToday 
              ? 'line-through text-text-muted dark:text-slate-500' 
              : 'text-text-main dark:text-slate-100'
          }`}>
            {routine.title}
          </div>
          <span className={`text-[9px] border px-2 py-0.5 rounded-full font-black inline-block mt-1.5 ${categoryBadgeColor}`}>
            {routine.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak Badge */}
        {routine.streak > 0 && (
          <span className="text-xs font-black text-accent-down flex items-center gap-1 bg-accent/5 dark:bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-xl">
            🔥 {routine.streak} روز
          </span>
        )}
        
        {/* Delete Button */}
        <button
          onClick={() => onDelete(routine.id, routine.title)}
          className="btn-3d btn-3d-danger !p-2 !rounded-xl text-[10px] font-black"
          aria-label={`حذف روتین ${routine.title}`}
        >
          🗑️ حذف
        </button>
      </div>
      
    </div>
  );
}
