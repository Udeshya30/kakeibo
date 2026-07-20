import { afterEach, describe, expect, it } from 'vitest';
import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import { getReviewByMonth, saveReview } from './reviewService';

afterEach(async () => {
  kakeiboDatabase.close();
  await kakeiboDatabase.delete();
});

describe('review service', () => {
  it('saves and retrieves a review', async () => {
    await kakeiboDatabase.open();

    const rec = await saveReview({ monthId: 'm1', answers: { well: 'Good' }, nextMonthIntention: 'Save more' });
    expect(rec).toBeDefined();

    const fetched = await getReviewByMonth('m1');
    expect(fetched).toBeDefined();
    expect(fetched!.answers.well).toBe('Good');
  });
});
