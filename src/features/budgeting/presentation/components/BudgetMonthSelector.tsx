import type { BudgetMonthRecord } from '@/shared/domain/persistence';
import styles from '@/features/budgeting/presentation/components/BudgetMonthSelector.module.scss';

interface BudgetMonthSelectorProps {
  readonly months: readonly BudgetMonthRecord[];
  readonly selectedPeriodKey: string | null;
  readonly onSelect: (periodKey: string) => void;
  readonly onCreateNew: () => void;
}

export function BudgetMonthSelector({ months, selectedPeriodKey, onSelect, onCreateNew }: BudgetMonthSelectorProps) {
  return (
    <section className={styles.container} aria-label="Budget month">
      <label className={styles.label} htmlFor="budget-month-selector">
        Budget month
      </label>
      <div className={styles.controls}>
        <select
          id="budget-month-selector"
          value={selectedPeriodKey ?? ''}
          onChange={(event) => onSelect(event.target.value)}
        >
          {months.map((month) => (
            <option key={month.id} value={month.periodKey}>
              {month.periodKey}{month.status === 'archived' ? ' (archived)' : ''}
            </option>
          ))}
        </select>
        <button className={styles.createButton} type="button" onClick={onCreateNew}>
          Create month
        </button>
      </div>
    </section>
  );
}
