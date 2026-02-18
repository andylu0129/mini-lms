'use client';

import { APP } from '@/constants/common';
import { ROUTES } from '@/constants/routes';
import { SIGN_UP_TEXT } from '@/constants/sign-up';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { BookOpen, MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SignUpSuccess() {
  const router = useRouter();

  const navigateToSignInPage = () => {
    router.push(ROUTES.SIGN_IN);
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <BookOpen className="text-primary-foreground h-6 w-6" />
          </div>
          <h1 className="font-display text-foreground text-2xl font-bold">{APP.NAME}</h1>
          <p className="text-muted-foreground text-sm">{APP.TAGLINE}</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="flex flex-col items-center gap-3 pt-8 pb-2 text-center">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
              <MailCheck className="text-primary h-7 w-7" />
            </div>
            <CardTitle className="font-display text-xl">{SIGN_UP_TEXT.SUCCESS.TITLE}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 px-6 pt-2 pb-8 text-center">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {SIGN_UP_TEXT.SUCCESS.DESCRIPTION}
            </p>
            <Button variant="default" className="w-full" onClick={navigateToSignInPage}>
              {SIGN_UP_TEXT.SUCCESS.BACK_TO_SIGN_IN}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
