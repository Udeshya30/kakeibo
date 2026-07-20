import { z } from 'zod';
import { periodKeySchema } from '@/features/budgeting/domain';

const amountPattern = /^\d+(?:\.\d{1,2})?$/;
const categorySchema = z.enum(['needs', 'wants', 'culture', 'unexpected']);

function parseAmountToMinor(value: string): number {
  const [wholePart, fractionPart = ''] = value.split('.');

  return Number(wholePart) * 100 + Number(fractionPart.padEnd(2, '0'));
}

const amountSchema = z
  .string()
  .trim()
  .regex(amountPattern, 'Enter a valid amount with up to two decimal places.')
  .transform(parseAmountToMinor)
  .refine((value) => Number.isSafeInteger(value) && value > 0, 'Enter an amount greater than zero.');

export function createTransactionFormSchema(periodKey: string) {
  const validPeriodKey = periodKeySchema.parse(periodKey);

  return z
    .object({
      type: z.enum(['income', 'expense']),
      category: categorySchema.optional(),
      amount: amountSchema,
      occurredOn: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date.'),
      note: z.string().trim().max(500, 'Keep the note to 500 characters or fewer.')
    })
    .superRefine((value, context) => {
      if (value.type === 'expense' && value.category === undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Choose a Kakeibo category for an expense.',
          path: ['category']
        });
      }

      if (!value.occurredOn.startsWith(`${validPeriodKey}-`)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'The transaction date must be inside this budget month.',
          path: ['occurredOn']
        });
      }
    });
}

export type TransactionFormInput = z.input<ReturnType<typeof createTransactionFormSchema>>;
export type TransactionFormOutput = z.output<ReturnType<typeof createTransactionFormSchema>>;
