import { afterEach, describe, expect, it } from 'vitest';
import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import { getCategoryTotalsForMonth } from './reportingService';

afterEach(async () => {
  kakeiboDatabase.close();
  await kakeiboDatabase.delete();
});

describe('reporting service', () => {
  it('aggregates expenses by category', async () => {
    await kakeiboDatabase.open();

    await kakeiboDatabase.transactions.bulkAdd([
      { id: 't1', monthId: 'm1', type: 'expense', category: 'needs', amountMinor: 500, currency: 'JPY', occurredOn: '2026-07-01', note: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 't2', monthId: 'm1', type: 'expense', category: 'wants', amountMinor: 300, currency: 'JPY', occurredOn: '2026-07-02', note: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 't3', monthId: 'm1', type: 'expense', category: 'needs', amountMinor: 200, currency: 'JPY', occurredOn: '2026-07-03', note: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ] as any);

    const totals = await getCategoryTotalsForMonth('m1');
    const needs = totals.find((t) => t.category === 'needs');
    const wants = totals.find((t) => t.category === 'wants');

    expect(needs).toBeDefined();
    expect(needs!.totalMinor).toBe(700);
    expect(wants!.totalMinor).toBe(300);
  });
});
