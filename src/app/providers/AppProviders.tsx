import { type ReactNode, useEffect } from 'react';
import { PwaUpdateManager } from '@/app/providers/PwaUpdateManager';
import { useAppInitialization } from '@/app/providers/useAppInitialization';

interface AppProvidersProps {
  readonly children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useAppInitialization();

  useEffect(() => {
    document.documentElement.dataset.theme = 'light';
  }, []);

  return (
    <>
      {children}
      <PwaUpdateManager />
    </>
  );
}
