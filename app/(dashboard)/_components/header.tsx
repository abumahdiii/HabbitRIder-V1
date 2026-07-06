'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useDashboard } from './dashboard-context';

export default function Header() {
  const pathname = usePathname();
  const { xp, streak } = useDashboard();

  let title = 'داشبورد روتین‌ها';
  if (pathname === '/leaderboard') {
    title = 'جدول رده‌بندی قهرمانان';
  } else if (pathname === '/profile') {
    title = 'تنظیمات پروفایل و لیدربرد';
  }

  // XP progress calculation (each level is 100 XP)
  const xpInCurrentLevel = xp % 100;

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b-2 border-card-border px-6 md:px-8 flex justify-between items-center shrink-0 transition-colors duration-300">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-6 bg-primary rounded-full hidden md:inline-block" />
        <h1 className="font-black text-xl text-text-main dark:text-slate-100">
          {title}
        </h1>
      </div>

      {/* Gamified Health / Stats Row */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Streak Flame */}
        <div className="flex items-center gap-2 bg-accent/10 border-2 border-accent/30 px-3 md:px-4 py-1.5 rounded-2xl transition-all hover:scale-105 duration-200">
          <span className="text-xl select-none animate-bounce">🔥</span>
          <span className="font-black text-accent-down text-sm md:text-base">{streak} روز</span>
        </div>

        {/* XP and Level Progress Bar */}
        <div className="flex items-center gap-3 bg-primary/10 border-2 border-primary/30 px-3 md:px-4 py-1.5 rounded-2xl transition-all hover:scale-105 duration-200">
          <span className="text-xl select-none">⚡</span>
          <div className="flex flex-col">
            <span className="font-black text-primary-down text-xs md:text-sm leading-none">
              {xp} <span className="text-[10px] text-primary/70 font-bold">XP</span>
            </span>
            {/* Micro progress bar with shimmer effect */}
            <div className="w-20 md:w-28 bg-zinc-200 dark:bg-slate-700 h-2.5 rounded-full mt-1.5 overflow-hidden relative border border-zinc-300/40 dark:border-slate-800">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${xpInCurrentLevel}%` }}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 shimmer-bg shimmer-anim" />
              </div>
            </div>
          </div>
        </div>

        {/* Health / Hearts (Static gamified element) */}
        <div className="flex items-center gap-2 bg-danger/10 border-2 border-danger/30 px-3 md:px-4 py-1.5 rounded-2xl transition-all hover:scale-105 duration-200">
          <span className="text-xl select-none animate-pulse">❤️</span>
          <span className="font-black text-danger text-sm md:text-base">۵/۵</span>
        </div>
        
      </div>
    </header>
  );
}
