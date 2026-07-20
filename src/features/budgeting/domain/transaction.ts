import type { KakeiboCategory } from '@/shared/domain/persistence';
import type { PeriodKey } from '@/features/budgeting/domain/period';

export type TransactionDraft =
  | {
      readonly type: 'income';
      readonly amountMinor: number;
      readonly occurredOn: string;
      readonly note: string;
    }
  | {
      readonly type: 'expense';
      readonly category: KakeiboCategory;
      readonly amountMinor: number;
      readonly occurredOn: string;
      readonly note: string;
    };

export function belongsToBudgetPeriod(occurredOn: string, periodKey: PeriodKey): boolean {
  return occurredOn.startsWith(`${periodKey}-`);
}
