import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useAppStore } from '@/shared/state/useAppStore';

export function PwaUpdateManager() {
  const setUpdateAvailable = useAppStore((state) => state.setUpdateAvailable);
  const isUpdateRequested = useAppStore((state) => state.isUpdateRequested);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW();

  useEffect(() => {
    setUpdateAvailable(needRefresh);
  }, [needRefresh, setUpdateAvailable]);

  useEffect(() => {
    if (!isUpdateRequested || !needRefresh) {
      return;
    }

    void updateServiceWorker(true);
  }, [isUpdateRequested, needRefresh, updateServiceWorker]);

  return null;
}
