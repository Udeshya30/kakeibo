export type KakeiboCategory = 'needs' | 'wants' | 'culture' | 'unexpected';
export type TransactionType = 'income' | 'expense';

export interface AppSettingsRecord {
  readonly id: 'app-settings';
  readonly baseCurrency: string;
  readonly locale: string;
  readonly weekStartsOn: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BudgetMonthRecord {
  readonly id: string;
  readonly periodKey: string;
  readonly status: 'active' | 'archived';
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
}

export interface BudgetPlanRecord {
  readonly id: string;
  readonly monthId: string;
  readonly plannedIncomeMinor: number;
  readonly fixedCommitmentsMinor: number;
  readonly savingsTargetMinor: number;
  readonly categoryLimitsMinor: Readonly<Partial<Record<KakeiboCategory, number>>>;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface TransactionRecordBase {
  readonly id: string;
  readonly monthId: string;
  readonly amountMinor: number;
  readonly currency: string;
  readonly occurredOn: string;
  readonly note: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface IncomeTransactionRecord extends TransactionRecordBase {
  readonly type: 'income';
  readonly category?: never;
}

export interface ExpenseTransactionRecord extends TransactionRecordBase {
  readonly type: 'expense';
  readonly category: KakeiboCategory;
}

export type TransactionRecord = IncomeTransactionRecord | ExpenseTransactionRecord;

export interface MonthlyReviewRecord {
  readonly id: string;
  readonly monthId: string;
  readonly answers: Readonly<Record<string, string>>;
  readonly nextMonthIntention: string;
  readonly completedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type AppMetadataValue = string | number | boolean | null;

export interface AppMetadataRecord {
  readonly key: 'lastSuccessfulBackupAt' | 'lastSuccessfulRestoreAt';
  readonly value: AppMetadataValue;
  readonly updatedAt: string;
}
