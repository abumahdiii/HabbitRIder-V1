'use client';

import React from 'react';
import { ServerUser } from '../../services/serverDb';
import { useDashboard } from './dashboard-context';

interface LeaderboardViewProps {
  initialLeaderboard: ServerUser[];
  currentUsername: string;
}

export default function LeaderboardView({ initialLeaderboard, currentUsername }: LeaderboardViewProps) {
  const { xp, level, streak, displayName } = useDashboard();

  // Map leaderboard and update current user dynamically from live context
  const leaderboard = initialLeaderboard.map((user) => {
    if (user.username === currentUsername) {
      return {
        ...user,
        xp,
        level,
        streak,
        displayName
      };
    }
    return user;
  });

  // Re-sort in case XP changed dynamically and modified ranks!
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp);

  return (
    <div className="max-w-xl mx-auto card-playful">
      <h2 className="text-xl font-bold mb-4 text-text-main flex items-center gap-2">
        🏆 جدول رقابتی لیدربرد
      </h2>
      <div className="space-y-3">
        {sortedLeaderboard.map((user, index) => {
          const isMe = user.username === currentUsername;
          const rank = index + 1;
          let rankMark = '⭐';
          if (rank === 1) rankMark = '🥇';
          else if (rank === 2) rankMark = '🥈';
          else if (rank === 3) rankMark = '🥉';

          return (
            <div
              key={user.username}
              className={`flex justify-between items-center p-3.5 rounded-2xl border-2 transition-all ${
                isMe
                  ? 'border-primary bg-primary/5 font-bold scale-[1.02] shadow-sm'
                  : 'border-card-border bg-background'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl w-6 text-center font-black text-text-muted">
                  {rankMark === '⭐' ? rank : rankMark}
                </div>
                <div className="text-3xl select-none">{user.avatar}</div>
                <div>
                  <div className="text-sm font-bold text-text-main flex items-center gap-1.5">
                    {user.displayName}
                    {isMe && (
                      <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">
                        شما
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    سطح {user.level} • استریک 🔥 {user.streak} روز
                  </div>
                </div>
              </div>
              <div className="text-left">
                <span className="font-extrabold text-primary-down text-sm">⚡ {user.xp}</span>
                <span className="text-[9px] text-text-muted block">XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
