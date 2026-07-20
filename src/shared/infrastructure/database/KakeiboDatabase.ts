import Dexie, { type EntityTable } from 'dexie';
import type {
  AppMetadataRecord,
  AppSettingsRecord,
  BudgetMonthRecord,
  BudgetPlanRecord,
  MonthlyReviewRecord,
  TransactionRecord
} from '@/shared/domain/persistence';

export class KakeiboDatabase extends Dexie {
  public readonly appSettings!: EntityTable<AppSettingsRecord, 'id'>;
  public readonly budgetMonths!: EntityTable<BudgetMonthRecord, 'id'>;
  public readonly budgetPlans!: EntityTable<BudgetPlanRecord, 'id'>;
  public readonly transactions!: EntityTable<TransactionRecord, 'id'>;
  public readonly monthlyReviews!: EntityTable<MonthlyReviewRecord, 'id'>;
  public readonly appMetadata!: EntityTable<AppMetadataRecord, 'key'>;

  public constructor() {
    super('kakeibo');

    this.version(1).stores({
      appSettings: '&id',
      budgetMonths: '&id, &periodKey, status, updatedAt',
      budgetPlans: '&id, &monthId, updatedAt',
      transactions:
        '&id, monthId, [monthId+occurredOn+id], [monthId+category+occurredOn+id], [monthId+type+occurredOn+id], updatedAt',
      monthlyReviews: '&id, &monthId, completedAt, updatedAt',
      appMetadata: '&key'
    });
  }
}

export const kakeiboDatabase = new KakeiboDatabase();
