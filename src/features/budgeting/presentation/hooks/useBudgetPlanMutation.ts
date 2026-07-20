import { useState } from 'react';
import type { BudgetMonthWithPlan, BudgetOperationFailure } from '@/features/budgeting/application';
import { budgetService } from '@/features/budgeting/infrastructure/budgetService';

interface BudgetPlanMutationState {
  readonly isSaving: boolean;
  readonly error: BudgetOperationFailure | null;
}

export function useBudgetPlanMutation() {
  const [state, setState] = useState<BudgetPlanMutationState>({ isSaving: false, error: null });

  async function createMonth(command: Parameters<typeof budgetService.createMonth>[0]): Promise<BudgetMonthWithPlan | null> {
    setState({ isSaving: true, error: null });
    const result = await budgetService.createMonth(command);

    if (!result.success) {
      setState({ isSaving: false, error: result.reason });
      return null;
    }

    setState({ isSaving: false, error: null });
    return result.data;
  }

  async function updatePlan(command: Parameters<typeof budgetService.updatePlan>[0]): Promise<boolean> {
    setState({ isSaving: true, error: null });
    const result = await budgetService.updatePlan(command);

    if (!result.success) {
      setState({ isSaving: false, error: result.reason });
      return false;
    }

    setState({ isSaving: false, error: null });
    return true;
  }

  return { ...state, createMonth, updatePlan };
}
