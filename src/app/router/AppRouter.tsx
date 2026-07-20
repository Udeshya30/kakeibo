import { lazy, Suspense } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/router/RootLayout';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { FoundationPage } from '@/app/router/FoundationPage';

const BudgetPlanPage = lazy(async () => {
  const module = await import('@/features/budgeting/presentation/routes');

  return { default: module.BudgetPlanPage };
});

const PreferencesPage = lazy(async () => {
  const module = await import('@/features/preferences/presentation');
  return { default: module.PreferencesPage };
});

const ReportingPage = lazy(async () => {
  const module = await import('@/features/reporting/presentation');
  return { default: module.ReportingPage };
});

const MonthlyReviewPage = lazy(async () => {
  const module = await import('@/features/review/presentation');
  return { default: module.MonthlyReviewPage };
});

const DataManagementPage = lazy(async () => {
  const module = await import('@/features/data-management/presentation');
  return { default: module.DataManagementPage };
});

function RouteLoadingState() {
  return <p role="status">Opening this screen…</p>;
}

// Detect a reasonable basename so the router works both locally and when
// deployed to a repository subpath (e.g. GitHub Pages at /owner/repo/).
const detectedBase = (() => {
  try {
    const parts = window.location.pathname.split('/');
    if (parts.length > 1 && parts[1]) return `/${parts[1]}/`;
  } catch (e) {
    // fallback to root
  }
  return '/';
})();

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: (
          <FoundationPage
            title="Your Kakeibo, ready when you are"
            description="Kakeibo is installed locally and ready for the first budgeting workflow. Planning a month is the next milestone."
          />
        )
      },
      {
        path: 'transactions',
        element: <FoundationPage title="Transactions" description="Transaction recording will be available in Milestone 3." />
      },
      {
        path: 'plan',
        element: (
          <Suspense fallback={<RouteLoadingState />}>
            <BudgetPlanPage />
          </Suspense>
        )
      },
      {
        path: 'insights',
        element: (
          <Suspense fallback={<RouteLoadingState />}>
            <ReportingPage monthId={'m1'} />
          </Suspense>
        )
      },
      {
        path: 'review',
        element: (
          <Suspense fallback={<RouteLoadingState />}>
            <MonthlyReviewPage monthId={'m1'} />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<RouteLoadingState />}>
            <PreferencesPage />
          </Suspense>
        )
      },
      {
        path: 'data',
        element: (
          <Suspense fallback={<RouteLoadingState />}>
            <DataManagementPage />
          </Suspense>
        )
      }
    ]
  }
], { basename: detectedBase });

export function AppRouter() {
  return <RouterProvider router={router} />;
}
