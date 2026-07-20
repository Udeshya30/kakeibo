import { Button } from '@/shared/ui/actions/Button';
import styles from '@/shared/ui/feedback/Feedback.module.scss';

interface ErrorStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export function ErrorState({ title, description, actionLabel, onAction }: ErrorStateProps) {
  return (
    <section className={styles.state} aria-labelledby="error-state-title">
      <h1 id="error-state-title">{title}</h1>
      <p>{description}</p>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </section>
  );
}
