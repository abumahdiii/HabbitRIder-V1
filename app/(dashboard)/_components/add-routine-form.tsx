'use client';

import React, { useState, useEffect } from 'react';
import { Routine } from '../../services/db';

interface AddRoutineFormProps {
  onCreate: (title: string, category: string, schedule: Routine['schedule']) => Promise<void>;
  editingRoutine?: Routine | null;
  onUpdate?: (updatedRoutine: Routine) => Promise<void>;
  onCancelEdit?: () => void;
}

const CATEGORIES = [
  { value: 'مطالعه', label: 'مطالعه', icon: '📚', colorClass: 'hover:border-amber-400/80 focus:border-amber-500', activeClass: 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.05)]' },
  { value: 'ورزش', label: 'ورزش', icon: '💪', colorClass: 'hover:border-emerald-400/80 focus:border-emerald-500', activeClass: 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.05)]' },
  { value: 'کدنویسی', label: 'کدنویسی', icon: '💻', colorClass: 'hover:border-purple-400/80 focus:border-purple-500', activeClass: 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-[0_2px_10px_rgba(168,85,247,0.05)]' },
  { value: 'زبان', label: 'زبان', icon: '🗣️', colorClass: 'hover:border-sky-400/80 focus:border-sky-500', activeClass: 'border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-[0_2px_10px_rgba(14,165,233,0.05)]' },
];

const WEEK_DAYS = [
  { label: 'ش', value: 6 }, // Saturday
  { label: 'ی', value: 0 }, // Sunday
  { label: 'د', value: 1 }, // Monday
  { label: 'س', value: 2 }, // Tuesday
  { label: 'چ', value: 3 }, // Wednesday
  { label: 'پ', value: 4 }, // Thursday
  { label: 'ج', value: 5 }, // Friday
];

export default function AddRoutineForm({
  onCreate,
  editingRoutine = null,
  onUpdate,
  onCancelEdit,
}: AddRoutineFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('مطالعه');
  const [scheduleType, setScheduleType] = useState<Routine['schedule']['type']>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!editingRoutine;

  // Sync form state when editingRoutine prop changes
  useEffect(() => {
    if (editingRoutine) {
      setTitle(editingRoutine.title);
      setCategory(editingRoutine.category);
      setScheduleType(editingRoutine.schedule.type);
      setSelectedDays(editingRoutine.schedule.days || []);
      setDayOfMonth(editingRoutine.schedule.dayOfMonth || 1);
    } else {
      setTitle('');
      setCategory('مطالعه');
      setScheduleType('daily');
      setSelectedDays([]);
      setDayOfMonth(1);
    }
  }, [editingRoutine]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const schedule: Routine['schedule'] = {
        type: scheduleType,
        ...(scheduleType === 'weekly' || scheduleType === 'custom' ? { days: selectedDays } : {}),
        ...(scheduleType === 'monthly' ? { dayOfMonth } : {}),
      };

      if (isEditMode && editingRoutine && onUpdate) {
        const updatedRoutine: Routine = {
          ...editingRoutine,
          title: title.trim(),
          category,
          schedule,
          updatedAt: Date.now(),
        };
        await onUpdate(updatedRoutine);
      } else {
        await onCreate(title.trim(), category, schedule);
        // Reset form only if we were creating
        setTitle('');
        setCategory('مطالعه');
        setScheduleType('daily');
        setSelectedDays([]);
        setDayOfMonth(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-playful animate-pop">
      <h2 className="text-md font-black mb-5 text-text-main dark:text-slate-100 flex items-center gap-2">
        <span>{isEditMode ? '✏️' : '➕'}</span>
        {isEditMode ? 'ویرایش عادت یا روتین' : 'تعریف عادت یا روتین جدید'}
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
                      : 'border-card-border bg-zinc-50/50 dark:bg-slate-800/30 text-text-muted hover:text-text-main dark:hover:text-white ' +
                        cat.colorClass
                  }`}
                >
                  <span className="text-3xl mb-1.5 select-none">{cat.icon}</span>
                  <span className="text-xs font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Selection */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-black text-text-muted dark:text-slate-300">
            برنامه زمان‌بندی:
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'daily', label: 'هر روز' },
              { type: 'weekly', label: 'روزهای خاص' },
              { type: 'monthly', label: 'ماهانه' },
            ].map((item) => {
              const isSelected = scheduleType === item.type || (item.type === 'weekly' && scheduleType === 'custom');
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setScheduleType(item.type as any)}
                  disabled={isSubmitting}
                  className={`py-2 rounded-xl border text-xs font-black transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary scale-[1.02]'
                      : 'border-card-border bg-zinc-50/20 dark:bg-slate-800/20 text-text-muted hover:text-text-main'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Custom Days (Weekly) Option */}
          {(scheduleType === 'weekly' || scheduleType === 'custom') && (
            <div className="space-y-2 p-3 bg-zinc-50/50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 animate-pop">
              <span className="text-[10px] font-black text-text-muted dark:text-slate-300 block mb-1">
                روزهای مورد نظر در هفته را انتخاب کنید:
              </span>
              <div className="flex justify-between items-center">
                {WEEK_DAYS.map((day) => {
                  const isDaySelected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      disabled={isSubmitting}
                      className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                        isDaySelected
                          ? 'bg-primary text-white scale-110 shadow-md'
                          : 'bg-zinc-100 dark:bg-slate-800 text-text-muted hover:bg-zinc-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Option */}
          {scheduleType === 'monthly' && (
            <div className="space-y-2 p-3 bg-zinc-50/50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 animate-pop">
              <label htmlFor="day-of-month" className="text-[10px] font-black text-text-muted dark:text-slate-300 block mb-1">
                روز چندم ماه؟
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="day-of-month"
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                  disabled={isSubmitting}
                  className="w-20 px-3 py-1.5 rounded-xl border border-card-border bg-zinc-500/5 text-text-main text-sm font-black text-center"
                />
                <span className="text-xs text-text-muted font-bold">ام هر ماه</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {isEditMode && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-zinc-200 dark:bg-slate-800 text-text-main hover:bg-zinc-300 dark:hover:bg-slate-700 text-xs font-black rounded-2xl transition-all border border-card-border/50"
            >
              انصراف ✕
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-3d text-xs font-black ${isEditMode ? 'btn-3d-secondary flex-[2]' : 'w-full btn-3d-primary'}`}
          >
            {isSubmitting
              ? 'در حال ثبت...'
              : isEditMode
              ? 'ذخیره تغییرات 💾'
              : 'ثبت در پایگاه‌داده محلی 💾'}
          </button>
        </div>
      </form>
    </div>
  );
}
