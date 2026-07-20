import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { periodKeySchema, type PeriodKey } from '@/features/budgeting/domain';
import { BudgetMonthSelector, BudgetPlanForm, PlanOverviewCard } from '@/features/budgeting/presentation/components';
import { useBudgetLifecycle, useBudgetPlan } from '@/features/budgeting/presentation/hooks';
import { INITIAL_BASE_CURRENCY, INITIAL_LOCALE } from '@/shared/domain/persistence';
import { Button } from '@/shared/ui/actions/Button';
import styles from '@/features/budgeting/presentation/routes/BudgetPlanPage.module.scss';

function resolvePeriodKey(value: string | null): PeriodKey | null {
  const parsed = periodKeySchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

function getDefaultPeriodKey(): PeriodKey {
  return dayjs().format('YYYY-MM') as PeriodKey;
}

export function BudgetPlanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPeriodKey = resolvePeriodKey(searchParams.get('month'));
  const { budget, months } = useBudgetPlan(requestedPeriodKey);
  const [isCreatingAnotherMonth, setIsCreatingAnotherMonth] = useState(false);
  const { archive, error: lifecycleError, isUpdating, reopen } = useBudgetLifecycle();

  const selectedPeriodKey = requestedPeriodKey ?? months?.[0]?.periodKey ?? null;
  const displayedBudget = budget;
  const creationPeriodKey = isCreatingAnotherMonth ? getDefaultPeriodKey() : selectedPeriodKey ?? getDefaultPeriodKey();

  function selectPeriod(periodKey: string): void {
    setIsCreatingAnotherMonth(false);
    setSearchParams({ month: periodKey });
  }

  useEffect(() => {
    if (requestedPeriodKey === null && months !== undefined && months.length > 0 && !isCreatingAnotherMonth) {
      setSearchParams({ month: months[0].periodKey }, { replace: true });
    }
  }, [isCreatingAnotherMonth, months, requestedPeriodKey, setSearchParams]);

  function createNewMonth(): void {
    setIsCreatingAnotherMonth(true);
  }

  async function updateLifecycle(operation: 'archive' | 'reopen'): Promise<void> {
    if (displayedBudget === undefined || displayedBudget === null) {
      return;
    }

    if (operation === 'archive') {
      await archive(displayedBudget.month.id);
      return;
    }

    await reopen(displayedBudget.month.id);
  }

  if (months === undefined || (requestedPeriodKey !== null && budget === undefined) || (requestedPeriodKey === null && months.length > 0 && !isCreatingAnotherMonth)) {
    return <p className={styles.status} role="status">Loading your budget month…</p>;
  }

  const shouldShowCreateForm = isCreatingAnotherMonth || selectedPeriodKey === null || displayedBudget === null;
  const overviewPlan = displayedBudget === null || displayedBudget === undefined ? null : displayedBudget.plan;

  return (
    <section className={styles.page} aria-labelledby="page-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Monthly planning</p>
          <h1 id="page-title">Plan your month</h1>
          <p>Decide what matters before you start spending.</p>
        </div>
        {months.length > 0 ? (
          <BudgetMonthSelector
            months={months}
            selectedPeriodKey={selectedPeriodKey}
            onCreateNew={createNewMonth}
            onSelect={selectPeriod}
          />
        ) : null}
      </header>

      {requestedPeriodKey !== null && budget === null ? (
        <p className={styles.notice} role="status">
          No budget month exists for {requestedPeriodKey}. Create it below to begin planning.
        </p>
      ) : null}

      {overviewPlan !== null ? (
        <PlanOverviewCard currency={overviewPlan.currency} locale={INITIAL_LOCALE} plan={overviewPlan} />
      ) : null}

      <BudgetPlanForm
        budget={shouldShowCreateForm ? null : displayedBudget ?? null}
        onCreated={(periodKey) => {
          setIsCreatingAnotherMonth(false);
          setSearchParams({ month: periodKey });
        }}
        periodKey={shouldShowCreateForm ? creationPeriodKey : selectedPeriodKey ?? getDefaultPeriodKey()}
      />

      {displayedBudget !== undefined && displayedBudget !== null && !shouldShowCreateForm ? (
        <section className={styles.lifecycle} aria-labelledby="lifecycle-title">
          <h2 id="lifecycle-title">Month lifecycle</h2>
          <p>
            {displayedBudget.month.status === 'archived'
              ? 'Archived months remain available for review but their plans cannot be edited.'
              : 'Archive this month after completing its review to prevent accidental plan changes.'}
          </p>
          <Button
            disabled={isUpdating}
            onClick={() => void updateLifecycle(displayedBudget.month.status === 'archived' ? 'reopen' : 'archive')}
            variant="secondary"
          >
            {isUpdating
              ? 'Updating month…'
              : displayedBudget.month.status === 'archived'
                ? 'Reopen month'
                : 'Archive month'}
          </Button>
          {lifecycleError !== null ? <p className={styles.error} role="alert">Kakeibo could not update this month.</p> : null}
        </section>
      ) : null}

      <p className={styles.currencyNote}>This foundation uses {INITIAL_BASE_CURRENCY} until preferences are introduced.</p>
    </section>
  );
}
