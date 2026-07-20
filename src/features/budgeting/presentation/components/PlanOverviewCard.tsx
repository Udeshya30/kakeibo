import { calculatePlannedAvailable } from '@/features/budgeting/domain';
import type { BudgetPlanValues } from '@/features/budgeting/domain';
import { formatMoney } from '@/shared/lib/formatMoney';
import styles from '@/features/budgeting/presentation/components/PlanOverviewCard.module.scss';

interface PlanOverviewCardProps {
  readonly plan: BudgetPlanValues;
  readonly currency: string;
  readonly locale: string;
}

export function PlanOverviewCard({ plan, currency, locale }: PlanOverviewCardProps) {
  const plannedAvailable = calculatePlannedAvailable(plan);
  const metrics = [
    ['Planned income', plan.plannedIncomeMinor],
    ['Fixed commitments', plan.fixedCommitmentsMinor],
    ['Savings target', plan.savingsTargetMinor],
    ['Planned available', plannedAvailable]
  ] as const;

  return (
    <section className={styles.card} aria-labelledby="plan-overview-title">
      <h2 id="plan-overview-title">Plan overview</h2>
      <dl className={styles.metrics}>
        {metrics.map(([label, amount]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={amount < 0 ? styles.negative : undefined}>{formatMoney(amount, currency, locale)}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.description}>Planned available is income minus fixed commitments and your savings target.</p>
    </section>
  );
}
