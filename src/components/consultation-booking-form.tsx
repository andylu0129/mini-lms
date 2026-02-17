'use client';

import { createConsultation } from '@/app/(protected)/dashboard/consultation-booking/actions';
import { ERROR_SOMETHING_WENT_WRONG, TEXT_BOOK_CONSULTATION, TEXT_CANCEL } from '@/constants/common';
import {
  ARIA_BACK_TO_DASHBOARD,
  HINT_DATETIME,
  HINT_REASON,
  LABEL_DATETIME,
  LABEL_FIRST_NAME,
  LABEL_LAST_NAME,
  LABEL_REASON,
  PLACEHOLDER_FIRST_NAME,
  PLACEHOLDER_LAST_NAME,
  PLACEHOLDER_REASON,
  TEXT_BACK_TO_DASHBOARD,
  TEXT_BOOKING_DESCRIPTION,
  TEXT_BOOKING_SUCCESS_DESCRIPTION,
  TEXT_BOOKING_SUCCESS_TITLE,
  TEXT_BOOKING_TITLE,
} from '@/constants/consultation-booking';
import { ROUTE_DASHBOARD } from '@/constants/routes';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Label } from '@/lib/shadcn/components/ui/label';
import { Textarea } from '@/lib/shadcn/components/ui/textarea';
import { useUserDetails } from '@/lib/supabase/auth-provider';
import { consultationBookingFormSchema } from '@/lib/zod/schemas/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CalendarPlus, Loader2 } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

type ConsultationBookingFormData = z.infer<typeof consultationBookingFormSchema>;

export function ConsultationBookingForm() {
  const router = useRouter();
  const userDetails = useUserDetails();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationBookingFormData>({
    resolver: zodResolver(consultationBookingFormSchema),
  });

  const [error, setError] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const resetForm = () => {
    reset();
    setError('');
  };

  async function handleBookingSubmit(data: ConsultationBookingFormData) {
    if (isFormSubmitting) {
      return;
    }

    setError('');
    setIsFormSubmitting(true);

    try {
      const { success } = await createConsultation({
        reason: data.reason,
        scheduled_at: data.scheduledAt.toISOString(),
      });

      if (success) {
        setIsBookingSuccess(true);
        resetForm();
        setTimeout(() => {
          handleBack();
        }, 2000);
      } else {
        setError(ERROR_SOMETHING_WENT_WRONG);
      }
    } catch (error) {
      console.error('Error booking consultation:', error);
      setError(ERROR_SOMETHING_WENT_WRONG);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  const handleDisplayError = (errorObject: typeof errors) => {
    if (errorObject.reason) {
      setError(errorObject.reason.message || '');
    } else if (errorObject.scheduledAt) {
      setError(errorObject.scheduledAt.message || '');
    }
  };

  const handleBack = () => {
    router.push(ROUTE_DASHBOARD);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <button
        className="text-muted-foreground hover:text-foreground mb-6 flex cursor-pointer items-center gap-2 text-sm transition-colors"
        aria-label={ARIA_BACK_TO_DASHBOARD}
        disabled={isFormSubmitting}
        onClick={() => {
          if (isFormSubmitting) {
            return;
          }

          handleBack();
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        {TEXT_BACK_TO_DASHBOARD}
      </button>

      <Card className="border-border shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <CalendarPlus className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">{TEXT_BOOKING_TITLE}</CardTitle>
              <CardDescription>{TEXT_BOOKING_DESCRIPTION}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isBookingSuccess ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <CalendarPlus className="text-primary h-7 w-7" />
              </div>
              <h3 className="font-display text-foreground text-lg font-semibold">{TEXT_BOOKING_SUCCESS_TITLE}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{TEXT_BOOKING_SUCCESS_DESCRIPTION}</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                handleSubmit(handleBookingSubmit, (errors) => {
                  handleDisplayError(errors);
                })(e);
              }}
              className="flex flex-col gap-5"
            >
              {error && <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">{error}</div>}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-first-name">{LABEL_FIRST_NAME}</Label>
                  <Input
                    id="booking-first-name"
                    type="text"
                    placeholder={PLACEHOLDER_FIRST_NAME}
                    readOnly
                    disabled
                    value={userDetails.firstName}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-last-name">{LABEL_LAST_NAME}</Label>
                  <Input
                    id="booking-last-name"
                    type="text"
                    placeholder={PLACEHOLDER_LAST_NAME}
                    readOnly
                    disabled
                    value={userDetails.lastName}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-reason">{LABEL_REASON}</Label>
                <Textarea
                  id="booking-reason"
                  placeholder={PLACEHOLDER_REASON}
                  rows={4}
                  className="resize-none"
                  {...register('reason')}
                />
                <p className="text-muted-foreground text-xs">{HINT_REASON}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-datetime">{LABEL_DATETIME}</Label>
                <Input
                  id="booking-datetime"
                  type="datetime-local"
                  min={moment().format('YYYY-MM-DDTHH:mm')}
                  max={moment().add(1, 'year').format('YYYY-MM-DDTHH:mm')}
                  className="[&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  {...register('scheduledAt', { valueAsDate: true })}
                />
                <p className="text-muted-foreground text-xs">{HINT_DATETIME}</p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFormSubmitting}
                  onClick={() => {
                    if (isFormSubmitting) {
                      return;
                    }

                    handleBack();
                  }}
                  className="sm:order-1"
                >
                  {TEXT_CANCEL}
                </Button>
                <Button type="submit" disabled={isFormSubmitting} className="gap-2 sm:order-2">
                  {isFormSubmitting ? <Loader2 className="mx-12.75 h-4 w-4 animate-spin" /> : TEXT_BOOK_CONSULTATION}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
