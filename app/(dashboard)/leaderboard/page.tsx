import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser, getLeaderboardAction } from '../../actions/auth';
import LeaderboardView from '../_components/leaderboard-view';

export const metadata: Metadata = {
  title: 'جدول رده‌بندی قهرمانان | هبیت رایدر',
  description: 'جدول امتیازات و رده‌بندی کاربران هبیت رایدر بر اساس امتیاز تجربه (XP) و استریک‌ها.',
};

export default async function LeaderboardPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  const board = await getLeaderboardAction();

  return <LeaderboardView initialLeaderboard={board} currentUsername={user.username} />;
}
