import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetPlanForm } from '@/features/budgeting/presentation/components';
import { kakeiboDatabase } from '@/shared/infrastructure/database';

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

describe('BudgetPlanForm', () => {
  it('creates a validated month and plan from accessible form controls', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    render(<BudgetPlanForm budget={null} onCreated={onCreated} periodKey="2026-07" />);

    await user.clear(screen.getByLabelText('Planned income'));
    await user.type(screen.getByLabelText('Planned income'), '25000.50');
    await user.clear(screen.getByLabelText('Fixed commitments'));
    await user.type(screen.getByLabelText('Fixed commitments'), '5000');
    await user.clear(screen.getByLabelText('Savings target'));
    await user.type(screen.getByLabelText('Savings target'), '2000');
    await user.click(screen.getByRole('button', { name: 'Create month and save plan' }));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith('2026-07');
    });

    const plan = await kakeiboDatabase.budgetPlans.toCollection().first();

    expect(plan).toMatchObject({
      plannedIncomeMinor: 2_500_050,
      fixedCommitmentsMinor: 500_000,
      savingsTargetMinor: 200_000,
      currency: 'INR'
    });
  });
});
