'use client';

import React, { useState } from 'react';

interface AddRoutineFormProps {
  onCreate: (title: string, category: string) => Promise<void>;
}

const CATEGORIES = [
  { value: 'مطالعه', label: 'مطالعه', icon: '📚', colorClass: 'hover:border-amber-400/80 focus:border-amber-500', activeClass: 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.05)]' },
  { value: 'ورزش', label: 'ورزش', icon: '💪', colorClass: 'hover:border-emerald-400/80 focus:border-emerald-500', activeClass: 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.05)]' },
  { value: 'کدنویسی', label: 'کدنویسی', icon: '💻', colorClass: 'hover:border-purple-400/80 focus:border-purple-500', activeClass: 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-[0_2px_10px_rgba(168,85,247,0.05)]' },
  { value: 'زبان', label: 'زبان', icon: '🗣️', colorClass: 'hover:border-sky-400/80 focus:border-sky-500', activeClass: 'border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-[0_2px_10px_rgba(14,165,233,0.05)]' },
];

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
      <h2 className="text-md font-black mb-5 text-text-main dark:text-slate-100 flex items-center gap-2">
        <span>➕</span> تعریف عادت یا روتین جدید
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Title input */}
        <div className="space-y-2">
          <label htmlFor="routine-title" className="block text-xs font-black text-text-muted dark:text-slate-300">
            عنوان عادت:
          </label>
          <input
            id="routine-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: ۳۰ دقیقه مطالعه فیزیک"
            className="w-full px-4 py-3 rounded-2xl border border-card-border bg-zinc-500/5 text-text-main placeholder-text-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-bold text-sm"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Category Visual Grid Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-text-muted dark:text-slate-300">
            انتخاب دسته‌بندی موضوعی:
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? cat.activeClass + ' scale-[1.03] border-current font-black'
                      : 'border-card-border bg-zinc-50/50 dark:bg-slate-800/30 text-text-muted hover:text-text-main dark:hover:text-white ' + cat.colorClass
                  }`}
                >
                  <span className="text-3xl mb-1.5 select-none">{cat.icon}</span>
                  <span className="text-xs font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-3d btn-3d-primary text-sm font-black mt-2 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all"
        >
          {isSubmitting ? 'در حال ثبت...' : 'ثبت در پایگاه‌داده محلی 💾'}
        </button>
        
      </form>
    </div>
  );
}
