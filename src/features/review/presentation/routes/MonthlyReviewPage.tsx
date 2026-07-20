import { useEffect, useState } from 'react';
import { getReviewByMonth, saveReview } from '@/features/review/application/reviewService';
import type { MonthlyReviewRecord } from '@/shared/domain/persistence';
import { Button } from '@/shared/ui/actions/Button';
import styles from '../MonthlyReview.module.scss';

export function MonthlyReviewPage({ monthId }: { monthId: string }) {
  const [, setReview] = useState<MonthlyReviewRecord | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const r = await getReviewByMonth(monthId);
      if (r) {
        setReview(r);
        setAnswers(r.answers || {});
      }
    })();
  }, [monthId]);

  async function handleSave() {
    setStatus('saving');
    const rec = await saveReview({ monthId, answers, nextMonthIntention: answers['intention'] ?? '' });
    setReview(rec);
    setStatus('saved');
  }

  return (
    <div className={styles.container}>
      <h2>Monthly review for {monthId}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
        className={styles.form}
      >
        <div className={styles.field}>
          <label htmlFor="well">What went well?</label>
          <textarea id="well" value={answers['well'] ?? ''} onChange={(e) => setAnswers({ ...answers, well: e.target.value })} />
        </div>

        <div className={styles.field}>
          <label htmlFor="improve">What to improve?</label>
          <textarea id="improve" value={answers['improve'] ?? ''} onChange={(e) => setAnswers({ ...answers, improve: e.target.value })} />
        </div>

        <div className={styles.field}>
          <label htmlFor="intention">Next month intention</label>
          <input id="intention" value={answers['intention'] ?? ''} onChange={(e) => setAnswers({ ...answers, intention: e.target.value })} />
        </div>

        <div className={styles.actions}>
          <Button type="submit">Save review</Button>
        </div>

        <div aria-live="polite" className={styles.status}>{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : null}</div>
      </form>
    </div>
  );
}

export default MonthlyReviewPage;
