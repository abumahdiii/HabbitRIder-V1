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
    <header className="h-20 bg-white/40 dark:bg-slate-950/40 border-b border-card-border/60 px-6 md:px-8 flex justify-between items-center shrink-0 backdrop-blur-md transition-all duration-300">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-primary-down rounded-full hidden md:inline-block" />
        <h1 className="font-black text-lg text-text-main dark:text-slate-100">
          {title}
        </h1>
      </div>

      {/* Gamified Health / Stats Row */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Streak Flame */}
        <div className="flex items-center gap-2 bg-accent/5 dark:bg-accent/10 border border-accent/20 px-3.5 py-1.5 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_2px_12px_rgba(245,158,11,0.1)] duration-300">
          <span className="text-lg select-none animate-bounce">🔥</span>
          <span className="font-black text-accent-down dark:text-accent font-num text-xs md:text-sm">{streak} DAYS</span>
        </div>

        {/* XP and Level Progress Bar */}
        <div className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_2px_12px_rgba(16,185,129,0.15)] duration-300">
          <span className="text-lg select-none">⚡</span>
          <div className="flex flex-col">
            <span className="font-black text-primary-down dark:text-primary font-num text-xs md:text-sm leading-none">
              {xp} <span className="text-[9px] text-primary/70 font-black">XP</span>
            </span>
            {/* Micro progress bar with shimmer effect */}
            <div className="w-20 md:w-28 bg-zinc-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden relative border border-zinc-300/40 dark:border-slate-800/40">
              <div
                className="bg-gradient-to-r from-primary to-primary-down h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${xpInCurrentLevel}%` }}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 shimmer-bg shimmer-anim" />
              </div>
            </div>
          </div>
        </div>

        {/* Health / Hearts (Static gamified element) */}
        <div className="flex items-center gap-2 bg-danger/5 dark:bg-danger/10 border border-danger/20 px-3.5 py-1.5 rounded-2xl transition-all hover:scale-105 hover:shadow-[0_2px_12px_rgba(244,63,94,0.15)] duration-300">
          <span className="text-lg select-none animate-pulse">❤️</span>
          <span className="font-black text-danger font-num text-xs md:text-sm">5/5</span>
        </div>
        
      </div>
    </header>
  );
}
