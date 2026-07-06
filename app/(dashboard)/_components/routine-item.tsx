'use client';

import React from 'react';
import { Routine } from '../../services/db';

interface RoutineItemProps {
  routine: Routine;
  onToggle: (routine: Routine) => void;
  onDelete: (id: string, title: string) => void;
}

export default function RoutineItem({ routine, onToggle, onDelete }: RoutineItemProps) {
  let categoryBadgeColor = 'bg-secondary/15 text-secondary border-secondary/35';
  if (routine.category === 'ورزش') {
    categoryBadgeColor = 'bg-primary/15 text-primary border-primary/35';
  } else if (routine.category === 'کدنویسی') {
    categoryBadgeColor = 'bg-purple-500/15 text-purple-600 border-purple-500/35';
  } else if (routine.category === 'زبان') {
    categoryBadgeColor = 'bg-accent/15 text-accent-down border-accent/35';
  }

  return (
    <div
      className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${
        routine.completedToday
          ? 'bg-primary/5 border-primary/50'
          : 'bg-background border-card-border hover:border-zinc-400'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Complete tick button */}
        <button
          onClick={() => onToggle(routine)}
          aria-label={routine.completedToday ? `لغو علامت گذاری ${routine.title}` : `علامت گذاری ${routine.title} به عنوان انجام شده`}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${
            routine.completedToday
              ? 'bg-primary border-primary text-white scale-105 shadow-sm'
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
          <span className="text-sm font-black text-accent-down flex items-center gap-1">
            🔥 {routine.streak}
          </span>
        )}
        <button
          onClick={() => onDelete(routine.id, routine.title)}
          className="btn-3d btn-3d-danger !p-2 text-[10px] font-bold"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
