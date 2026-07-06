'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useDashboard } from './dashboard-context';

export default function Header() {
  const pathname = usePathname();
  const { xp, streak } = useDashboard();

  let title = 'داشبورد عادت‌ها';
  if (pathname === '/leaderboard') {
    title = 'جدول رده‌بندی قهرمانان';
  } else if (pathname === '/profile') {
    title = 'ویرایش مشخصات لیدربرد';
  }

  // XP progress calculation (each level is 100 XP)
  const xpInCurrentLevel = xp % 100;

  return (
    <header className="h-20 bg-white dark:bg-zinc-900 border-b-2 border-card-border px-8 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="font-black text-xl text-text-main">
          {title}
        </h1>
      </div>

      {/* Gamified Health / Stats Row */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Streak */}
        <div className="flex items-center gap-2 bg-accent/10 border-2 border-accent/30 px-3.5 py-1.5 rounded-2xl">
          <span className="text-xl">🔥</span>
          <span className="font-extrabold text-accent-down text-sm">{streak} روز</span>
        </div>

        {/* XP and Level Bar */}
        <div className="flex items-center gap-3 bg-primary/10 border-2 border-primary/30 px-3.5 py-1.5 rounded-2xl">
          <span className="text-xl">⚡</span>
          <div className="flex flex-col">
            <span className="font-extrabold text-primary-down text-sm leading-none">{xp} XP</span>
            {/* Micro progress bar */}
            <div className="w-20 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${xpInCurrentLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Health / Hearts */}
        <div className="flex items-center gap-2 bg-danger/10 border-2 border-danger/30 px-3.5 py-1.5 rounded-2xl">
          <span className="text-xl">❤️</span>
          <span className="font-extrabold text-danger text-sm">۵/۵</span>
        </div>
      </div>
    </header>
  );
}
