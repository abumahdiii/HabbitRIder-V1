import { redirect } from 'next/navigation';
import { getAuthUser } from './actions/auth';
import TestDBPage from './test-db/page';

export default async function Home() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login');
  }

  return <TestDBPage />;
}

