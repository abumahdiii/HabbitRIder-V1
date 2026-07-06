'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDashboard } from './dashboard-context';
import { logoutAction } from '../../actions/auth';

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, level, avatar } = useDashboard();

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res.success) {
      router.push('/login');
      router.refresh();
    }
  };

  const navItems = [
    { href: '/', label: 'داشبورد روتین‌ها', icon: '⚡' },
    { href: '/leaderboard', label: 'جدول قهرمانان', icon: '🏆' },
    { href: '/profile', label: 'تنظیمات کاربری', icon: '👤' },
  ];

  return (
    <aside className="w-68 bg-white dark:bg-slate-900 border-l-2 border-card-border flex flex-col justify-between p-6 shrink-0 transition-colors duration-300">
      <div className="space-y-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b-2 border-card-border">
          <div className="relative group cursor-pointer mb-2">
            <div className="text-6xl select-none transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              🏄‍♂️🐰
            </div>
            <span className="absolute -top-1 -right-1 text-xs bg-accent text-accent-down font-black px-1.5 py-0.5 rounded-full animate-bounce">
              PRO
            </span>
          </div>
          
          <h1 className="text-2xl font-black text-primary tracking-tight">
            هبیت رایدر
          </h1>
          <span className="text-[10px] text-text-muted font-bold tracking-wider mt-1">
            HABIT RIDER V0.1
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-2">
          <span className="block text-[10px] font-black text-text-muted tracking-wider pr-3 mb-2 uppercase">
            منوی اصلی
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-black text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white border-b-4 border-primary-down shadow-md translate-y-[-1px]'
                    : 'text-text-muted hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-text-main dark:hover:text-white border-2 border-transparent'
                }`}
              >
                <span className="text-xl select-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Information and Actions */}
      <div className="space-y-4 pt-6 border-t-2 border-card-border">
        
        {/* User Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-50 dark:bg-slate-800/50 border border-zinc-200/60 dark:border-slate-800 transition-all hover:scale-[1.01]">
          <div className="text-4xl select-none bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-card-border">
            {avatar}
          </div>
          <div className="overflow-hidden">
            <div className="font-extrabold text-sm text-text-main dark:text-slate-100 truncate">
              {displayName}
            </div>
            <div className="text-xs text-text-muted font-bold">
              سطح {level} • @{username}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full btn-3d btn-3d-neutral !py-2.5 text-xs font-black"
        >
          👋 خروج از حساب
        </button>
      </div>
    </aside>
  );
}
