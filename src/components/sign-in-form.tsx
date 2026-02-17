'use client';

import { SignIn } from '@/app/auth/sign-in/actions';
import { ERROR_SIGN_IN_FAILED, TEXT_APP_NAME, TEXT_APP_TAGLINE } from '@/constants/common';
import {
  ARIA_HIDE_PASSWORD,
  ARIA_SHOW_PASSWORD,
  LABEL_EMAIL,
  LABEL_PASSWORD,
  PLACEHOLDER_EMAIL,
  PLACEHOLDER_PASSWORD,
  TEXT_CREATE_ONE,
  TEXT_NO_ACCOUNT_PROMPT,
  TEXT_SIGN_IN,
  TEXT_SIGN_IN_DESCRIPTION,
  TEXT_WELCOME_BACK,
} from '@/constants/sign-in';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Label } from '@/lib/shadcn/components/ui/label';
import { signInFormSchema } from '@/lib/zod/schemas/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

type SignInFormData = z.infer<typeof signInFormSchema>;

export function SignInForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const resetForm = () => {
    reset();
    setShowPassword(false);
    setError('');
  };

  const handleSignInSubmit = async (data: SignInFormData) => {
    if (isFormSubmitting) {
      return;
    }

    setIsFormSubmitting(true);

    try {
      const { success, error } = await SignIn({ email: data.email, password: data.password });

      if (success) {
        resetForm();
        router.push('/dashboard');
      } else {
        setError(error || ERROR_SIGN_IN_FAILED);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDisplayError = (errorObject: typeof errors) => {
    if (errorObject.email) {
      setError(errorObject.email.message || '');
    } else if (errorObject.password) {
      setError(errorObject.password.message || '');
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <BookOpen className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="font-display text-foreground text-2xl font-bold">{TEXT_APP_NAME}</h1>
          <p className="text-muted-foreground text-sm">{TEXT_APP_TAGLINE}</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">{TEXT_WELCOME_BACK}</CardTitle>
            <CardDescription>{TEXT_SIGN_IN_DESCRIPTION}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                handleSubmit(handleSignInSubmit, (errors) => {
                  handleDisplayError(errors);
                })(e);
              }}
              className="flex flex-col gap-4"
            >
              {error && <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">{error}</div>}

              <div className="flex flex-col gap-2">
                <Label htmlFor="sign-in-email">{LABEL_EMAIL}</Label>
                <Input
                  id="sign-in-email"
                  type="email"
                  placeholder={PLACEHOLDER_EMAIL}
                  autoComplete="email"
                  {...register('email')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sign-in-password">{LABEL_PASSWORD}</Label>
                <div className="relative">
                  <Input
                    id="sign-in-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={PLACEHOLDER_PASSWORD}
                    autoComplete="current-password"
                    className="pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    aria-label={showPassword ? ARIA_HIDE_PASSWORD : ARIA_SHOW_PASSWORD}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button disabled={isFormSubmitting} type="submit" className="mt-2 w-full">
                {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : TEXT_SIGN_IN}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                {TEXT_NO_ACCOUNT_PROMPT}
                <button
                  disabled={isFormSubmitting}
                  type="button"
                  onClick={() => {
                    !isFormSubmitting && router.push('/auth/sign-up');
                  }}
                  className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
                >
                  {TEXT_CREATE_ONE}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
