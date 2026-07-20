import { useState } from 'react';
import type { BudgetOperationFailure } from '@/features/budgeting/application';
import { budgetService } from '@/features/budgeting/infrastructure/budgetService';

export function useBudgetLifecycle() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<BudgetOperationFailure | null>(null);

  async function changeStatus(monthId: string, operation: 'archive' | 'reopen'): Promise<boolean> {
    setIsUpdating(true);
    setError(null);
    const result = operation === 'archive' ? await budgetService.archiveMonth(monthId) : await budgetService.reopenMonth(monthId);
    setIsUpdating(false);

    if (!result.success) {
      setError(result.reason);
      return false;
    }

    return true;
  }

  return {
    isUpdating,
    error,
    archive: (monthId: string) => changeStatus(monthId, 'archive'),
    reopen: (monthId: string) => changeStatus(monthId, 'reopen')
  };
}
