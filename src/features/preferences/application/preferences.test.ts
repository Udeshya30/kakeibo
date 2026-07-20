import { afterEach, describe, expect, it } from 'vitest';
import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import { getAppSettings, updateAppSettings } from './preferencesService';

afterEach(async () => {
  kakeiboDatabase.close();
  await kakeiboDatabase.delete();
});

describe('preferences service', () => {
  it('creates and updates settings', async () => {
    await kakeiboDatabase.open();

    const initial = await getAppSettings();
    expect(initial).toBeUndefined();

    const created = await updateAppSettings({ baseCurrency: 'USD', locale: 'en-US', weekStartsOn: 0 } as any);
    expect(created.baseCurrency).toBe('USD');

    const fetched = await getAppSettings();
    expect(fetched).toBeDefined();
    expect(fetched!.locale).toBe('en-US');

    const updated = await updateAppSettings({ baseCurrency: 'EUR' } as any);
    expect(updated.baseCurrency).toBe('EUR');
  });
});
