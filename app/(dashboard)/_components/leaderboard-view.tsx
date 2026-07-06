'use client';

import React from 'react';
import { ServerUser } from '../../services/serverDb';
import { useDashboard } from './dashboard-context';

interface LeaderboardViewProps {
  initialLeaderboard: ServerUser[];
  currentUsername: string;
}

export default function LeaderboardView({ initialLeaderboard, currentUsername }: LeaderboardViewProps) {
  const { xp, level, streak, displayName, avatar } = useDashboard();

  // Map leaderboard and update current user dynamically from live context
  const leaderboard = initialLeaderboard.map((user) => {
    if (user.username === currentUsername) {
      return {
        ...user,
        xp,
        level,
        streak,
        displayName,
        avatar
      };
    }
    return user;
  });

  // Re-sort in case XP changed dynamically and modified ranks!
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp);
  
  const topThree = sortedLeaderboard.slice(0, 3);
  const restUsers = sortedLeaderboard.slice(3);

  // Helper for rank marks
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* 3D Podium Card */}
      {topThree.length > 0 && (
        <div className="card-playful bg-white dark:bg-slate-900 border-card-border p-6 text-center animate-pop">
          <h2 className="text-lg font-black text-text-main dark:text-slate-100 flex items-center justify-center gap-2 mb-2">
            <span>🏆</span> سکوی قهرمانان هبیت رایدر
          </h2>
          <p className="text-xs text-text-muted font-bold mb-6">برترین مبارزان عادت‌ها بر اساس امتیاز کل XP</p>
          
          <div className="flex justify-center items-end gap-3 sm:gap-6 pt-10 pb-4" dir="ltr">
            
            {/* 2nd Place (Silver) */}
            {topThree[1] && (
              <div className="flex flex-col items-center w-24 sm:w-28 animate-pop">
                <div className="text-4xl select-none mb-2 animate-float duration-1000">{topThree[1].avatar}</div>
                <div className="font-extrabold text-xs text-text-main dark:text-slate-200 truncate w-full px-1 mb-1">
                  {topThree[1].displayName}
                </div>
                <div className="text-[10px] text-text-muted font-black mb-2">⚡ {topThree[1].xp} XP</div>
                <div className="w-full h-24 bg-gradient-to-t from-slate-200/80 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-700/50 border-2 border-slate-300 dark:border-slate-600 rounded-t-2xl flex flex-col justify-between p-3.5 shadow-sm">
                  <span className="text-2xl select-none">🥈</span>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">رتبه دوم</span>
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {topThree[0] && (
              <div className="flex flex-col items-center w-28 sm:w-32 -translate-y-3.5 animate-pop">
                <div className="relative">
                  <div className="text-5xl select-none mb-2 animate-float filter drop-shadow-sm">{topThree[0].avatar}</div>
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl select-none animate-bounce">👑</span>
                </div>
                <div className="font-extrabold text-sm text-text-main dark:text-slate-100 truncate w-full px-1 mb-1">
                  {topThree[0].displayName}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-black mb-2">⚡ {topThree[0].xp} XP</div>
                <div className="w-full h-32 bg-gradient-to-t from-amber-200/90 to-amber-100/60 dark:from-amber-950/80 dark:to-amber-900/60 border-2 border-amber-400 dark:border-amber-700 rounded-t-2xl flex flex-col justify-between p-4 shadow-md">
                  <span className="text-3xl select-none">🥇</span>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-300">قهرمان میدان</span>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {topThree[2] && (
              <div className="flex flex-col items-center w-20 sm:w-24 animate-pop">
                <div className="text-3.5xl select-none mb-2 animate-float duration-700">{topThree[2].avatar}</div>
                <div className="font-extrabold text-xs text-text-main dark:text-slate-200 truncate w-full px-1 mb-1">
                  {topThree[2].displayName}
                </div>
                <div className="text-[10px] text-text-muted font-black mb-2">⚡ {topThree[2].xp} XP</div>
                <div className="w-full h-20 bg-gradient-to-t from-amber-700/20 to-amber-600/10 dark:from-amber-900/30 dark:to-amber-800/10 border-2 border-amber-600/30 dark:border-amber-800/40 rounded-t-2xl flex flex-col justify-between p-3 shadow-xs">
                  <span className="text-xl select-none">🥉</span>
                  <span className="text-[10px] font-black text-amber-800/80 dark:text-amber-500">رتبه سوم</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Main Leaderboard List */}
      <div className="card-playful bg-white dark:bg-slate-900 border-card-border p-6 animate-pop">
        <h3 className="text-base font-black text-text-main dark:text-slate-100 mb-4">
          جدول رده‌بندی کامل اعضا
        </h3>
        
        <div className="space-y-3.5">
          {sortedLeaderboard.map((user, index) => {
            const isMe = user.username === currentUsername;
            const rank = index + 1;
            const rankBadge = getRankBadge(rank);

            return (
              <div
                key={user.username}
                className={`flex justify-between items-center p-3.5 rounded-2xl border-2 transition-all duration-150 ${
                  isMe
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 font-bold scale-[1.01] shadow-xs'
                    : 'border-card-border bg-background'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Indicator */}
                  <div className="text-base w-7 text-center font-black text-text-muted dark:text-slate-400">
                    {rankBadge}
                  </div>
                  
                  {/* Avatar */}
                  <div className="text-3xl select-none bg-zinc-50 dark:bg-slate-800 p-1 rounded-xl border border-zinc-200/55 dark:border-slate-700">
                    {user.avatar}
                  </div>
                  
                  {/* User Stats Info */}
                  <div>
                    <div className="text-sm font-black text-text-main dark:text-slate-100 flex items-center gap-2">
                      {user.displayName}
                      {isMe && (
                        <span className="text-[9px] bg-primary text-white font-extrabold px-2 py-0.5 rounded-full">
                          شما
                        </span>
                      )}
                    </div>
                    
                    <div className="text-[10px] text-text-muted font-bold mt-1">
                      سطح {user.level} • استریک 🔥 {user.streak} روز
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-left font-black">
                  <span className="text-sm text-primary-down dark:text-primary">⚡ {user.xp}</span>
                  <span className="text-[9px] text-text-muted block font-bold">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
