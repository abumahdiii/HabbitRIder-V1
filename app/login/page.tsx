"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, signupAction } from '../actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginAction(username, password);
        if (res.success) {
          router.push('/');
          router.refresh();
        } else {
          setError(res.error || 'خطایی رخ داد.');
        }
      } else {
        const res = await signupAction(username, password, displayName);
        if (res.success) {
          router.push('/');
          router.refresh();
        } else {
          setError(res.error || 'خطایی رخ داد.');
        }
      }
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-zinc-50 dark:bg-zinc-900" dir="rtl">
      
      {/* Mascot and Title */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-2 animate-bounce">🐰</div>
        <h1 className="text-3xl font-extrabold text-primary mb-1">هبیت رایدر | HabbitRider</h1>
        <p className="text-text-muted text-sm font-semibold">عادت‌هاتو سوار شو و رقابت کن!</p>
      </div>

      <div className="w-full max-w-md card-playful">
        {/* Tab Buttons */}
        <div className="flex border-b-2 border-card-border mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 text-center font-bold text-lg border-b-4 transition-all ${
              isLogin 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            ورود به حساب
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 text-center font-bold text-lg border-b-4 transition-all ${
              !isLogin 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            ثبت‌نام جدید
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border-2 border-danger text-danger text-sm font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">نام نمایشی (لیدربرد):</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="نام شما در لیدربرد (مثل: خرگوش زرنگ)"
                className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-text-main mb-2">نام کاربری:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text-main mb-2">رمز عبور:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-3d btn-3d-primary mt-4"
          >
            {loading ? 'در حال پردازش...' : isLogin ? 'ورود' : 'ثبت نام و ایجاد حساب'}
          </button>
        </form>
      </div>

      <footer className="mt-8 text-center text-xs text-text-muted">
        تمام ارتباطات امن بوده و نشست شما به مدت ۱ هفته در سیستم باقی می‌ماند.
      </footer>
    </div>
  );
}
