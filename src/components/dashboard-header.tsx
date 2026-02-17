'use client';

import { signOut } from '@/app/(protected)/dashboard/actions';
import { BROADCAST_CHANNEL_AUTH, BROADCAST_MESSAGE_SIGN_OUT, TEXT_APP_NAME, TEXT_SIGN_OUT } from '@/constants/common';
import { FIELD_FIRST_NAME, FIELD_LAST_NAME } from '@/constants/fields';
import { ROUTE_SIGN_IN } from '@/constants/routes';
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
    new BroadcastChannel(BROADCAST_CHANNEL_AUTH).postMessage(BROADCAST_MESSAGE_SIGN_OUT);
    router.push(ROUTE_SIGN_IN);
  };

  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <BookOpen className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="font-display text-foreground text-lg font-bold">{TEXT_APP_NAME}</span>
        </div>
        <div className="flex items-center gap-2">
          {!!user && (
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {user[FIELD_FIRST_NAME]} {user[FIELD_LAST_NAME]}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="size-4" />
            <span className="inline">{TEXT_SIGN_OUT}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
