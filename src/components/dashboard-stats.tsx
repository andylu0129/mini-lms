'use client';

import { getConsultationStats } from '@/app/(protected)/dashboard/actions';
import { TEXT_TOTAL } from '@/constants/common';
import { STATUS_COMPLETE, STATUS_INCOMPLETE, STATUS_PENDING, STATUS_UPCOMING } from '@/constants/status';
import { ConsultationStats } from '@/types/global';
import { useEffect, useState } from 'react';

export default function DashboardStats() {
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleGetStats = async () => {
    setIsLoading(true);

    try {
      const { success, data } = await getConsultationStats();

      if (success) {
        setStats(data[0] || null);
      }
    } catch (error) {
      console.error('Error getting consultation stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetStats();
  }, []);

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{TEXT_TOTAL}</p>
        <p className="font-display text-foreground mt-1 text-2xl font-bold">{stats?.total_count}</p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS_UPCOMING}</p>
        <p className="font-display text-foreground mt-1 text-2xl font-bold">{stats?.upcoming_count}</p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS_PENDING}</p>
        <p className="font-display text-accent-foreground mt-1 text-2xl font-bold">{stats?.pending_count}</p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS_COMPLETE}</p>
        <p className="font-display text-primary mt-1 text-2xl font-bold">{stats?.complete_count}</p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS_INCOMPLETE}</p>
        <p className="font-display text-destructive mt-1 text-2xl font-bold">{stats?.incomplete_count}</p>
      </div>
    </div>
  );
}
