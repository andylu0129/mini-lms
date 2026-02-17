import { DashboardHeader } from '@/components/dashboard-header';
import { AuthProvider } from '@/lib/supabase/auth-provider';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect('/auth/sign-in');
  }

  const authUser = {
    firstName: (data.claims?.user_metadata?.first_name as string) ?? '',
    lastName: (data.claims?.user_metadata?.last_name as string) ?? '',
  };

  return (
    <AuthProvider user={authUser}>
      <div className="bg-background min-h-screen">
        <DashboardHeader />
        {children}
      </div>
    </AuthProvider>
  );
}
