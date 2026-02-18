'use client';

import { SignIn } from '@/app/auth/sign-in/actions';
import { APP, ERRORS } from '@/constants/common';
import { FIELDS } from '@/constants/fields';
import { ROUTES } from '@/constants/routes';
import { SIGN_IN_TEXT } from '@/constants/sign-in';
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
      const { success, error } = await SignIn({
        [FIELDS.EMAIL]: data[FIELDS.EMAIL],
        [FIELDS.PASSWORD]: data[FIELDS.PASSWORD],
      });

      if (success) {
        resetForm();
        router.push(ROUTES.DASHBOARD);
      } else {
        setError(error || ERRORS.SIGN_IN_FAILED);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDisplayError = (errorObject: typeof errors) => {
    if (errorObject[FIELDS.EMAIL]) {
      setError(errorObject[FIELDS.EMAIL]?.message || '');
    } else if (errorObject[FIELDS.PASSWORD]) {
      setError(errorObject[FIELDS.PASSWORD]?.message || '');
    }
  };

  return (
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
            <CardTitle className="font-display text-xl">{SIGN_IN_TEXT.TITLE}</CardTitle>
            <CardDescription>{SIGN_IN_TEXT.DESCRIPTION}</CardDescription>
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
                <Label htmlFor="sign-in-email">{SIGN_IN_TEXT.LABEL.EMAIL}</Label>
                <Input
                  id="sign-in-email"
                  type="email"
                  placeholder={SIGN_IN_TEXT.PLACEHOLDER.EMAIL}
                  autoComplete="email"
                  {...register(FIELDS.EMAIL)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sign-in-password">{SIGN_IN_TEXT.LABEL.PASSWORD}</Label>
                <div className="relative">
                  <Input
                    id="sign-in-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={SIGN_IN_TEXT.PLACEHOLDER.PASSWORD}
                    autoComplete="current-password"
                    className="pr-10"
                    {...register(FIELDS.PASSWORD)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                    aria-label={showPassword ? SIGN_IN_TEXT.ARIA.HIDE_PASSWORD : SIGN_IN_TEXT.ARIA.SHOW_PASSWORD}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button disabled={isFormSubmitting} type="submit" className="mt-2 w-full">
                {isFormSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : SIGN_IN_TEXT.SUBMIT}
              </Button>

              <p className="text-muted-foreground text-center text-sm">
                {SIGN_IN_TEXT.NO_ACCOUNT_PROMPT}
                <button
                  disabled={isFormSubmitting}
                  type="button"
                  onClick={() => {
                    !isFormSubmitting && router.push(ROUTES.SIGN_UP);
                  }}
                  className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline"
                >
                  {SIGN_IN_TEXT.CREATE_ONE}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
