'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/lib/shadcn/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn/components/ui/card';
import { Input } from '@/lib/shadcn/components/ui/input';
import { Label } from '@/lib/shadcn/components/ui/label';
import { Textarea } from '@/lib/shadcn/components/ui/textarea';

import { consultationBookingFormSchema } from '@/lib/zod/schemas/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

type ConsultationBookingFormData = z.infer<typeof consultationBookingFormSchema>;

export function ConsultationBookingForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationBookingFormData>({
    resolver: zodResolver(consultationBookingFormSchema),
  });

  const [error, setError] = useState('');
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const resetForm = () => {
    reset();
    setError('');
  };

  function handleBookingSubmit(data: ConsultationBookingFormData) {
    setError('');
    setIsBookingSuccess(true);
    console.log('data', data);

    setTimeout(() => {
      handleBack();
    }, 2000);
  }

  const handleDisplayError = (errorObject: typeof errors) => {
    if (errorObject.firstName) {
      setError(errorObject.firstName.message || '');
    } else if (errorObject.lastName) {
      setError(errorObject.lastName.message || '');
    } else if (errorObject.reason) {
      setError(errorObject.reason.message || '');
    } else if (errorObject.scheduledAt) {
      setError(errorObject.scheduledAt.message || '');
    }
  };

  const handleBack = () => {
    resetForm();
    router.push('/dashboard');
  };

  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <button
          onClick={() => {
            handleBack();
          }}
          className="text-muted-foreground hover:text-foreground mb-6 flex cursor-pointer items-center gap-2 text-sm transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <CalendarPlus className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Book a Consultation</CardTitle>
                <CardDescription>Fill out the details below to schedule a new session</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isBookingSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <CalendarPlus className="text-primary h-7 w-7" />
                </div>
                <h3 className="font-display text-foreground text-lg font-semibold">Consultation Booked</h3>
                <p className="text-muted-foreground mt-1 text-sm">Redirecting to your dashboard...</p>
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
                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">{error}</div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="booking-first-name">First Name</Label>
                    <Input id="booking-first-name" type="text" placeholder="Jane" {...register('firstName')} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="booking-last-name">Last Name</Label>
                    <Input id="booking-last-name" type="text" placeholder="Doe" {...register('lastName')} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-reason">Reason for Consultation</Label>
                  <Textarea
                    id="booking-reason"
                    placeholder="Describe the purpose of your consultation..."
                    rows={4}
                    className="resize-none"
                    {...register('reason')}
                  />
                  <p className="text-muted-foreground text-xs">
                    Provide a brief description so the advisor can prepare.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-datetime">Date and Time</Label>
                  <Input
                    id="booking-datetime"
                    type="datetime-local"
                    min={moment().format('YYYY-MM-DDTHH:mm')}
                    max={moment().add(1, 'year').format('YYYY-MM-DDTHH:mm')}
                    className="[&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    {...register('scheduledAt', { valueAsDate: true })}
                  />
                  <p className="text-muted-foreground text-xs">Choose a date and time that works for you.</p>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleBack();
                    }}
                    className="sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2 sm:order-2">
                    <CalendarPlus className="h-4 w-4" />
                    Book Consultation
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
