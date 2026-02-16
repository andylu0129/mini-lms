'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Plus } from 'lucide-react';

export function StudentDashboard() {
  const user = { firstName: 'John', lastName: 'Doe' };

  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Greeting and action section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-foreground text-2xl font-bold text-balance sm:text-3xl">
              {user ? `Welcome, ${user.firstName}` : 'My Consultations'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage and track your consultation appointments</p>
          </div>
          <Button onClick={() => {}} className="gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Book Consultation
          </Button>
        </div>
      </main>
    </div>
  );
}
