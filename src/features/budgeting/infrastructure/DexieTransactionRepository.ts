import Dexie from 'dexie';
import { belongsToBudgetPeriod } from '@/features/budgeting/domain';
import type {
  CreateTransactionCommand,
  DeleteTransactionCommand,
  TransactionOperationResult,
  TransactionRepository,
  UpdateTransactionCommand
} from '@/features/budgeting/application';
import type { BudgetMonthRecord, TransactionRecord } from '@/shared/domain/persistence';
import { kakeiboDatabase } from '@/shared/infrastructure/database';

function createIdentifier(): string {
  return crypto.randomUUID();
}

export class DexieTransactionRepository implements TransactionRepository {
  public async listRecentByMonth(monthId: string, limit: number): Promise<readonly TransactionRecord[]> {
    return kakeiboDatabase.transactions
      .where('[monthId+occurredOn+id]')
      .between([monthId, Dexie.minKey, Dexie.minKey], [monthId, Dexie.maxKey, Dexie.maxKey])
      .reverse()
      .limit(limit)
      .toArray();
  }

  public async create(command: CreateTransactionCommand): Promise<TransactionOperationResult<TransactionRecord>> {
    try {
      return await kakeiboDatabase.transaction(
        'rw',
        kakeiboDatabase.budgetMonths,
        kakeiboDatabase.budgetPlans,
        kakeiboDatabase.transactions,
        async () => {
          const context = await this.getWritableMonthContext(command.monthId);

          if (!context.success) {
            return context;
          }

          if (!belongsToBudgetPeriod(command.draft.occurredOn, context.data.month.periodKey as `${number}-${number}`)) {
            return { success: false, reason: 'invalid-transaction-date' };
          }

          const timestamp = new Date().toISOString();
          let record: TransactionRecord;

          if (command.draft.type === 'income') {
            record = {
              id: createIdentifier(),
              monthId: command.monthId,
              type: 'income',
              amountMinor: command.draft.amountMinor,
              currency: context.data.currency,
              occurredOn: command.draft.occurredOn,
              note: command.draft.note,
              createdAt: timestamp,
              updatedAt: timestamp
            } as TransactionRecord;
          } else {
            record = {
              id: createIdentifier(),
              monthId: command.monthId,
              type: 'expense',
              category: command.draft.category,
              amountMinor: command.draft.amountMinor,
              currency: context.data.currency,
              occurredOn: command.draft.occurredOn,
              note: command.draft.note,
              createdAt: timestamp,
              updatedAt: timestamp
            } as TransactionRecord;
          }

          await kakeiboDatabase.transactions.add(record);

          return { success: true, data: record };
        }
      );
    } catch {
      return { success: false, reason: 'storage-failure' };
    }
  }

  public async update(command: UpdateTransactionCommand): Promise<TransactionOperationResult<TransactionRecord>> {
    try {
      return await kakeiboDatabase.transaction(
        'rw',
        kakeiboDatabase.budgetMonths,
        kakeiboDatabase.budgetPlans,
        kakeiboDatabase.transactions,
        async () => {
          const context = await this.getWritableMonthContext(command.monthId);

          if (!context.success) {
            return context;
          }

          const existing = await kakeiboDatabase.transactions.get(command.transactionId);

          if (existing === undefined || existing.monthId !== command.monthId) {
            return { success: false, reason: 'transaction-not-found' };
          }

          if (existing.updatedAt !== command.expectedUpdatedAt) {
            return { success: false, reason: 'stale-transaction' };
          }

          if (!belongsToBudgetPeriod(command.draft.occurredOn, context.data.month.periodKey as `${number}-${number}`)) {
            return { success: false, reason: 'invalid-transaction-date' };
          }

          const updatedAt = new Date().toISOString();
          let record: TransactionRecord;

          if (command.draft.type === 'income') {
            record = {
              ...existing,
              id: existing.id,
              monthId: existing.monthId,
              type: 'income',
              amountMinor: command.draft.amountMinor,
              currency: existing.currency,
              occurredOn: command.draft.occurredOn,
              note: command.draft.note,
              createdAt: existing.createdAt,
              updatedAt
            } as TransactionRecord;
          } else {
            record = {
              ...existing,
              id: existing.id,
              monthId: existing.monthId,
              type: 'expense',
              category: (command.draft as any).category ?? (existing as any).category,
              amountMinor: command.draft.amountMinor,
              currency: existing.currency,
              occurredOn: command.draft.occurredOn,
              note: command.draft.note,
              createdAt: existing.createdAt,
              updatedAt
            } as TransactionRecord;
          }

          await kakeiboDatabase.transactions.put(record);

          return { success: true, data: record };
        }
      );
    } catch {
      return { success: false, reason: 'storage-failure' };
    }
  }

  public async delete(command: DeleteTransactionCommand): Promise<TransactionOperationResult<string>> {
    try {
      return await kakeiboDatabase.transaction('rw', kakeiboDatabase.budgetMonths, kakeiboDatabase.transactions, async () => {
        const month = await kakeiboDatabase.budgetMonths.get(command.monthId);

        if (month === undefined) {
          return { success: false, reason: 'month-not-found' };
        }

        if (month.status === 'archived') {
          return { success: false, reason: 'month-archived' };
        }

        const existing = await kakeiboDatabase.transactions.get(command.transactionId);

        if (existing === undefined || existing.monthId !== command.monthId) {
          return { success: false, reason: 'transaction-not-found' };
        }

        if (existing.updatedAt !== command.expectedUpdatedAt) {
          return { success: false, reason: 'stale-transaction' };
        }

        await kakeiboDatabase.transactions.delete(command.transactionId);

        return { success: true, data: command.transactionId };
      });
    } catch {
      return { success: false, reason: 'storage-failure' };
    }
  }

  private async getWritableMonthContext(monthId: string): Promise<
    | { readonly success: true; readonly data: { readonly month: BudgetMonthRecord; readonly currency: string } }
    | { readonly success: false; readonly reason: 'month-not-found' | 'month-archived' }
  > {
    const month = await kakeiboDatabase.budgetMonths.get(monthId);

    if (month === undefined) {
      return { success: false, reason: 'month-not-found' };
    }

    if (month.status === 'archived') {
      return { success: false, reason: 'month-archived' };
    }

    const plan = await kakeiboDatabase.budgetPlans.where('monthId').equals(monthId).first();

    if (plan === undefined) {
      return { success: false, reason: 'month-not-found' };
    }

    return { success: true, data: { month, currency: plan.currency } };
  }
}
