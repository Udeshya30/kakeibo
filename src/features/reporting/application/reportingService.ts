import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import type { KakeiboCategory } from '@/shared/domain/persistence';

export interface CategoryTotal {
  readonly category: KakeiboCategory;
  readonly totalMinor: number;
}

export async function getCategoryTotalsForMonth(monthId: string): Promise<CategoryTotal[]> {
  const tx = await kakeiboDatabase.transactions.where('monthId').equals(monthId).toArray();

  const totals: Record<string, number> = { needs: 0, wants: 0, culture: 0, unexpected: 0 } as any;

  for (const t of tx) {
    if (t.type === 'expense' && t.category) {
      totals[t.category] = (totals[t.category] ?? 0) + t.amountMinor;
    }
  }

  return (Object.keys(totals) as KakeiboCategory[]).map((c) => ({ category: c, totalMinor: totals[c] }));
}
