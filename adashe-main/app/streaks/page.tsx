'use client';

import { Suspense } from 'react';
import AppLayout from '@/components/layout/app-layout';
import StreakDashboard from '@/components/streaks/streak-dashboard';

function StreakContent() {
  return <StreakDashboard />;
}

export default function StreaksPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <StreakContent />
      </Suspense>
    </AppLayout>
  );
}