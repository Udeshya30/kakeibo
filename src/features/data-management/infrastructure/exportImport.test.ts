import { afterEach, describe, expect, it } from 'vitest';
import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import { exportDatabase } from './exportService';
import { importDatabase } from './importService';

afterEach(async () => {
  kakeiboDatabase.close();
  await kakeiboDatabase.delete();
});

describe('data-management export/import', () => {
  it('exports and imports a bundle preserving records', async () => {
    await kakeiboDatabase.open();

    // seed some records
    await kakeiboDatabase.appSettings.put({
      id: 'app-settings',
      baseCurrency: 'JPY',
      locale: 'ja-JP',
      weekStartsOn: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await kakeiboDatabase.budgetMonths.add({
      id: 'm1',
      periodKey: '2026-07',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const bundle = await exportDatabase();

    // clear DB
    await Promise.all([
      kakeiboDatabase.appSettings.clear(),
      kakeiboDatabase.budgetMonths.clear(),
      kakeiboDatabase.budgetPlans.clear(),
      kakeiboDatabase.transactions.clear(),
      kakeiboDatabase.monthlyReviews.clear(),
      kakeiboDatabase.appMetadata.clear()
    ]);

    // import
    const result = await importDatabase(bundle as any);
    expect(result.success).toBe(true);

    const settings = await kakeiboDatabase.appSettings.toArray();
    const months = await kakeiboDatabase.budgetMonths.toArray();

    expect(settings.length).toBeGreaterThanOrEqual(1);
    expect(months.length).toBeGreaterThanOrEqual(1);
  });
});
