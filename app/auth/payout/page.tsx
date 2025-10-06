'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import PayoutDashboard from '@/app/payout/page';

export default function PayoutsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return <PayoutDashboard />;
}