import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  budgetPlanFormSchema,
  toBudgetPlanValues,
  type BudgetMonthWithPlan,
  type BudgetOperationFailure,
  type BudgetPlanFormInput,
  type BudgetPlanFormOutput
} from '@/features/budgeting/application';
import type { PeriodKey } from '@/features/budgeting/domain';
import { INITIAL_BASE_CURRENCY } from '@/shared/domain/persistence';
import { Button } from '@/shared/ui/actions/Button';
import { useBudgetPlanMutation } from '@/features/budgeting/presentation/hooks';
import styles from '@/features/budgeting/presentation/components/BudgetPlanForm.module.scss';

interface BudgetPlanFormProps {
  readonly periodKey: PeriodKey;
  readonly budget: BudgetMonthWithPlan | null;
  readonly onCreated: (periodKey: PeriodKey) => void;
}

function toAmountInput(value: number | undefined): string {
  return value === undefined ? '' : (value / 100).toFixed(2);
}

function createDefaultValues(periodKey: PeriodKey, budget: BudgetMonthWithPlan | null): BudgetPlanFormInput {
  const plan = budget?.plan;

  return {
    periodKey,
    plannedIncome: toAmountInput(plan?.plannedIncomeMinor ?? 0),
    fixedCommitments: toAmountInput(plan?.fixedCommitmentsMinor ?? 0),
    savingsTarget: toAmountInput(plan?.savingsTargetMinor ?? 0),
    needsLimit: toAmountInput(plan?.categoryLimitsMinor.needs),
    wantsLimit: toAmountInput(plan?.categoryLimitsMinor.wants),
    cultureLimit: toAmountInput(plan?.categoryLimitsMinor.culture),
    unexpectedLimit: toAmountInput(plan?.categoryLimitsMinor.unexpected)
  };
}

function errorMessage(reason: BudgetOperationFailure): string {
  const messages: Record<BudgetOperationFailure, string> = {
    'month-already-exists': 'A budget month already exists for this period.',
    'month-not-found': 'This budget month is no longer available.',
    'month-archived': 'Reopen this month before changing its plan.',
    'stale-plan': 'This plan changed elsewhere. Review the latest values and try again.',
    'storage-failure': 'Kakeibo could not save this plan. Your changes are still in the form.'
  };

  return messages[reason];
}

export function BudgetPlanForm({ periodKey, budget, onCreated }: BudgetPlanFormProps) {
  const isArchived = budget?.month.status === 'archived';
  const { createMonth, error, isSaving, updatePlan } = useBudgetPlanMutation();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<BudgetPlanFormInput, undefined, BudgetPlanFormOutput>({
    resolver: zodResolver(budgetPlanFormSchema),
    defaultValues: createDefaultValues(periodKey, budget)
  });

  useEffect(() => {
    reset(createDefaultValues(periodKey, budget));
  }, [budget, periodKey, reset]);

  async function onSubmit(values: BudgetPlanFormOutput): Promise<void> {
    const plan = toBudgetPlanValues(values);

    if (budget === null) {
      const created = await createMonth({ periodKey: values.periodKey, currency: INITIAL_BASE_CURRENCY, plan });

      if (created !== null) {
        onCreated(created.month.periodKey as PeriodKey);
      }

      return;
    }

    await updatePlan({
      monthId: budget.month.id,
      planId: budget.plan.id,
      expectedUpdatedAt: budget.plan.updatedAt,
      values: plan
    });
  }

  const fields = [
    ['plannedIncome', 'Planned income', 'Income you expect this month.'],
    ['fixedCommitments', 'Fixed commitments', 'Planned obligations outside discretionary categories.'],
    ['savingsTarget', 'Savings target', 'Amount you intend to set aside.'],
    ['needsLimit', 'Needs limit', 'Optional limit for necessities.'],
    ['wantsLimit', 'Wants limit', 'Optional limit for discretionary spending.'],
    ['cultureLimit', 'Culture limit', 'Optional limit for learning and cultural spending.'],
    ['unexpectedLimit', 'Unexpected limit', 'Optional limit for unplanned spending.']
  ] as const;

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.field}>
        <label htmlFor="period-key">Budget month</label>
        <input id="period-key" type="month" disabled={budget !== null} {...register('periodKey')} />
        {errors.periodKey !== undefined ? <p className={styles.error}>{errors.periodKey.message}</p> : null}
      </div>
      <fieldset className={styles.fieldset} disabled={isArchived || isSaving}>
        <legend>Plan amounts</legend>
        <p className={styles.help}>Amounts are recorded in Indian rupees. Category limits are optional.</p>
        <div className={styles.grid}>
          {fields.map(([name, label, help]) => (
            <div className={styles.field} key={name}>
              <label htmlFor={name}>{label}</label>
              <div className={styles.amountControl}>
                <span aria-hidden="true">₹</span>
                <input
                  id={name}
                  inputMode="decimal"
                  min="0"
                  placeholder={name.endsWith('Limit') ? 'Optional' : '0.00'}
                  step="0.01"
                  type="number"
                  aria-describedby={`${name}-help ${errors[name] !== undefined ? `${name}-error` : ''}`.trim()}
                  {...register(name)}
                />
              </div>
              <span className={styles.help} id={`${name}-help`}>
                {help}
              </span>
              {errors[name] !== undefined ? (
                <p className={styles.error} id={`${name}-error`}>
                  {errors[name]?.message}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </fieldset>
      {error !== null ? (
        <p className={styles.operationError} role="alert">
          {errorMessage(error)}
        </p>
      ) : null}
      {isArchived ? <p className={styles.archivedMessage}>This month is archived. Reopen it to edit the plan.</p> : null}
      <div className={styles.actions}>
        <Button disabled={isArchived || isSaving} type="submit">
          {isSaving ? 'Saving plan…' : budget === null ? 'Create month and save plan' : 'Save plan'}
        </Button>
      </div>
    </form>
  );
}
