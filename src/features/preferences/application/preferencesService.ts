import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import type { AppSettingsRecord } from '@/shared/domain/persistence';

export async function getAppSettings(): Promise<AppSettingsRecord | undefined> {
  return kakeiboDatabase.appSettings.get('app-settings');
}

export async function updateAppSettings(partial: Partial<AppSettingsRecord>): Promise<AppSettingsRecord> {
  const existing = await getAppSettings();
  const now = new Date().toISOString();

  if (!existing) {
    const base: AppSettingsRecord = {
      id: 'app-settings',
      baseCurrency: partial.baseCurrency ?? 'INR',
      locale: partial.locale ?? 'en-IN',
      weekStartsOn: partial.weekStartsOn ?? 1,
      createdAt: now,
      updatedAt: now
    };
    await kakeiboDatabase.appSettings.put(base);
    return base;
  }

  const updated: AppSettingsRecord = {
    ...existing,
    ...partial,
    updatedAt: now
  };

  await kakeiboDatabase.appSettings.put(updated);
  return updated;
}
