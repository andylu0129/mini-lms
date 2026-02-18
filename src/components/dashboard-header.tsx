'use client';

import { signOut } from '@/app/(protected)/dashboard/actions';
import { APP, BROADCAST, COMMON_TEXT } from '@/constants/common';
import { FIELDS } from '@/constants/fields';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/lib/shadcn/components/ui/button';
import { useUserDetails } from '@/lib/supabase/auth-provider';
import { BookOpen, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();
  const user = useUserDetails();

  const handleLogout = async () => {
    await signOut();

    // Even if Supabase sign-out fails, cookies are cleared.
    // Force-redirect since the user wants to leave.
    new BroadcastChannel(BROADCAST.CHANNEL_AUTH).postMessage(BROADCAST.MESSAGE_SIGN_OUT);
    router.push(ROUTES.SIGN_IN);
  };

  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <BookOpen className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="font-display text-foreground text-lg font-bold">{APP.NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          {!!user && (
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {user[FIELDS.FIRST_NAME]} {user[FIELDS.LAST_NAME]}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="size-4" />
            <span className="inline">{COMMON_TEXT.SIGN_OUT}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
