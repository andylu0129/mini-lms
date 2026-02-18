'use client';

import { createConsultation } from '@/app/(protected)/dashboard/consultation-booking/actions';
import { COMMON_TEXT, ERRORS } from '@/constants/common';
import { CONSULTATION_BOOKING } from '@/constants/consultation-booking';
import { FIELDS } from '@/constants/fields';
import { ROUTES } from '@/constants/routes';
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

  const handleBookingSubmit = async (data: ConsultationBookingFormData) => {
    if (isFormSubmitting) {
      return;
    }

    setError('');
    setIsFormSubmitting(true);

    try {
      const { success } = await createConsultation({
        reason: data[FIELDS.REASON],
        scheduled_at: data[FIELDS.SCHEDULED_AT].toISOString(),
      });

      if (success) {
        setIsBookingSuccess(true);
        resetForm();
        setTimeout(() => {
          handleBack();
        }, CONSULTATION_BOOKING.SUCCESS.REDIRECT_DELAY_MS);
      } else {
        setError(ERRORS.SOMETHING_WENT_WRONG);
      }
    } catch (error) {
      console.error('Error booking consultation:', error);
      setError(ERRORS.SOMETHING_WENT_WRONG);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDisplayError = (errorObject: typeof errors) => {
    if (errorObject[FIELDS.REASON]) {
      setError(errorObject[FIELDS.REASON]?.message || '');
    } else if (errorObject[FIELDS.SCHEDULED_AT]) {
      setError(errorObject[FIELDS.SCHEDULED_AT]?.message || '');
    }
  };

  const handleBack = () => {
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <button
        className="text-muted-foreground hover:text-foreground mb-6 flex cursor-pointer items-center gap-2 text-sm transition-colors"
        aria-label={CONSULTATION_BOOKING.ARIA.BACK_TO_DASHBOARD}
        disabled={isFormSubmitting}
        onClick={() => {
          if (isFormSubmitting) {
            return;
          }

          handleBack();
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        {CONSULTATION_BOOKING.BACK_TO_DASHBOARD}
      </button>

      <Card className="border-border shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <CalendarPlus className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">{CONSULTATION_BOOKING.TITLE}</CardTitle>
              <CardDescription>{CONSULTATION_BOOKING.DESCRIPTION}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isBookingSuccess ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <CalendarPlus className="text-primary h-7 w-7" />
              </div>
              <h3 className="font-display text-foreground text-lg font-semibold">
                {CONSULTATION_BOOKING.SUCCESS.TITLE}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{CONSULTATION_BOOKING.SUCCESS.DESCRIPTION}</p>
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
                  <Label htmlFor="booking-first-name">{CONSULTATION_BOOKING.LABEL.FIRST_NAME}</Label>
                  <Input
                    id="booking-first-name"
                    type="text"
                    placeholder={CONSULTATION_BOOKING.PLACEHOLDER.FIRST_NAME}
                    readOnly
                    disabled
                    value={userDetails[FIELDS.FIRST_NAME]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-last-name">{CONSULTATION_BOOKING.LABEL.LAST_NAME}</Label>
                  <Input
                    id="booking-last-name"
                    type="text"
                    placeholder={CONSULTATION_BOOKING.PLACEHOLDER.LAST_NAME}
                    readOnly
                    disabled
                    value={userDetails[FIELDS.LAST_NAME]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-reason">{CONSULTATION_BOOKING.LABEL.REASON}</Label>
                <Textarea
                  id="booking-reason"
                  placeholder={CONSULTATION_BOOKING.PLACEHOLDER.REASON}
                  rows={4}
                  className="resize-none"
                  {...register(FIELDS.REASON)}
                />
                <p className="text-muted-foreground text-xs">{CONSULTATION_BOOKING.HINT.REASON}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-datetime">{CONSULTATION_BOOKING.LABEL.DATETIME}</Label>
                <Input
                  id="booking-datetime"
                  type="datetime-local"
                  min={moment().format('YYYY-MM-DDTHH:mm')}
                  max={moment().add(1, 'year').format('YYYY-MM-DDTHH:mm')}
                  className="w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  {...register(FIELDS.SCHEDULED_AT, { valueAsDate: true })}
                />
                <p className="text-muted-foreground text-xs">{CONSULTATION_BOOKING.HINT.DATETIME}</p>
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
                  {COMMON_TEXT.CANCEL}
                </Button>
                <Button type="submit" disabled={isFormSubmitting} className="gap-2 sm:order-2">
                  {isFormSubmitting ? (
                    <Loader2 className="mx-12.75 h-4 w-4 animate-spin" />
                  ) : (
                    COMMON_TEXT.BOOK_CONSULTATION
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
