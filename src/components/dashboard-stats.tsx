'use client';

import { getConsultationStats } from '@/app/(protected)/dashboard/actions';
import { COMMON_TEXT } from '@/constants/common';
import { STATUS } from '@/constants/status';
import { ConsultationStatsData } from '@/types/global';
import React, { useEffect, useState } from 'react';

function CountingNumber({ value, isLoading }: { value?: number; isLoading: boolean }) {
  return (
    <span
      className="transition-[--num] duration-[2.5s] ease-out [counter-set:num_var(--num)] supports-counter-set:before:content-[counter(num)]"
      style={{ '--num': isLoading ? 0 : (value ?? 0) } as React.CSSProperties}
    >
      <span className="supports-counter-set:hidden">{isLoading ? 0 : (value ?? 0)}</span>
    </span>
  );
}

export default function DashboardStats() {
  const [stats, setStats] = useState<ConsultationStatsData | null>(null);
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
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{COMMON_TEXT.TOTAL}</p>
        <p className="font-display text-foreground mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.total_count} isLoading={isLoading} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.UPCOMING}</p>
        <p className="font-display text-foreground mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.upcoming_count} isLoading={isLoading} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.PENDING}</p>
        <p className="font-display text-accent-foreground mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.pending_count} isLoading={isLoading} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.COMPLETE}</p>
        <p className="font-display text-primary mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.complete_count} isLoading={isLoading} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.INCOMPLETE}</p>
        <p className="font-display text-destructive mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.incomplete_count} isLoading={isLoading} />
        </p>
      </div>
    </div>
  );
}
