import { useEffect } from 'react';
import { initializeDatabase } from '@/shared/infrastructure/database/initializeDatabase';
import { useAppStore } from '@/shared/state/useAppStore';

export function useAppInitialization(): void {
  const setStatus = useAppStore((state) => state.setStatus);

  useEffect(() => {
    let isCurrent = true;

    setStatus('hydrating');

    void initializeDatabase().then((result) => {
      if (!isCurrent) {
        return;
      }

      setStatus(result.status, result.message);
    });

    return () => {
      isCurrent = false;
    };
  }, [setStatus]);
}
