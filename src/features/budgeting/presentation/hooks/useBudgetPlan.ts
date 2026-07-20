import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { PeriodKey } from '@/features/budgeting/domain';
import { budgetService } from '@/features/budgeting/infrastructure/budgetService';
import { useBudgetStore } from '@/features/budgeting/presentation/hooks/useBudgetStore';

export function useBudgetPlan(periodKey: PeriodKey | null) {
  const setSelectedPeriodKey = useBudgetStore((state) => state.setSelectedPeriodKey);
  const months = useLiveQuery(() => budgetService.listMonths(), [], undefined);
  const budget = useLiveQuery(
    () => (periodKey === null ? Promise.resolve(null) : budgetService.getMonthWithPlan(periodKey)),
    [periodKey],
    undefined
  );

  useEffect(() => {
    setSelectedPeriodKey(periodKey);

    return () => {
      setSelectedPeriodKey(null);
    };
  }, [periodKey, setSelectedPeriodKey]);

  return { months, budget };
}
