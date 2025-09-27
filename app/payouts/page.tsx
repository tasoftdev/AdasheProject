'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import PayoutDashboard from '@/components/payouts/payout-dashboard';

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