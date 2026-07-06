'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminStatsAction,
  getCopyrightReportsAction,
  resolveCopyrightReportAction,
  getCryptoTransactionsAction,
  manuallyUpgradeUserAction
} from '../../actions/auth';
import { CopyrightReport, CryptoTransaction } from '../../services/serverDb';
import { toast } from 'sonner';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'transactions' | 'robots'>('stats');
  const [stats, setStats] = useState<{
    totalUsers: number;
    premiumUsers: number;
    totalXp: number;
    pendingReports: number;
    totalTransactions: number;
  } | null>(null);
  const [reports, setReports] = useState<CopyrightReport[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  
  // States for dynamic actions
  const [upgradeUser, setUpgradeUser] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [activeSystemTheme, setActiveSystemTheme] = useState('پیش‌فرض (سبز زمردی)');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await getAdminStatsAction();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else {
        toast.error(statsRes.error || 'خطا در بارگذاری آمار.');
      }

      const reportsRes = await getCopyrightReportsAction();
      if (reportsRes.success && reportsRes.data) {
        setReports(reportsRes.data);
      }

      const txsRes = await getCryptoTransactionsAction();
      if (txsRes.success && txsRes.data) {
        setTransactions(txsRes.data);
      }
    } catch (err) {
      toast.error('خطای ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveReport = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const res = await resolveCopyrightReportAction(reportId, action);
      if (res.success) {
        toast.success(
          action === 'approve'
            ? 'گزارش تایید شد و منبع متخلف علامت حذف خورد. 🗑️'
            : 'گزارش رد گردید و بایگانی شد. ✕'
        );
        loadAdminData(); // Reload stats and list
      } else {
        toast.error(res.error || 'خطا در پردازش عملیات.');
      }
    } catch (err) {
      toast.error('خطای سیستمی رخ داد.');
    }
  };

  const handleUpgradeUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeUser.trim() || isUpgrading) return;

    setIsUpgrading(true);
    try {
      const res = await manuallyUpgradeUserAction(upgradeUser.trim());
      if (res.success && res.data) {
        toast.success(`کاربر @${upgradeUser.trim()} با موفقیت به پلن پریمیوم ارتقا یافت! 👑`);
        setUpgradeUser('');
        loadAdminData();
      } else {
        toast.error(res.error || 'ارتقا با خطا مواجه شد. کاربر یافت نشد. ❌');
      }
    } catch (err) {
      toast.error('خطای سیستمی رخ داد.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleUpdateSystemTheme = (theme: string) => {
    setActiveSystemTheme(theme);
    toast.success(`تم فعال مناسبتی پلتفرم به «${theme}» تغییر یافت! 🎨`);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-28 bg-zinc-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-zinc-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-28 bg-zinc-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-96 bg-zinc-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pop" dir="rtl">
      
      {/* Admin Header */}
      <div className="bg-white/50 dark:bg-slate-900/35 p-6 rounded-3xl border border-card-border/60">
        <div className="flex items-center gap-3">
          <span className="text-4xl bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl select-none">⚙️</span>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              پنل مدیریت سوپر ادمین | هبیت رایدر
            </h1>
            <p className="text-xs text-text-muted font-bold mt-1">مانیتورینگ آمار، گزارش‌های حق نشر، لایسنس‌های مالی و سیستم ایجنت‌ها.</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-zinc-200/40 dark:bg-slate-800/35 p-1 rounded-2xl border border-card-border/50 select-none">
        {[
          { key: 'stats', label: '📊 آمار سرور' },
          { key: 'reports', label: `⚠️ نقض کپی‌رایت (${reports.filter(r => r.status === 'pending').length})` },
          { key: 'transactions', label: '💳 تراکنش‌ها و مالی' },
          { key: 'robots', label: '🤖 ایجنت‌ها و تم‌ها' }
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm scale-[1.01]'
                  : 'text-text-muted hover:text-text-main dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stats Tab View */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card-playful flex flex-col justify-between p-5">
              <span className="text-xs font-black text-text-muted">👥 کل کاربران پلتفرم</span>
              <span className="text-3xl font-black font-num text-primary mt-2">{stats.totalUsers} نفر</span>
            </div>
            <div className="card-playful flex flex-col justify-between p-5">
              <span className="text-xs font-black text-text-muted">👑 اشتراک‌های پریمیوم فعال</span>
              <span className="text-3xl font-black font-num text-secondary mt-2">{stats.premiumUsers} کاربر</span>
            </div>
            <div className="card-playful flex flex-col justify-between p-5">
              <span className="text-xs font-black text-text-muted">🔥 کل امتیازات XP کسب‌شده</span>
              <span className="text-3xl font-black font-num text-accent mt-2">{stats.totalXp} XP</span>
            </div>
          </div>

          <div className="card-playful">
            <h2 className="text-sm font-black text-text-main dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>📈</span> عملکرد سیستم و تعاملات
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-zinc-50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-text-muted block">گزارشات باز کپی‌رایت</span>
                  <span className="text-sm text-text-main dark:text-slate-200 font-bold mt-1 inline-block">در انتظار بررسی</span>
                </div>
                <span className="text-2xl font-black font-num text-danger">{stats.pendingReports} مورد</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-text-muted block">تراکنش‌های کریپتو</span>
                  <span className="text-sm text-text-main dark:text-slate-200 font-bold mt-1 inline-block">کل فاکتورهای پرداختی</span>
                </div>
                <span className="text-2xl font-black font-num text-secondary">{stats.totalTransactions} تراکنش</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright Reports Tab View */}
      {activeTab === 'reports' && (
        <div className="card-playful space-y-4">
          <div>
            <h2 className="text-base font-black text-text-main dark:text-slate-100 flex items-center gap-2">
              <span>⚠️</span> گزارش‌های نقض حق نشر منابع
            </h2>
            <p className="text-xs text-text-muted font-bold mt-1">گزارش‌های کپی‌رایت ثبت شده توسط کاربران را مدیریت و بررسی کنید.</p>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
            {reports.length === 0 ? (
              <div className="text-center py-10 text-text-muted font-bold bg-zinc-50/20 dark:bg-slate-800/10 border border-dashed border-card-border rounded-2xl">
                🍀 هیچ گزارش نقض کپی‌رایتی ثبت نشده است.
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="p-4 bg-zinc-50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 space-y-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-black text-text-muted">عنوان روتین:</span>
                      <h4 className="text-xs font-black text-text-main dark:text-slate-200 mt-0.5">{report.routineTitle}</h4>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      report.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : report.status === 'resolved_removed'
                        ? 'bg-danger/10 text-danger border-danger/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {report.status === 'pending'
                        ? '⏳ در انتظار'
                        : report.status === 'resolved_removed'
                        ? '🗑️ منبع حذف شد'
                        : '✕ رد گزارش'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1.5 border-t border-card-border/30">
                    <div>
                      <span className="text-[10px] font-black text-text-muted block">مشخصات منبع متخلف:</span>
                      <span className="font-bold text-text-main dark:text-slate-200 mt-1 inline-block truncate max-w-[250px]">
                        📄 {report.resourceName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-text-muted block">گزارش‌دهنده:</span>
                      <span className="font-bold text-text-main dark:text-slate-200 mt-1 inline-block">
                        @{report.reportedBy}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/50 dark:bg-slate-900/35 border border-card-border/50 rounded-xl">
                    <span className="text-[10px] font-black text-text-muted block">دلیل تخلف اعلام‌شده:</span>
                    <p className="text-xs text-text-main dark:text-slate-300 font-medium mt-1">{report.reason}</p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-2.5 pt-1.5 justify-end">
                      <button
                        onClick={() => handleResolveReport(report.id, 'reject')}
                        className="py-1.5 px-4 bg-zinc-200 dark:bg-slate-800 text-text-main hover:bg-zinc-300 dark:hover:bg-slate-700 text-[10px] font-black rounded-xl cursor-pointer border-0"
                      >
                        رد گزارش ✕
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'approve')}
                        className="py-1.5 px-4 bg-danger text-white text-[10px] font-black rounded-xl cursor-pointer shadow-md hover:bg-danger-down border-0"
                      >
                        تایید و حذف منبع 🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Crypto Transactions Tab View */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Manual Upgrade Option Form */}
          <div className="card-playful">
            <h2 className="text-base font-black text-text-main dark:text-slate-100 flex items-center gap-2 mb-4">
              <span>👑</span> ارتقای دستی سطح کاربر به پریمیوم (PRO)
            </h2>
            <form onSubmit={handleUpgradeUser} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={upgradeUser}
                onChange={(e) => setUpgradeUser(e.target.value)}
                placeholder="نام کاربری کاربر مورد نظر را وارد کنید (مثال: rabbit_racer)"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-card-border bg-zinc-500/5 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-primary text-xs font-bold"
                required
              />
              <button
                type="submit"
                disabled={isUpgrading}
                className="btn-3d btn-3d-accent text-xs font-black py-2.5"
              >
                {isUpgrading ? 'در حال ارتقا...' : 'ارتقا به پلن پریمیوم 👑'}
              </button>
            </form>
          </div>

          {/* Transactions List */}
          <div className="card-playful space-y-4">
            <div>
              <h2 className="text-base font-black text-text-main dark:text-slate-100 flex items-center gap-2">
                <span>💳</span> لاگ تراکنش‌های کریپتو (NOWPayments/MetaMask)
              </h2>
              <p className="text-xs text-text-muted font-bold mt-1">تراکنش‌های متصل به درگاه‌های کریپتوکارنسی را مشاهده کنید.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-card-border text-text-muted font-black">
                    <th className="pb-3 pt-1">شناسه تراکنش</th>
                    <th className="pb-3 pt-1">نام کاربری</th>
                    <th className="pb-3 pt-1">مبلغ پرداختی</th>
                    <th className="pb-3 pt-1">درگاه پرداخت</th>
                    <th className="pb-3 pt-1">وضعیت تراکنش</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-text-main dark:text-slate-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-card-border/50 hover:bg-zinc-500/5 transition-all">
                      <td className="py-3 font-num font-bold">{tx.id}</td>
                      <td className="py-3">@{tx.username}</td>
                      <td className="py-3 font-num font-black text-secondary">{tx.amount}</td>
                      <td className="py-3 font-bold">{tx.gateway}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[9px] border ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {tx.status === 'completed' ? 'تکمیل شده' : 'در جریان'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Robots & Themes Tab View */}
      {activeTab === 'robots' && (
        <div className="space-y-6">
          {/* Theme engine selector */}
          <div className="card-playful space-y-4">
            <div>
              <h2 className="text-base font-black text-text-main dark:text-slate-100 flex items-center gap-2">
                <span>🎨</span> مدیریت تم فعال مناسبتی پلتفرم
              </h2>
              <p className="text-xs text-text-muted font-bold mt-1">تغییر کامل پالت رنگی و استایل‌های بصری برای مناسبت‌ها توسط ادمین.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'پیش‌فرض (سبز زمردی)', icon: '🟢' },
                { name: 'تم طلایی مناسبتی', icon: '🟡' },
                { name: 'شب یلدا (تم قرمز اناری)', icon: '🍉' },
                { name: 'جشن نوروز (تم بهاری)', icon: '🌱' }
              ].map((theme) => {
                const isSelected = activeSystemTheme === theme.name;
                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => handleUpdateSystemTheme(theme.name)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary scale-[1.03] font-black'
                        : 'border-card-border bg-white dark:bg-slate-800/30 text-text-muted hover:text-text-main'
                    }`}
                  >
                    <span className="text-2xl mb-1 select-none">{theme.icon}</span>
                    <span className="text-[10px] font-bold text-center">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Active Robots Monitoring */}
          <div className="card-playful space-y-4">
            <div>
              <h2 className="text-base font-black text-text-main dark:text-slate-100 flex items-center gap-2">
                <span>🤖</span> مانیتورینگ ربات‌ها و ایجنت‌های فعال سیستم
              </h2>
              <p className="text-xs text-text-muted font-bold mt-1">ایجنت‌های هوشمند سیستم که با اتصال به APIها، روتین‌های روزانه خود را تیک می‌زنند.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl select-none">☀️</span>
                  <div>
                    <h4 className="text-xs font-black text-text-main dark:text-slate-200">ربات خورشید (Sun Bot)</h4>
                    <p className="text-[10px] text-text-muted font-bold mt-0.5">اتصال به API هواشناسی جهت محاسبه دقیق زمان طلوع و غروب خورشید.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-black text-[9px]">فعال 🟢</span>
                  <span className="text-[10px] font-bold text-text-muted font-num">آخرین فعالیت: ۵ ساعت قبل</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-slate-800/30 rounded-2xl border border-card-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl select-none">⚽</span>
                  <div>
                    <h4 className="text-xs font-black text-text-main dark:text-slate-200">ربات سلبریتی (Celebrity Bot)</h4>
                    <p className="text-[10px] text-text-muted font-bold mt-0.5">اتصال به شبکه‌های ورزشی و شبکه‌های اجتماعی برای ردیابی روتین‌ها.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full font-black text-[9px]">فعال 🟢</span>
                  <span className="text-[10px] font-bold text-text-muted font-num">آخرین فعالیت: ۱ ساعت قبل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
