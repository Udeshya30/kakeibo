import type { BudgetMonthRecord, BudgetPlanRecord, TransactionRecord } from '@/shared/domain/persistence';
import type { BudgetPlanValues, PeriodKey, TransactionDraft } from '@/features/budgeting/domain';

export interface BudgetMonthWithPlan {
  readonly month: BudgetMonthRecord;
  readonly plan: BudgetPlanRecord;
}

export interface CreateBudgetMonthCommand {
  readonly periodKey: PeriodKey;
  readonly currency: string;
  readonly plan: BudgetPlanValues;
}

export interface UpdateBudgetPlanCommand {
  readonly monthId: string;
  readonly planId: string;
  readonly expectedUpdatedAt: string;
  readonly values: BudgetPlanValues;
}

export type BudgetOperationFailure = 'month-already-exists' | 'month-not-found' | 'month-archived' | 'stale-plan' | 'storage-failure';

export type BudgetOperationResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly reason: BudgetOperationFailure };

export interface BudgetRepository {
  listMonths: () => Promise<readonly BudgetMonthRecord[]>;
  findMonthWithPlanByPeriod: (periodKey: PeriodKey) => Promise<BudgetMonthWithPlan | null>;
  createMonthWithPlan: (command: CreateBudgetMonthCommand) => Promise<BudgetOperationResult<BudgetMonthWithPlan>>;
  updatePlan: (command: UpdateBudgetPlanCommand) => Promise<BudgetOperationResult<BudgetPlanRecord>>;
  archiveMonth: (monthId: string) => Promise<BudgetOperationResult<BudgetMonthRecord>>;
  reopenMonth: (monthId: string) => Promise<BudgetOperationResult<BudgetMonthRecord>>;
}

export interface CreateTransactionCommand {
  readonly monthId: string;
  readonly draft: TransactionDraft;
}

export interface UpdateTransactionCommand extends CreateTransactionCommand {
  readonly transactionId: string;
  readonly expectedUpdatedAt: string;
}

export interface DeleteTransactionCommand {
  readonly monthId: string;
  readonly transactionId: string;
  readonly expectedUpdatedAt: string;
}

export type TransactionOperationFailure =
  | 'month-not-found'
  | 'month-archived'
  | 'transaction-not-found'
  | 'stale-transaction'
  | 'invalid-transaction-date'
  | 'storage-failure';

export type TransactionOperationResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly reason: TransactionOperationFailure };

export interface TransactionRepository {
  listRecentByMonth: (monthId: string, limit: number) => Promise<readonly TransactionRecord[]>;
  create: (command: CreateTransactionCommand) => Promise<TransactionOperationResult<TransactionRecord>>;
  update: (command: UpdateTransactionCommand) => Promise<TransactionOperationResult<TransactionRecord>>;
  delete: (command: DeleteTransactionCommand) => Promise<TransactionOperationResult<string>>;
}
