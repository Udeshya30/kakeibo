import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';

export interface ImportBundle {
  readonly version: number;
  readonly exportedAt: string;
  readonly records: Record<string, readonly unknown[]>;
}

export async function importDatabase(bundle: ImportBundle): Promise<{ success: true } | { success: false; reason: string }> {
  if (!bundle || bundle.version !== 1 || !bundle.records) {
    return { success: false, reason: 'invalid-bundle' };
  }

  try {
    await kakeiboDatabase.transaction('rw',
      kakeiboDatabase.appSettings,
      kakeiboDatabase.budgetMonths,
      kakeiboDatabase.budgetPlans,
      kakeiboDatabase.transactions,
      kakeiboDatabase.monthlyReviews,
      kakeiboDatabase.appMetadata,
      async () => {
        // clear existing
        await Promise.all([
          kakeiboDatabase.appSettings.clear(),
          kakeiboDatabase.budgetMonths.clear(),
          kakeiboDatabase.budgetPlans.clear(),
          kakeiboDatabase.transactions.clear(),
          kakeiboDatabase.monthlyReviews.clear(),
          kakeiboDatabase.appMetadata.clear()
        ]);

        const r = bundle.records as any;

        if (r.appSettings) await kakeiboDatabase.appSettings.bulkAdd(r.appSettings);
        if (r.budgetMonths) await kakeiboDatabase.budgetMonths.bulkAdd(r.budgetMonths);
        if (r.budgetPlans) await kakeiboDatabase.budgetPlans.bulkAdd(r.budgetPlans);
        if (r.transactions) await kakeiboDatabase.transactions.bulkAdd(r.transactions);
        if (r.monthlyReviews) await kakeiboDatabase.monthlyReviews.bulkAdd(r.monthlyReviews);
        if (r.appMetadata) await kakeiboDatabase.appMetadata.bulkAdd(r.appMetadata);
      }
    );

    const restoredAt = new Date().toISOString();
    await kakeiboDatabase.appMetadata.put({ key: 'lastSuccessfulRestoreAt', value: restoredAt, updatedAt: restoredAt });

    return { success: true };
  } catch (err) {
    return { success: false, reason: 'import-failed' };
  }
}
