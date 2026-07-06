import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '../../actions/auth';
import ProfileView from '../_components/profile-view';

export const metadata: Metadata = {
  title: 'تنظیمات پروفایل | هبیت رایدر',
  description: 'ویرایش نام نمایشی و مشخصات لیدربرد حساب کاربری هبیت رایدر.',
};

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  return <ProfileView username={user.username} />;
}
