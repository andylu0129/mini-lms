import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALIDATION_DATETIME_FUTURE,
  VALIDATION_DATETIME_REQUIRED,
  VALIDATION_FIRST_NAME_REQUIRED,
  VALIDATION_LAST_NAME_REQUIRED,
  VALIDATION_PASSWORD_COMPLEXITY,
  VALIDATION_PASSWORD_MAX,
  VALIDATION_PASSWORD_MIN,
  VALIDATION_PASSWORDS_DO_NOT_MATCH,
  VALIDATION_REASON_REQUIRED,
} from '@/constants/validation';
import z from 'zod';

export const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, VALIDATION_FIRST_NAME_REQUIRED),
    lastName: z.string().min(1, VALIDATION_LAST_NAME_REQUIRED),
    email: z.email(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, VALIDATION_PASSWORD_MIN)
      .max(64, VALIDATION_PASSWORD_MAX)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/, VALIDATION_PASSWORD_COMPLEXITY),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: VALIDATION_PASSWORDS_DO_NOT_MATCH,
      path: ['confirmPassword'],
    },
  );

export const signInFormSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, VALIDATION_PASSWORD_MIN)
    .max(PASSWORD_MAX_LENGTH, VALIDATION_PASSWORD_MAX)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/, VALIDATION_PASSWORD_COMPLEXITY),
});

export const consultationBookingFormSchema = z.object({
  reason: z.string().min(1, VALIDATION_REASON_REQUIRED),
  scheduledAt: z.date({ error: VALIDATION_DATETIME_REQUIRED }).min(new Date(), VALIDATION_DATETIME_FUTURE),
});
