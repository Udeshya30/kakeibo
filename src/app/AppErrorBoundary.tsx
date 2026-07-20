import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@/shared/ui/feedback/ErrorState';

interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  readonly hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public override state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Unhandled application render error.', error, errorInfo);
    }
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="app-recovery" id="main-content">
          <ErrorState
            title="Kakeibo could not open this screen"
            description="Your local data has not been changed. You can try opening the app again."
            actionLabel="Reload app"
            onAction={() => window.location.reload()}
          />
        </main>
      );
    }

    return this.props.children;
  }
}
