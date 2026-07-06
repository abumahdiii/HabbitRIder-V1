import { redirect } from 'next/navigation';
import { getAuthUser } from '../actions/auth';
import { DashboardProvider } from './_components/dashboard-context';
import Sidebar from './_components/sidebar';
import Header from './_components/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardProvider initialUser={user}>
      <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 font-sans" dir="rtl">
        {/* Sidebar */}
        <Sidebar username={user.username} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
