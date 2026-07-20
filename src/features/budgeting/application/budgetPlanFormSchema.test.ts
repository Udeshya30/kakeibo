import { describe, expect, it } from 'vitest';
import { budgetPlanFormSchema } from '@/features/budgeting/application';

describe('budgetPlanFormSchema', () => {
  it('converts user-entered rupees into integer minor units', () => {
    const result = budgetPlanFormSchema.safeParse({
      periodKey: '2026-07',
      plannedIncome: '25000.50',
      fixedCommitments: '1250',
      savingsTarget: '5000.25',
      needsLimit: '',
      wantsLimit: '450.10',
      cultureLimit: '',
      unexpectedLimit: '0'
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toMatchObject({
        plannedIncome: 2_500_050,
        fixedCommitments: 125_000,
        savingsTarget: 500_025,
        wantsLimit: 45_010,
        unexpectedLimit: 0
      });
      expect(result.data.needsLimit).toBeUndefined();
    }
  });

  it('rejects invalid period and monetary precision', () => {
    const result = budgetPlanFormSchema.safeParse({
      periodKey: '2026-13',
      plannedIncome: '10.999',
      fixedCommitments: '0',
      savingsTarget: '0',
      needsLimit: '',
      wantsLimit: '',
      cultureLimit: '',
      unexpectedLimit: ''
    });

    expect(result.success).toBe(false);
  });
});
