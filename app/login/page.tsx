"use client";

import React, { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, signupAction, ActionState } from '../actions/auth';
import { useFormStatus } from 'react-dom';

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full btn-3d btn-3d-primary mt-4 disabled:opacity-50"
    >
      {pending ? 'در حال پردازش...' : isLogin ? 'ورود' : 'ثبت نام و ایجاد حساب'}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  // useActionState handles the submit action
  const [state, formAction] = useActionState(
    async (prevState: ActionState | null, formData: FormData) => {
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const displayName = formData.get('displayName') as string;

      if (!username || !username.trim()) {
        return { success: false, error: 'نام کاربری الزامی است.' };
      }
      if (!password) {
        return { success: false, error: 'رمز عبور الزامی است.' };
      }

      try {
        if (isLogin) {
          const res = await loginAction(username, password);
          if (res.success) {
            router.push('/');
            router.refresh();
          }
          return res;
        } else {
          if (!displayName || !displayName.trim()) {
            return { success: false, error: 'نام نمایشی الزامی است.' };
          }
          const res = await signupAction(username, password, displayName);
          if (res.success) {
            router.push('/');
            router.refresh();
          }
          return res;
        }
      } catch (err) {
        console.error(err);
        return { success: false, error: 'ارتباط با سرور برقرار نشد.' };
      }
    },
    null
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-zinc-50 dark:bg-zinc-900" dir="rtl">
      
      {/* Mascot and Title */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-2 animate-bounce select-none">🐰</div>
        <h1 className="text-3xl font-extrabold text-primary mb-1">هبیت رایدر | HabbitRider</h1>
        <p className="text-text-muted text-sm font-semibold">عادت‌هاتو سوار شو و رقابت کن!</p>
      </div>

      <div className="w-full max-w-md card-playful">
        {/* Tab Buttons */}
        <div className="flex border-b-2 border-card-border mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); }}
            className={`flex-1 py-3 text-center font-bold text-lg border-b-4 transition-all ${
              isLogin 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            ورود به حساب
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); }}
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
        {state?.error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border-2 border-danger text-danger text-sm font-bold text-center">
            ⚠️ {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="signup-displayname" className="block text-sm font-bold text-text-main mb-2">
                نام نمایشی (لیدربرد):
              </label>
              <input
                id="signup-displayname"
                name="displayName"
                type="text"
                placeholder="نام شما در لیدربرد (مثل: خرگوش زرنگ)"
                className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label htmlFor="login-username" className="block text-sm font-bold text-text-main mb-2">
              نام کاربری:
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              placeholder="username"
              className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-bold text-text-main mb-2">
              رمز عبور:
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold"
              required
            />
          </div>

          <SubmitButton isLogin={isLogin} />
        </form>
      </div>

      <footer className="mt-8 text-center text-xs text-text-muted">
        تمام ارتباطات امن بوده و نشست شما به مدت ۱ هفته در سیستم باقی می‌ماند.
      </footer>
    </div>
  );
}
