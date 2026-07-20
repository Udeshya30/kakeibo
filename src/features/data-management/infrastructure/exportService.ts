import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';

export interface ExportBundle {
  readonly version: number;
  readonly exportedAt: string;
  readonly records: {
    appSettings: readonly unknown[];
    budgetMonths: readonly unknown[];
    budgetPlans: readonly unknown[];
    transactions: readonly unknown[];
    monthlyReviews: readonly unknown[];
    appMetadata: readonly unknown[];
  };
}

export async function exportDatabase(): Promise<ExportBundle> {
  const [appSettings, budgetMonths, budgetPlans, transactions, monthlyReviews, appMetadata] =
    await Promise.all([
      kakeiboDatabase.appSettings.toArray(),
      kakeiboDatabase.budgetMonths.toArray(),
      kakeiboDatabase.budgetPlans.toArray(),
      kakeiboDatabase.transactions.toArray(),
      kakeiboDatabase.monthlyReviews.toArray(),
      kakeiboDatabase.appMetadata.toArray()
    ]);

  const exportedAt = new Date().toISOString();

  // record last successful backup time
  await kakeiboDatabase.appMetadata.put({ key: 'lastSuccessfulBackupAt', value: exportedAt, updatedAt: exportedAt });

  return {
    version: 1,
    exportedAt,
    records: {
      appSettings,
      budgetMonths,
      budgetPlans,
      transactions,
      monthlyReviews,
      appMetadata
    }
  };
}

export function bundleToJson(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}
