'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useDashboard } from './dashboard-context';
import { updateProfileAction, ActionState } from '../../actions/auth';
import { ServerUser } from '../../services/serverDb';
import { useFormStatus } from 'react-dom';
import { getProfile, saveProfile, UserProfile } from '../../services/db';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full btn-3d btn-3d-primary text-sm font-black disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all"
    >
      {pending ? 'در حال به‌روزرسانی...' : 'ذخیره تغییرات مشخصات 💾'}
    </button>
  );
}

const AVATAR_OPTIONS = ['🐰', '🦊', '🦁', '🐼', '🦉', '🐨', '🐯', '🐸', '🐨', '🦁'];
// Deduplicate just in case
const UNIQUE_AVATARS = Array.from(new Set(AVATAR_OPTIONS));

export default function ProfileView({ username }: { username: string }) {
  const { displayName, level, xp, avatar, updateDisplayName, updateAvatar } = useDashboard();
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);

  // Define the form action using useActionState
  const [state, formAction] = useActionState(
    async (prevState: ActionState<ServerUser> | null, formData: FormData) => {
      const name = formData.get('displayName') as string;
      if (!name || !name.trim()) {
        return { success: false, error: 'نام نمایشی نمی‌تواند خالی باشد.' };
      }
      return await updateProfileAction(name, selectedAvatar);
    },
    null
  );

  // Sync state and selected avatar when context changes (initially loaded)
  useEffect(() => {
    setSelectedAvatar(avatar);
  }, [avatar]);

  // Sync changes with context and IndexedDB if the action succeeded
  useEffect(() => {
    if (state?.success && state.data) {
      updateDisplayName(state.data.displayName);
      updateAvatar(state.data.avatar);

      // Sync with client-side IndexedDB UserProfile
      const syncLocal = async () => {
        try {
          const localProf = await getProfile();
          if (localProf) {
            const updatedLocalProf: UserProfile = {
              ...localProf,
              displayName: state.data!.displayName,
              avatar: state.data!.avatar,
              updatedAt: Date.now()
            };
            await saveProfile(updatedLocalProf);
          }
        } catch (err) {
          console.error('IndexedDB profile sync error:', err);
        }
      };
      syncLocal();
    }
  }, [state, updateDisplayName, updateAvatar]);

  return (
    <div className="max-w-xl mx-auto card-playful bg-white dark:bg-slate-900 border-card-border p-6 md:p-8 animate-pop">
      
      <h2 className="text-xl font-black mb-6 text-text-main dark:text-slate-100 flex items-center gap-2">
        <span>👤</span> تنظیمات حساب کاربری
      </h2>
      
      {state?.error && (
        <div className="mb-6 p-4 rounded-2xl bg-danger/10 border-2 border-danger/30 text-danger text-sm font-bold flex items-center gap-3">
          <span>⚠️</span>
          <div>{state.error}</div>
        </div>
      )}

      {state?.success && (
        <div className="mb-6 p-4 rounded-2xl bg-primary/10 border-2 border-primary/30 text-primary text-sm font-bold flex items-center gap-3">
          <span>✓</span>
          <div>تغییرات پروفایل با موفقیت ثبت و همگام‌سازی شد!</div>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        
        {/* Avatar Selector Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-text-muted dark:text-slate-300">
            آواتار یا مسکات خود را انتخاب کنید:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {UNIQUE_AVATARS.map((emoji) => {
              const isSelected = selectedAvatar === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-12 h-12 text-2xl flex items-center justify-center rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 scale-110 shadow-sm'
                      : 'border-card-border bg-zinc-50 dark:bg-slate-800 hover:border-zinc-400 dark:hover:border-slate-600'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Name Input */}
        <div className="space-y-2">
          <label htmlFor="display-name-input" className="block text-xs font-black text-text-muted dark:text-slate-300">
            نام نمایشی (لیدربرد):
          </label>
          <input
            id="display-name-input"
            name="displayName"
            type="text"
            defaultValue={displayName}
            placeholder="مثال: خرگوش زرنگ"
            className="w-full p-3.5 rounded-2xl border-2 border-card-border bg-background text-text-main focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all font-bold text-sm"
            required
          />
        </div>

        {/* Quick Stats Summary Card */}
        <div className="p-4 bg-zinc-50 dark:bg-slate-800/40 border-2 border-card-border rounded-2xl space-y-3.5 text-sm">
          <span className="block text-[10px] font-black text-text-muted tracking-wider uppercase">
            شناسه و اطلاعات آمار عمومی
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-zinc-200/60 dark:border-slate-700">
              <span className="block text-xs text-text-muted font-bold mb-1">نام کاربری</span>
              <span className="font-extrabold text-text-main dark:text-slate-200">@{username}</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-zinc-200/60 dark:border-slate-700">
              <span className="block text-xs text-text-muted font-bold mb-1">سطح فعلی</span>
              <span className="font-extrabold text-secondary-down">سطح {level}</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-zinc-200/60 dark:border-slate-700">
              <span className="block text-xs text-text-muted font-bold mb-1">امتیاز تجربه</span>
              <span className="font-extrabold text-primary-down">⚡ {xp} XP</span>
            </div>

          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
