'use client';

import { signUp } from '@/app/auth/sign-up/actions';
import { APP, ERRORS } from '@/constants/common';
import { FIELDS } from '@/constants/fields';
import { ROUTES } from '@/constants/routes';
import { SIGN_UP_TEXT } from '@/constants/sign-up';
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
        [FIELDS.FIRST_NAME]: data[FIELDS.FIRST_NAME],
        [FIELDS.LAST_NAME]: data[FIELDS.LAST_NAME],
        [FIELDS.EMAIL]: data[FIELDS.EMAIL],
        [FIELDS.PASSWORD]: data[FIELDS.PASSWORD],
        origin: window.location.origin,
      });

      if (success) {
        resetForm();
        setIsFormSubmitted(true);
      } else {
        setError(error || ERRORS.SIGN_UP_FAILED);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDisplayError = (errorObject: typeof errors) => {
    if (errorObject[FIELDS.FIRST_NAME]) {
      setError(errorObject[FIELDS.FIRST_NAME]?.message || '');
    } else if (errorObject[FIELDS.LAST_NAME]) {
      setError(errorObject[FIELDS.LAST_NAME]?.message || '');
    } else if (errorObject[FIELDS.EMAIL]) {
      setError(errorObject[FIELDS.EMAIL]?.message || '');
    } else if (errorObject[FIELDS.PASSWORD]) {
      setError(errorObject[FIELDS.PASSWORD]?.message || '');
    } else if (errorObject[FIELDS.CONFIRM_PASSWORD]) {
      setError(errorObject[FIELDS.CONFIRM_PASSWORD]?.message || '');
    }
  };

  return isFormSubmitted ? (
    <SignUpSuccess />
  ) : (
    <div className="bg-background items-top flex min-h-screen justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <BookOpen className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="font-display text-foreground text-2xl font-bold">{APP.NAME}</h1>
          <p className="text-muted-foreground text-sm">{APP.TAGLINE}</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">{SIGN_UP_TEXT.TITLE}</CardTitle>
            <CardDescription>{SIGN_UP_TEXT.DESCRIPTION}</CardDescription>
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
                  <Label htmlFor="signup-first-name">{SIGN_UP_TEXT.LABEL.FIRST_NAME}</Label>
                  <Input
                    id="signup-first-name"
                    type="text"
                    placeholder={SIGN_UP_TEXT.PLACEHOLDER.FIRST_NAME}
                    autoComplete="given-name"
                    {...register(FIELDS.FIRST_NAME)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="signup-last-name">{SIGN_UP_TEXT.LABEL.LAST_NAME}</Label>
                  <Input
                    id="signup-last-name"
                    type="text"
                    placeholder={SIGN_UP_TEXT.PLACEHOLDER.LAST_NAME}
                    autoComplete="family-name"
                    {...register(FIELDS.LAST_NAME)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-email">{SIGN_UP_TEXT.LABEL.EMAIL}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder={SIGN_UP_TEXT.PLACEHOLDER.EMAIL}
                  autoComplete="email"
                  {...register(FIELDS.EMAIL)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-password">{SIGN_UP_TEXT.LABEL.PASSWORD}</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={SIGN_UP_TEXT.PLACEHOLDER.PASSWORD}
                    autoComplete="new-password"
                    className="pr-10"
                    {...register(FIELDS.PASSWORD)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    aria-label={showPassword ? SIGN_UP_TEXT.ARIA.HIDE_PASSWORD : SIGN_UP_TEXT.ARIA.SHOW_PASSWORD}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-confirm-password">{SIGN_UP_TEXT.LABEL.CONFIRM_PASSWORD}</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={SIGN_UP_TEXT.PLACEHOLDER.CONFIRM_PASSWORD}
                    autoComplete="new-password"
                    {...register(FIELDS.CONFIRM_PASSWORD)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    aria-label={
                      showConfirmPassword
                        ? SIGN_UP_TEXT.ARIA.HIDE_CONFIRM_PASSWORD
                        : SIGN_UP_TEXT.ARIA.SHOW_CONFIRM_PASSWORD
                    }
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button disabled={isFormSubmitting} type="submit" className="mt-2 w-full">
                {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : SIGN_UP_TEXT.SUBMIT}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                {SIGN_UP_TEXT.ALREADY_HAVE_ACCOUNT}
                <button
                  disabled={isFormSubmitting}
                  type="button"
                  onClick={() => {
                    !isFormSubmitting && router.push(ROUTES.SIGN_IN);
                  }}
                  className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
                >
                  {SIGN_UP_TEXT.SIGN_IN_LINK}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
