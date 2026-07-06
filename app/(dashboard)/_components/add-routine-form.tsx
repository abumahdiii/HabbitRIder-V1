'use client';

import React, { useState, useEffect } from 'react';
import { Routine, RoutineResource } from '../../services/db';
import { toast } from 'sonner';

interface AddRoutineFormProps {
  onCreate: (title: string, category: string, schedule: Routine['schedule'], extraFields?: Partial<Routine>) => Promise<void>;
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

  // Added feature states: resources and progressive routine
  const [resources, setResources] = useState<RoutineResource[]>([]);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState<'link' | 'pdf'>('link');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [newResourceFile, setNewResourceFile] = useState<File | null>(null);

  const [isProgressive, setIsProgressive] = useState(false);
  const [totalSessions, setTotalSessions] = useState(5);
  const [chaptersList, setChaptersList] = useState<string[]>([]);

  const isEditMode = !!editingRoutine;

  // Sync chaptersList when totalSessions or isProgressive changes
  useEffect(() => {
    if (isProgressive) {
      setChaptersList((prev) => {
        const newList = [...prev];
        if (newList.length < totalSessions) {
          for (let i = newList.length; i < totalSessions; i++) {
            newList.push(`جلسه ${i + 1}`);
          }
        } else if (newList.length > totalSessions) {
          newList.length = totalSessions;
        }
        return newList;
      });
    }
  }, [totalSessions, isProgressive]);

  // Sync form state when editingRoutine prop changes
  useEffect(() => {
    if (editingRoutine) {
      setTitle(editingRoutine.title);
      setCategory(editingRoutine.category);
      setScheduleType(editingRoutine.schedule.type);
      setSelectedDays(editingRoutine.schedule.days || []);
      setDayOfMonth(editingRoutine.schedule.dayOfMonth || 1);
      
      setResources(editingRoutine.resources || []);
      setIsProgressive(!!editingRoutine.isProgressive);
      setTotalSessions(editingRoutine.totalProgressSessions || 5);
      setChaptersList(editingRoutine.chapters?.map((c) => c.title) || []);
    } else {
      setTitle('');
      setCategory('مطالعه');
      setScheduleType('daily');
      setSelectedDays([]);
      setDayOfMonth(1);
      
      setResources([]);
      setIsProgressive(false);
      setTotalSessions(5);
      setChaptersList([]);
    }
  }, [editingRoutine]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('لطفاً فقط فایل PDF انتخاب کنید. 📄');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم فایل PDF نباید بیشتر از ۲ مگابایت باشد. ⚠️');
        return;
      }
      setNewResourceFile(file);
    }
  };

  const handleAddResource = () => {
    if (!newResourceName.trim()) {
      toast.error('لطفاً عنوان منبع را وارد کنید.');
      return;
    }

    if (newResourceType === 'link') {
      if (!newResourceUrl.trim()) {
        toast.error('لطفاً آدرس لینک منبع را وارد کنید.');
        return;
      }
      const newRes: RoutineResource = {
        id: 'res_' + Math.random().toString(36).substring(2, 9),
        name: newResourceName.trim(),
        url: newResourceUrl.trim(),
        type: 'link',
      };
      setResources((prev) => [...prev, newRes]);
      setNewResourceName('');
      setNewResourceUrl('');
      toast.success('منبع لینکی با موفقیت افزوده شد! 🔗');
    } else {
      if (!newResourceFile) {
        toast.error('لطفاً فایل PDF را انتخاب کنید.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newRes: RoutineResource = {
          id: 'res_' + Math.random().toString(36).substring(2, 9),
          name: newResourceName.trim(),
          url: base64,
          type: 'pdf',
        };
        setResources((prev) => [...prev, newRes]);
        setNewResourceName('');
        setNewResourceFile(null);
        
        const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        toast.success('منبع PDF با موفقیت آپلود شد! 📄');
      };
      reader.onerror = () => {
        toast.error('خطا در خواندن فایل PDF. ❌');
      };
      reader.readAsDataURL(newResourceFile);
    }
  };

  const handleRemoveResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    toast.info('منبع حذف شد.');
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

      const extraFields: Partial<Routine> = {
        isProgressive,
        resources,
        ...(isProgressive
          ? {
              totalProgressSessions: totalSessions,
              currentProgressSession: isEditMode && editingRoutine?.isProgressive ? editingRoutine.currentProgressSession : 0,
              chapters: chaptersList.map((cTitle, idx) => {
                const existingCh = isEditMode && editingRoutine?.chapters?.[idx];
                return {
                  id: existingCh ? existingCh.id : 'ch_' + Math.random().toString(36).substring(2, 7),
                  title: cTitle.trim() || `جلسه ${idx + 1}`,
                  completed: existingCh ? existingCh.completed : false,
                };
              }),
            }
          : {
              totalProgressSessions: undefined,
              currentProgressSession: undefined,
              chapters: undefined,
            }),
      };

      if (isEditMode && editingRoutine && onUpdate) {
        const updatedRoutine: Routine = {
          ...editingRoutine,
          title: title.trim(),
          category,
          schedule,
          ...extraFields,
          updatedAt: Date.now(),
        };
        await onUpdate(updatedRoutine);
      } else {
        await onCreate(title.trim(), category, schedule, extraFields);
        
        // Reset form
        setTitle('');
        setCategory('مطالعه');
        setScheduleType('daily');
        setSelectedDays([]);
        setDayOfMonth(1);
        setResources([]);
        setIsProgressive(false);
        setTotalSessions(5);
        setChaptersList([]);
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

        {/* Resources Management Section */}
        <div className="space-y-3 pt-2 border-t border-card-border/40">
          <label className="block text-xs font-black text-text-muted dark:text-slate-300">
            📚 پیوست منابع آموزشی (لینک/PDF):
          </label>

          {/* List of current resources */}
          {resources.length > 0 && (
            <div className="space-y-2 p-2.5 bg-zinc-50/30 dark:bg-slate-900/10 rounded-2xl border border-card-border/40">
              {resources.map((res) => (
                <div key={res.id} className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-card-border/40 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 truncate text-text-main dark:text-slate-200">
                    <span>{res.type === 'pdf' ? '📄' : '🔗'}</span>
                    <span className="truncate max-w-[150px]">{res.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(res.id)}
                    className="text-danger hover:text-danger-down text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form to add a resource */}
          <div className="p-3 bg-zinc-50/50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={newResourceName}
                onChange={(e) => setNewResourceName(e.target.value)}
                placeholder="عنوان منبع (مثلا: کتاب فیزیک ۱)"
                className="col-span-2 px-2.5 py-1.5 rounded-xl border border-card-border/80 bg-zinc-500/5 text-text-main text-xs font-bold"
              />
              <select
                value={newResourceType}
                onChange={(e) => setNewResourceType(e.target.value as any)}
                className="px-1 py-1.5 rounded-xl border border-card-border/80 bg-white dark:bg-slate-800 text-text-main text-xs font-bold focus:outline-none"
              >
                <option value="link">🔗 لینک</option>
                <option value="pdf">📄 PDF</option>
              </select>
            </div>

            {newResourceType === 'link' ? (
              <input
                type="url"
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                placeholder="https://example.com/file.pdf"
                className="w-full px-2.5 py-1.5 rounded-xl border border-card-border bg-zinc-500/5 text-text-main text-xs font-bold"
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <input
                  id="pdf-file-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-text-muted font-bold file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                />
                <span className="text-[9px] text-text-muted font-bold">حداکثر حجم فایل: ۲ مگابایت (جهت پایداری نسخه آفلاین)</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddResource}
              className="w-full py-1.5 bg-secondary hover:bg-secondary-down text-white text-[11px] font-black rounded-xl transition-all shadow-xs cursor-pointer"
            >
              ＋ افزودن منبع به لیست
            </button>
          </div>
        </div>

        {/* Progressive Routine Settings */}
        <div className="space-y-3 pt-2 border-t border-card-border/40">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-text-muted dark:text-slate-300">
              📖 روتین مطالعاتی تدریجی (مرحله‌ای):
            </span>
            <button
              type="button"
              onClick={() => setIsProgressive(!isProgressive)}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                isProgressive ? 'bg-primary' : 'bg-zinc-200 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                  isProgressive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isProgressive && (
            <div className="space-y-3.5 p-3 bg-zinc-50/50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 animate-pop">
              <div className="flex justify-between items-center">
                <label htmlFor="total-sessions" className="text-[11px] font-black text-text-muted dark:text-slate-300">
                  تعداد کل جلسات یا فصول:
                </label>
                <input
                  id="total-sessions"
                  type="number"
                  min="1"
                  max="30"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  disabled={isSubmitting}
                  className="w-16 px-2.5 py-1.5 rounded-xl border border-card-border bg-zinc-500/5 text-text-main text-xs font-black text-center"
                />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-black text-text-muted dark:text-slate-400 block mb-1">
                  نام‌گذاری دلخواه فصل‌ها/جلسات:
                </span>
                <div className="max-h-[140px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                  {chaptersList.map((chap, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-black font-num text-text-muted w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={chap}
                        onChange={(e) => {
                          const val = e.target.value;
                          setChaptersList((prev) => {
                            const newList = [...prev];
                            newList[idx] = val;
                            return newList;
                          });
                        }}
                        placeholder={`جلسه ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-card-border/80 bg-zinc-500/5 text-text-main text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
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
