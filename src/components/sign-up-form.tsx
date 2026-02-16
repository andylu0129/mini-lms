'use client';

import { signUp } from '@/app/auth/sign-up/actions';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Label } from '@/lib/shadcn/components/ui/label';
import { signUpFormSchema } from '@/lib/zod/schemas/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { SignUpSuccess } from './sign-up-success';

type SignUpFormData = z.infer<typeof signUpFormSchema>;

export function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const resetForm = () => {
    reset();
    setShowPassword(false);
    setError('');
  };

  const handleSignUpSubmit = async (data: SignUpFormData) => {
    if (isFormSubmitting) {
      return;
    }

    setIsFormSubmitting(true);

    try {
      const { success, error } = await signUp({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        origin: window.location.origin,
      });

      if (success) {
        resetForm();
        setIsFormSubmitted(true);
      } else {
        setError(error || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDisplayError = (errorObject: typeof errors) => {
    if (errorObject.firstName) {
      setError(errorObject.firstName.message || '');
    } else if (errorObject.lastName) {
      setError(errorObject.lastName.message || '');
    } else if (errorObject.email) {
      setError(errorObject.email.message || '');
    } else if (errorObject.password) {
      setError(errorObject.password.message || '');
    } else if (errorObject.confirmPassword) {
      setError(errorObject.confirmPassword.message || '');
    }
  };

  return isFormSubmitted ? (
    <SignUpSuccess />
  ) : (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
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
            <CardTitle className="font-display text-xl">Create your account</CardTitle>
            <CardDescription>Get started with consultation management</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                handleSubmit(handleSignUpSubmit, (errors) => {
                  handleDisplayError(errors);
                })(e);
              }}
              className="flex flex-col gap-4"
            >
              {!!error.trim() && (
                <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-first-name">First Name</Label>
                  <Input
                    id="signup-first-name"
                    type="text"
                    placeholder="First Name"
                    autoComplete="given-name"
                    {...register('firstName')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-last-name">Last Name</Label>
                  <Input
                    id="signup-last-name"
                    type="text"
                    placeholder="Last Name"
                    autoComplete="family-name"
                    {...register('lastName')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="student@university.edu"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="pr-10"
                    {...register('password')}
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button disabled={isFormSubmitting} type="submit" className="mt-2 w-full">
                {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                {'Already have an account? '}
                <button
                  disabled={isFormSubmitting}
                  type="button"
                  onClick={() => {
                    !isFormSubmitting && router.push('/auth/sign-in');
                  }}
                  className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
