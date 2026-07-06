import React from 'react';
import { Metadata } from 'next';
import RoutinesView from './_components/routines-view';

export const metadata: Metadata = {
  title: 'داشبورد عادت‌ها | هبیت رایدر',
  description: 'مدیریت و ردیابی روتین‌ها و عادتهای روزانه به همراه استیکرها و ویژگی بازی‌وار سازی.',
};

export default function DashboardPage() {
  return <RoutinesView />;
}
