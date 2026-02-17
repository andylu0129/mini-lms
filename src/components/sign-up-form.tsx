'use client';

import { signUp } from '@/app/auth/sign-up/actions';
import { ERROR_SIGN_UP_FAILED, TEXT_APP_NAME, TEXT_APP_TAGLINE } from '@/constants/common';
import {
  ARIA_HIDE_CONFIRM_PASSWORD,
  ARIA_HIDE_PASSWORD,
  ARIA_SHOW_CONFIRM_PASSWORD,
  ARIA_SHOW_PASSWORD,
  LABEL_CONFIRM_PASSWORD,
  LABEL_EMAIL,
  LABEL_FIRST_NAME,
  LABEL_LAST_NAME,
  LABEL_PASSWORD,
  PLACEHOLDER_CONFIRM_PASSWORD,
  PLACEHOLDER_EMAIL,
  PLACEHOLDER_FIRST_NAME,
  PLACEHOLDER_LAST_NAME,
  PLACEHOLDER_PASSWORD,
  TEXT_ALREADY_HAVE_ACCOUNT,
  TEXT_CREATE_ACCOUNT,
  TEXT_CREATE_ACCOUNT_DESCRIPTION,
  TEXT_CREATE_ACCOUNT_TITLE,
  TEXT_SIGN_IN_LINK,
} from '@/constants/sign-up';
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
        setError(error || ERROR_SIGN_UP_FAILED);
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
          <h1 className="font-display text-foreground text-2xl font-bold">{TEXT_APP_NAME}</h1>
          <p className="text-muted-foreground text-sm">{TEXT_APP_TAGLINE}</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">{TEXT_CREATE_ACCOUNT_TITLE}</CardTitle>
            <CardDescription>{TEXT_CREATE_ACCOUNT_DESCRIPTION}</CardDescription>
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
                  <Label htmlFor="signup-first-name">{LABEL_FIRST_NAME}</Label>
                  <Input
                    id="signup-first-name"
                    type="text"
                    placeholder={PLACEHOLDER_FIRST_NAME}
                    autoComplete="given-name"
                    {...register('firstName')}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-last-name">{LABEL_LAST_NAME}</Label>
                  <Input
                    id="signup-last-name"
                    type="text"
                    placeholder={PLACEHOLDER_LAST_NAME}
                    autoComplete="family-name"
                    {...register('lastName')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-email">{LABEL_EMAIL}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder={PLACEHOLDER_EMAIL}
                  autoComplete="email"
                  {...register('email')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-password">{LABEL_PASSWORD}</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={PLACEHOLDER_PASSWORD}
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
                    aria-label={showPassword ? ARIA_HIDE_PASSWORD : ARIA_SHOW_PASSWORD}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-confirm-password">{LABEL_CONFIRM_PASSWORD}</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={PLACEHOLDER_CONFIRM_PASSWORD}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    aria-label={showConfirmPassword ? ARIA_HIDE_CONFIRM_PASSWORD : ARIA_SHOW_CONFIRM_PASSWORD}
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button disabled={isFormSubmitting} type="submit" className="mt-2 w-full">
                {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : TEXT_CREATE_ACCOUNT}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                {TEXT_ALREADY_HAVE_ACCOUNT}
                <button
                  disabled={isFormSubmitting}
                  type="button"
                  onClick={() => {
                    !isFormSubmitting && router.push('/auth/sign-in');
                  }}
                  className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
                >
                  {TEXT_SIGN_IN_LINK}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
