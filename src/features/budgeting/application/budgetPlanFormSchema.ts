import { z } from 'zod';
import { periodKeySchema } from '@/features/budgeting/domain';

const MAX_MINOR_UNITS = Number.MAX_SAFE_INTEGER;
const amountPattern = /^\d+(?:\.\d{1,2})?$/;

function parseAmountToMinor(value: string): number {
  const [wholePart, fractionPart = ''] = value.split('.');
  const wholeMinor = Number(wholePart) * 100;
  const fractionMinor = Number(fractionPart.padEnd(2, '0'));

  return wholeMinor + fractionMinor;
}

const requiredAmountSchema = z
  .string()
  .trim()
  .regex(amountPattern, 'Enter a valid amount with up to two decimal places.')
  .transform(parseAmountToMinor)
  .refine((value) => Number.isSafeInteger(value) && value <= MAX_MINOR_UNITS, 'Enter a smaller amount.');

const optionalAmountSchema = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .pipe(requiredAmountSchema.optional());

export const budgetPlanFormSchema = z.object({
  periodKey: periodKeySchema,
  plannedIncome: requiredAmountSchema,
  fixedCommitments: requiredAmountSchema,
  savingsTarget: requiredAmountSchema,
  needsLimit: optionalAmountSchema,
  wantsLimit: optionalAmountSchema,
  cultureLimit: optionalAmountSchema,
  unexpectedLimit: optionalAmountSchema
});

export type BudgetPlanFormInput = z.input<typeof budgetPlanFormSchema>;
export type BudgetPlanFormOutput = z.output<typeof budgetPlanFormSchema>;
