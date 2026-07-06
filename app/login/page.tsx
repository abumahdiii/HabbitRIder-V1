"use client";

import React, { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, signupAction, ActionState } from '../actions/auth';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full btn-3d btn-3d-primary mt-6 text-base font-black disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          در حال سوار شدن...
        </span>
      ) : isLogin ? (
        'ورود به پیست مسابقه 🚀'
      ) : (
        'ثبت‌نام و شروع بازی 🏁'
      )}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [state, formAction] = useActionState(
    async (prevState: ActionState | null, formData: FormData) => {
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const displayName = formData.get('displayName') as string;

      if (!username || !username.trim()) {
        return { success: false, error: 'نام کاربری نمی‌تواند خالی باشد.' };
      }
      if (!password) {
        return { success: false, error: 'رمز عبور را وارد نکرده‌اید.' };
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
            return { success: false, error: 'نام نمایشی برای جدول امتیازات الزامی است.' };
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
        return { success: false, error: 'برقراری ارتباط با سرور با خطا مواجه شد.' };
      }
    },
    null
  );

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(isLogin ? 'ورود با موفقیت انجام شد! 🚀' : 'ثبت‌نام با موفقیت انجام شد! 🏁');
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, isLogin]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-zinc-50 dark:bg-slate-950 transition-colors duration-300" dir="rtl">
      
      {/* Playful Brand Header */}
      <div className="text-center mb-8 animate-pop">
        <div className="relative inline-block mb-3">
          {/* Animated Mascot */}
          <div className="text-7xl select-none animate-float filter drop-shadow-md">
            {isLogin ? '🐰' : '🦊'}
          </div>
          <span className="absolute -top-1 -right-2 text-2xl animate-bounce">⚡</span>
        </div>
        
        <h1 className="text-4xl font-black text-primary tracking-tight mb-2 drop-shadow-sm">
          هبیت رایدر <span className="text-text-main dark:text-white">| HabbitRider</span>
        </h1>
        <p className="text-text-muted text-sm font-bold max-w-xs mx-auto">
          {isLogin 
            ? 'خوش آمدید! برای ادامه رقابت روزانه وارد حساب کاربری خود شوید.' 
            : 'عادت‌های خود را به بازی تبدیل کنید و با دوستانتان مسابقه دهید!'}
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md card-playful bg-white dark:bg-slate-900 border-card-border p-6 md:p-8 animate-pop">
        
        {/* Playful Tabs */}
        <div className="flex bg-zinc-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 border border-zinc-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-center font-black text-sm rounded-xl transition-all duration-200 ${
              isLogin 
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm scale-[1.02]' 
                : 'text-text-muted hover:text-text-main hover:bg-zinc-200/50 dark:hover:bg-slate-700/30'
            }`}
          >
            ورود به حساب
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-center font-black text-sm rounded-xl transition-all duration-200 ${
              !isLogin 
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm scale-[1.02]' 
                : 'text-text-muted hover:text-text-main hover:bg-zinc-200/50 dark:hover:bg-slate-700/30'
            }`}
          >
            عضویت جدید
          </button>
        </div>

        {/* Auth Form */}
        <form action={formAction} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="signup-displayname" className="block text-xs font-black text-text-main dark:text-slate-200">
                نام نمایشی در جدول رقابت:
              </label>
              <div className="relative">
                <input
                  id="signup-displayname"
                  name="displayName"
                  type="text"
                  placeholder="مثال: سوپر هیرو، دونده سرعت"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-card-border bg-background text-text-main focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all font-bold text-sm"
                  required={!isLogin}
                />
                <span className="absolute left-4 top-3.5 text-lg select-none">👑</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="login-username" className="block text-xs font-black text-text-main dark:text-slate-200">
              نام کاربری:
            </label>
            <div className="relative">
              <input
                id="login-username"
                name="username"
                type="text"
                placeholder="username"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-card-border bg-background text-text-main focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all font-bold text-sm"
                required
              />
              <span className="absolute left-4 top-3.5 text-lg select-none">👤</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="block text-xs font-black text-text-main dark:text-slate-200">
              رمز عبور:
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-card-border bg-background text-text-main focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all font-bold text-sm"
                required
              />
              <span className="absolute left-4 top-3.5 text-lg select-none">🔑</span>
            </div>
          </div>

          <SubmitButton isLogin={isLogin} />
        </form>
      </div>

      {/* Playful Footer */}
      <footer className="mt-8 text-center text-xs text-text-muted font-bold max-w-sm">
        🛡️ تمامی اطلاعات به صورت رمزگذاری شده نگهداری می‌شوند. با عضویت در هبیت رایدر، به یکی از سوارکاران عادت‌ها تبدیل خواهید شد!
      </footer>
    </div>
  );
}
