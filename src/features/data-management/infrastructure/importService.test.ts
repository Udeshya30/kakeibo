import { afterEach, describe, expect, it } from 'vitest';
import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import { importDatabase } from './importService';

afterEach(async () => {
  kakeiboDatabase.close();
  await kakeiboDatabase.delete();
});

describe('import service validation', () => {
  it('rejects invalid bundles', async () => {
    await kakeiboDatabase.open();

    const bad = { foo: 'bar' } as any;
    const r = await importDatabase(bad);
    expect(r.success).toBe(false);
    expect((r as any).reason).toBe('invalid-bundle');
  });
});
