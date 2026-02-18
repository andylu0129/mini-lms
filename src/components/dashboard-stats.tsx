'use client';

import { DASHBOARD } from '@/constants/dashboard';
import { STATUS } from '@/constants/status';
import { ConsultationStatsData } from '@/types/global';
import React from 'react';

function CountingNumber({ value }: { value?: number }) {
  return (
    <span
      className="transition-[--num] duration-[2.5s] ease-out [counter-set:num_var(--num)] supports-counter-set:before:content-[counter(num)]"
      style={{ '--num': value ?? 0 } as React.CSSProperties}
    >
      <span className="supports-counter-set:hidden">{value ?? 0}</span>
    </span>
  );
}

export default function DashboardStats({ stats }: { stats: ConsultationStatsData | null }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{DASHBOARD.STATS.TOTAL}</p>
        <p className="font-display text-foreground mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.[DASHBOARD.STATS.TOTAL]} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.UPCOMING}</p>
        <p className="font-display text-foreground mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.[STATUS.UPCOMING]} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.PENDING}</p>
        <p className="font-display text-accent-foreground mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.[STATUS.PENDING]} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.COMPLETE}</p>
        <p className="font-display text-primary mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.[STATUS.COMPLETE]} />
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{STATUS.INCOMPLETE}</p>
        <p className="font-display text-destructive mt-1 text-2xl font-bold">
          <CountingNumber value={stats?.[STATUS.INCOMPLETE]} />
        </p>
      </div>
    </div>
  );
}
