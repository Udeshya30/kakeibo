import { useRouteError } from 'react-router-dom';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';

export function RouteErrorPage() {
  useRouteError();

  return (
    <main className="app-recovery" id="main-content">
      <ErrorState
        title="This page is unavailable"
        description="Your local data has not been changed. Return to the dashboard and try again."
        actionLabel="Go to dashboard"
        onAction={() => window.location.assign('/')}
      />
    </main>
  );
}
