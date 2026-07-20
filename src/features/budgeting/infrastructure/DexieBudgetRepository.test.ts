import { afterEach, describe, expect, it } from 'vitest';
import { DexieBudgetRepository } from '@/features/budgeting/infrastructure';
import { kakeiboDatabase } from '@/shared/infrastructure/database';

const repository = new DexieBudgetRepository();

afterEach(async () => {
  await kakeiboDatabase.transaction(
    'rw',
    kakeiboDatabase.budgetMonths,
    kakeiboDatabase.budgetPlans,
    async () => {
      await kakeiboDatabase.budgetPlans.clear();
      await kakeiboDatabase.budgetMonths.clear();
    }
  );
});

describe('DexieBudgetRepository', () => {
  it('creates the month and its one plan atomically, then rejects a duplicate period', async () => {
    const command = {
      periodKey: '2026-07' as const,
      currency: 'INR',
      plan: {
        plannedIncomeMinor: 100_000,
        fixedCommitmentsMinor: 20_000,
        savingsTargetMinor: 10_000,
        categoryLimitsMinor: { needs: 30_000 }
      }
    };

    const created = await repository.createMonthWithPlan(command);

    expect(created.success).toBe(true);
    expect(await kakeiboDatabase.budgetMonths.count()).toBe(1);
    expect(await kakeiboDatabase.budgetPlans.count()).toBe(1);

    const duplicate = await repository.createMonthWithPlan(command);

    expect(duplicate).toEqual({ success: false, reason: 'month-already-exists' });
    expect(await kakeiboDatabase.budgetMonths.count()).toBe(1);
    expect(await kakeiboDatabase.budgetPlans.count()).toBe(1);
  });

  it('rejects plan updates while the owning month is archived', async () => {
    const created = await repository.createMonthWithPlan({
      periodKey: '2026-08',
      currency: 'INR',
      plan: {
        plannedIncomeMinor: 100_000,
        fixedCommitmentsMinor: 0,
        savingsTargetMinor: 0,
        categoryLimitsMinor: {}
      }
    });

    if (!created.success) {
      throw new Error('The test setup could not create a budget month.');
    }

    await repository.archiveMonth(created.data.month.id);

    const result = await repository.updatePlan({
      monthId: created.data.month.id,
      planId: created.data.plan.id,
      expectedUpdatedAt: created.data.plan.updatedAt,
      values: {
        plannedIncomeMinor: 200_000,
        fixedCommitmentsMinor: 0,
        savingsTargetMinor: 0,
        categoryLimitsMinor: {}
      }
    });

    expect(result).toEqual({ success: false, reason: 'month-archived' });
  });
});
