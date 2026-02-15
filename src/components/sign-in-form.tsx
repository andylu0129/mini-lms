'use client';

import { SignIn } from '@/app/auth/sign-in/actions';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Label } from '@/lib/shadcn/components/ui/label';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignInForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    if (isFormSubmitting) {
      return;
    }

    e.preventDefault();
    setError('');
    setIsFormSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsFormSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Invalid password.');
      setIsFormSubmitting(false);
      return;
    }

    try {
      const { success, error } = await SignIn({ email, password });

      if (success) {
        resetForm();
        router.push('/dashboard');
      } else {
        setError(error || 'Sign in failed. Please try again.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <BookOpen className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="font-display text-foreground text-2xl font-bold">MiniLMS</h1>
          <p className="text-muted-foreground text-sm">Student Consultation Portal</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to access your consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">{error}</div>}

              <div className="flex flex-col gap-2">
                <Label htmlFor="sign-in-email">Email</Label>
                <Input
                  id="sign-in-email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sign-in-password">Password</Label>
                <div className="relative">
                  <Input
                    id="sign-in-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button disabled={isFormSubmitting} type="submit" className="mt-2 w-full">
                {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                {"Don't have an account? "}
                <button
                  disabled={isFormSubmitting}
                  type="button"
                  onClick={() => {
                    !isFormSubmitting && router.push('/auth/sign-up');
                  }}
                  className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
                >
                  Create one
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
