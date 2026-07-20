import type { BudgetPlanValues, PeriodKey } from '@/features/budgeting/domain';
import type {
  BudgetMonthWithPlan,
  BudgetOperationResult,
  BudgetRepository,
  CreateBudgetMonthCommand,
  UpdateBudgetPlanCommand
} from '@/features/budgeting/application/contracts';
import type { BudgetMonthRecord, BudgetPlanRecord } from '@/shared/domain/persistence';

export class BudgetService {
  public constructor(private readonly repository: BudgetRepository) {}

  public listMonths(): Promise<readonly BudgetMonthRecord[]> {
    return this.repository.listMonths();
  }

  public getMonthWithPlan(periodKey: PeriodKey): Promise<BudgetMonthWithPlan | null> {
    return this.repository.findMonthWithPlanByPeriod(periodKey);
  }

  public createMonth(command: CreateBudgetMonthCommand): Promise<BudgetOperationResult<BudgetMonthWithPlan>> {
    return this.repository.createMonthWithPlan(command);
  }

  public updatePlan(command: UpdateBudgetPlanCommand): Promise<BudgetOperationResult<BudgetPlanRecord>> {
    return this.repository.updatePlan(command);
  }

  public archiveMonth(monthId: string): Promise<BudgetOperationResult<BudgetMonthRecord>> {
    return this.repository.archiveMonth(monthId);
  }

  public reopenMonth(monthId: string): Promise<BudgetOperationResult<BudgetMonthRecord>> {
    return this.repository.reopenMonth(monthId);
  }
}

export function toBudgetPlanValues(output: {
  readonly plannedIncome: number;
  readonly fixedCommitments: number;
  readonly savingsTarget: number;
  readonly needsLimit?: number;
  readonly wantsLimit?: number;
  readonly cultureLimit?: number;
  readonly unexpectedLimit?: number;
}): BudgetPlanValues {
  return {
    plannedIncomeMinor: output.plannedIncome,
    fixedCommitmentsMinor: output.fixedCommitments,
    savingsTargetMinor: output.savingsTarget,
    categoryLimitsMinor: {
      needs: output.needsLimit,
      wants: output.wantsLimit,
      culture: output.cultureLimit,
      unexpected: output.unexpectedLimit
    }
  };
}

export function toTransactionDraft(output: {
  readonly type: 'income' | 'expense';
  readonly category?: 'needs' | 'wants' | 'culture' | 'unexpected';
  readonly amount: number;
  readonly occurredOn: string;
  readonly note: string;
}) {
  if (output.type === 'income') {
    return {
      type: 'income' as const,
      amountMinor: output.amount,
      occurredOn: output.occurredOn,
      note: output.note
    };
  }

  if (output.category === undefined) {
    throw new Error('Expense transactions require a category after validation.');
  }

  return {
    type: 'expense' as const,
    category: output.category,
    amountMinor: output.amount,
    occurredOn: output.occurredOn,
    note: output.note
  };
}
