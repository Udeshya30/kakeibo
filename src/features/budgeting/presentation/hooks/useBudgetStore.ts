import { create } from 'zustand';
import type { PeriodKey } from '@/features/budgeting/domain';

interface BudgetStoreState {
  readonly selectedPeriodKey: PeriodKey | null;
  setSelectedPeriodKey: (periodKey: PeriodKey | null) => void;
}

export const useBudgetStore = create<BudgetStoreState>((set) => ({
  selectedPeriodKey: null,
  setSelectedPeriodKey: (selectedPeriodKey) => {
    set({ selectedPeriodKey });
  }
}));
