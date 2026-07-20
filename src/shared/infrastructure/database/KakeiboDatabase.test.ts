import { afterEach, describe, expect, it } from 'vitest';
import { KakeiboDatabase, kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';

afterEach(async () => {
  kakeiboDatabase.close();
  await kakeiboDatabase.delete();
});

describe('KakeiboDatabase', () => {
  it('creates the documented version one tables', async () => {
    const database = new KakeiboDatabase();

    await database.open();

    expect(database.tables.map((table) => table.name).sort()).toEqual([
      'appMetadata',
      'appSettings',
      'budgetMonths',
      'budgetPlans',
      'monthlyReviews',
      'transactions'
    ]);

    database.close();
    await database.delete();
  });

  it('defines the month-scoped transaction history index', () => {
    expect(kakeiboDatabase.transactions.schema.idxByName['[monthId+occurredOn+id]']).toBeDefined();
  });
});
