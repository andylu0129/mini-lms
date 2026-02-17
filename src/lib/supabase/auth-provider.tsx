'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check current session on mount and only render children once verified.
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        router.push('/auth/sign-in');
      } else {
        setIsAuthenticated(true);
      }
    });

    // Listen for future auth changes and redirect if session expires mid-browsing.
    // Does not sign out other tabs and browsers.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.push('/auth/sign-in');
      }
    });

    // Listen for sign-out broadcasts from other tabs.
    const channel = new BroadcastChannel('auth');
    channel.onmessage = (event) => {
      if (event.data === 'sign-out') {
        setIsAuthenticated(false);
        router.push('/auth/sign-in');
      }
    };

    return () => {
      subscription.unsubscribe();
      channel.close();
    };
  }, [supabase, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
