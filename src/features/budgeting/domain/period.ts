import { z } from 'zod';

export const periodKeySchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Choose a valid month.');

export type PeriodKey = z.infer<typeof periodKeySchema>;
