'use client';

import React, { useActionState, useEffect } from 'react';
import { useDashboard } from './dashboard-context';
import { updateDisplayNameAction, ActionState } from '../../actions/auth';
import { ServerUser } from '../../services/serverDb';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full btn-3d btn-3d-primary text-sm font-black disabled:opacity-50"
    >
      {pending ? 'در حال بروزرسانی...' : 'بروزرسانی مشخصات'}
    </button>
  );
}

export default function ProfileView({ username }: { username: string }) {
  const { displayName, level, xp, updateDisplayName } = useDashboard();

  // Define the form action using useActionState
  const [state, formAction] = useActionState(
    async (prevState: ActionState<ServerUser> | null, formData: FormData) => {
      const name = formData.get('displayName') as string;
      if (!name || !name.trim()) {
        return { success: false, error: 'نام نمایشی نمی‌تواند خالی باشد.' };
      }
      return await updateDisplayNameAction(name);
    },
    null
  );

  // Sync displayName with context if the action succeeded
  useEffect(() => {
    if (state?.success && state.data) {
      updateDisplayName(state.data.displayName);
    }
  }, [state, updateDisplayName]);

  return (
    <div className="max-w-md mx-auto card-playful">
      <h2 className="text-xl font-bold mb-6 text-text-main flex items-center gap-2">
        👤 ویرایش مشخصات حساب کاربری
      </h2>
      
      {state?.error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border-2 border-danger text-danger text-sm font-bold text-center">
          ⚠️ {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mb-4 p-3 rounded-xl bg-secondary/10 border-2 border-secondary text-secondary text-sm font-bold text-center">
          ✓ نام نمایشی با موفقیت در لیدربرد و پروفایل بروز شد!
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="display-name-input" className="block text-xs font-bold text-text-muted mb-2">
            نام نمایشی لیدربرد:
          </label>
          <input
            id="display-name-input"
            name="displayName"
            type="text"
            defaultValue={displayName}
            className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold text-sm"
            required
          />
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-card-border rounded-xl space-y-2 text-sm text-right">
          <div className="flex justify-between">
            <span className="text-text-muted">نام کاربری سیستمی:</span>
            <span className="font-bold text-text-main">@{username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">سطح فعلی:</span>
            <span className="font-bold text-secondary-down">سطح {level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">کل امتیازات (XP):</span>
            <span className="font-bold text-primary-down">⚡ {xp} XP</span>
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
