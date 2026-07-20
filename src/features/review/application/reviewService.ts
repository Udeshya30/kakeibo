import { kakeiboDatabase } from '@/shared/infrastructure/database/KakeiboDatabase';
import type { MonthlyReviewRecord } from '@/shared/domain/persistence';

export async function getReviewByMonth(monthId: string): Promise<MonthlyReviewRecord | undefined> {
  return kakeiboDatabase.monthlyReviews.where('monthId').equals(monthId).first();
}

export async function saveReview(review: Omit<MonthlyReviewRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyReviewRecord> {
  const now = new Date().toISOString();
  const id = `rev-${review.monthId}`;

  const record: MonthlyReviewRecord = {
    id,
    ...review,
    createdAt: now,
    updatedAt: now
  } as MonthlyReviewRecord;

  await kakeiboDatabase.monthlyReviews.put(record);
  return record;
}
