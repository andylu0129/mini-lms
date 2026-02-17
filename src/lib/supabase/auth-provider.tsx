'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

type UserDetails = {
  firstName: string;
  lastName: string;
};

const UserDetailsContext = createContext<UserDetails | null>(null);

export function useUserDetails() {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error('useUserDetails must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ user, children }: { user: UserDetails; children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
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

  return <UserDetailsContext.Provider value={user}>{children}</UserDetailsContext.Provider>;
}
