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
    ...(username.toLowerCase() === 'admin' ? [{ href: '/admin', label: 'پنل مدیریت ادمین', icon: '⚙️' }] : []),
  ];

  return (
    <aside className="w-68 sidebar-premium flex flex-col justify-between p-6 shrink-0 transition-all duration-300">
      <div className="space-y-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-card-border">
          <div className="relative group cursor-pointer mb-3">
            <div className="text-5xl select-none transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-tr from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-4 rounded-3xl border border-card-border/50 shadow-inner">
              🏄‍♂️🐰
            </div>
            <span className="absolute -top-1 -right-1 text-[9px] bg-gradient-to-r from-accent to-accent-down text-white font-black px-2 py-0.5 rounded-full shadow-md font-num">
              PRO
            </span>
          </div>
          
          <h1 className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
            هبیت رایدر
          </h1>
          <span className="text-[9px] text-text-muted font-bold font-num tracking-widest mt-1.5 uppercase">
            HABIT RIDER V0.1
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1.5">
          <span className="block text-[9px] font-black text-text-muted/80 tracking-widest pr-3 mb-2 uppercase">
            منوی اصلی
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-down text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] border-b-2 border-primary-down/80 scale-[1.01] translate-y-[-1px]'
                    : 'text-text-muted hover:bg-zinc-200/50 dark:hover:bg-slate-800/40 hover:text-text-main dark:hover:text-white border border-transparent'
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
      <div className="space-y-4 pt-6 border-t border-card-border">
        
        {/* User Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-500/5 dark:bg-slate-800/20 border border-card-border/50 transition-all hover:scale-[1.02] duration-300">
          <div className="text-3xl select-none bg-white/80 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-card-border/60 shadow-sm flex items-center justify-center">
            {avatar}
          </div>
          <div className="overflow-hidden">
            <div className="font-black text-sm text-text-main dark:text-slate-100 truncate">
              {displayName}
            </div>
            <div className="text-[10px] text-text-muted font-black font-num mt-0.5">
              LVL {level} • @{username}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full btn-3d btn-3d-neutral !py-2 text-xs font-black"
        >
          👋 خروج از حساب
        </button>
      </div>
    </aside>
  );
}
