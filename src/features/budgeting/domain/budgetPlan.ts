import type { KakeiboCategory } from '@/shared/domain/persistence';

export const kakeiboCategories = ['needs', 'wants', 'culture', 'unexpected'] as const satisfies readonly KakeiboCategory[];

export interface BudgetPlanValues {
  readonly plannedIncomeMinor: number;
  readonly fixedCommitmentsMinor: number;
  readonly savingsTargetMinor: number;
  readonly categoryLimitsMinor: Readonly<Partial<Record<KakeiboCategory, number>>>;
}

export function calculatePlannedAvailable(plan: BudgetPlanValues): number {
  return plan.plannedIncomeMinor - plan.fixedCommitmentsMinor - plan.savingsTargetMinor;
}
