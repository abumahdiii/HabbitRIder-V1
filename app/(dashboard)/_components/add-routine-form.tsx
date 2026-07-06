'use client';

import React, { useState } from 'react';

interface AddRoutineFormProps {
  onCreate: (title: string, category: string) => Promise<void>;
}

export default function AddRoutineForm({ onCreate }: AddRoutineFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('مطالعه');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreate(title.trim(), category);
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-playful">
      <h2 className="text-xl font-bold mb-4 text-text-main flex items-center gap-2">
        ➕ افزودن عادت جدید
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="routine-title" className="block text-xs font-extrabold text-text-muted mb-2">
            عنوان عادت:
          </label>
          <input
            id="routine-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: ۳۰ دقیقه ورزش هوازی"
            className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold text-sm"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="routine-category" className="block text-xs font-extrabold text-text-muted mb-2">
            دسته‌بندی عادت:
          </label>
          <select
            id="routine-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-card-border bg-background text-text-main focus:outline-none focus:border-primary transition-all font-semibold text-sm"
            disabled={isSubmitting}
          >
            <option value="مطالعه">📚 مطالعه و تحقیق</option>
            <option value="ورزش">💪 ورزش و تندرستی</option>
            <option value="کدنویسی">💻 برنامه‌نویسی و پروژه</option>
            <option value="زبان">🗣️ یادگیری زبان</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-3d btn-3d-primary text-sm font-black mt-2 disabled:opacity-50"
        >
          {isSubmitting ? 'در حال ثبت...' : 'ثبت در پایگاه‌داده محلی'}
        </button>
      </form>
    </div>
  );
}
