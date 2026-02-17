'use client';

import { signOut } from '@/app/(protected)/dashboard/actions';
import { Button } from '@/lib/shadcn/components/ui/button';
import { BookOpen, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();
  const user = {
    firstName: 'John',
    lastName: 'Doe',
  };

  const handleLogout = async () => {
    await signOut();

    // Even if Supabase sign-out fails, cookies are cleared.
    // Force-redirect since the user wants to leave.
    new BroadcastChannel('auth').postMessage('sign-out');
    router.push('/auth/sign-in');
  };

  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <BookOpen className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="font-display text-foreground text-lg font-bold">MiniLMS</span>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {user.firstName} {user.lastName}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
