import {
  INITIAL_BASE_CURRENCY,
  INITIAL_LOCALE,
  INITIAL_WEEK_STARTS_ON,
  type AppSettingsRecord
} from '@/shared/domain/persistence';
import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';

const INITIAL_SETTINGS_ID = 'app-settings' as const;

export async function ensureInitialSettings(): Promise<void> {
  await kakeiboDatabase.transaction('rw', kakeiboDatabase.appSettings, async () => {
    const existingSettings = await kakeiboDatabase.appSettings.get(INITIAL_SETTINGS_ID);

    if (existingSettings !== undefined) {
      return;
    }

    const timestamp = new Date().toISOString();
    const initialSettings: AppSettingsRecord = {
      id: INITIAL_SETTINGS_ID,
      baseCurrency: INITIAL_BASE_CURRENCY,
      locale: INITIAL_LOCALE,
      weekStartsOn: INITIAL_WEEK_STARTS_ON,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await kakeiboDatabase.appSettings.add(initialSettings);
  });
}
