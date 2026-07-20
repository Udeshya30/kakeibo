import { ensureInitialSettings } from '@/shared/infrastructure/database/ensureInitialSettings';
import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';

export interface DatabaseInitializationResult {
  readonly status: 'ready' | 'storage-unavailable';
  readonly message?: string;
}

export async function initializeDatabase(): Promise<DatabaseInitializationResult> {
  try {
    await kakeiboDatabase.open();
    await ensureInitialSettings();

    return { status: 'ready' };
  } catch {
    return {
      status: 'storage-unavailable',
      message: 'Kakeibo could not open its local database. Your existing data has not been changed.'
    };
  }
}
