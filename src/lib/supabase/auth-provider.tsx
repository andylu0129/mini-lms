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
    supabase.auth.getClaims().then(({ data, error }) => {
      if (error || !data?.claims) {
        router.push('/auth/sign-in');
      } else {
        setIsAuthenticated(true);
      }
    });

    // Listen for future auth changes and redirect if session expires mid-browsing.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        router.push('/auth/sign-in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
