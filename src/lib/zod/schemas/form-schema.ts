import z from 'zod';

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be at most 64 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).*$/,
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  );

export const signUpFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email(),
  password: passwordRule,
  confirmPassword: passwordRule,
});

export const signInFormSchema = z.object({
  email: z.email(),
  password: passwordRule,
});
