import { useAppStore } from '@/shared/state/useAppStore';
import { Button } from '@/shared/ui/actions/Button';
import styles from '@/app/router/GlobalStatusRegion.module.scss';

export function GlobalStatusRegion() {
  const status = useAppStore((state) => state.status);
  const message = useAppStore((state) => state.statusMessage);
  const isUpdateAvailable = useAppStore((state) => state.isUpdateAvailable);
  const requestUpdate = useAppStore((state) => state.requestUpdate);

  if (status !== 'storage-unavailable' && !isUpdateAvailable) {
    return null;
  }

  return (
    <div className={styles.region}>
      {status === 'storage-unavailable' ? (
        <section className={styles.banner} aria-live="assertive" role="alert">
          <strong>Local storage is unavailable.</strong>
          <span>{message ?? 'Kakeibo cannot safely save data in this browser right now.'}</span>
        </section>
      ) : null}
      {isUpdateAvailable ? (
        <section className={styles.updateBanner} aria-live="polite" role="status">
          <span>An application update is ready. Your local data stays on this device.</span>
          <Button onClick={requestUpdate} variant="secondary">
            Update now
          </Button>
        </section>
      ) : null}
    </div>
  );
}
