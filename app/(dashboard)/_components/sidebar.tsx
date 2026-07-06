'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDashboard } from './dashboard-context';
import { logoutAction } from '../../actions/auth';

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, level } = useDashboard();

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res.success) {
      router.push('/login');
      router.refresh();
    }
  };

  const navItems = [
    { href: '/', label: 'داشبورد عادت‌ها', icon: '📝' },
    { href: '/leaderboard', label: 'جدول رده‌بندی', icon: '🏆' },
    { href: '/profile', label: 'تنظیمات پروفایل', icon: '👤' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-l-2 border-card-border flex flex-col justify-between p-6 shrink-0">
      <div>
        {/* Logo & Mascot */}
        <div className="flex flex-col items-center text-center mb-8 border-b-2 border-card-border pb-6">
          <div className="text-6xl mb-3 hover:scale-110 transition-transform cursor-pointer">🏄‍♂️🐰</div>
          <h1 className="text-2xl font-black text-primary tracking-tight">هبیت رایدر</h1>
          <span className="text-[10px] bg-accent/25 text-accent-down px-2 py-0.5 rounded-full font-extrabold mt-1">
            نسخه آزمایشی v0.1
          </span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3.5 rounded-2xl font-extrabold text-base transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border-2 border-primary'
                    : 'text-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-text-main border-2 border-transparent'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Quick Info & Logout */}
      <div className="border-t-2 border-card-border pt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-full">🦉</div>
          <div className="overflow-hidden">
            <div className="font-bold text-sm text-text-main truncate">{displayName}</div>
            <div className="text-xs text-text-muted">لول {level} • @{username}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full btn-3d btn-3d-danger !py-2 text-xs"
        >
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}
