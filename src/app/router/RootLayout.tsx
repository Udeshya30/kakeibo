import { NavLink, Outlet } from 'react-router-dom';
import { BookOpenText, ChartNoAxesCombined, ClipboardCheck, LayoutDashboard, ReceiptText, Settings } from 'lucide-react';
import { GlobalStatusRegion } from '@/app/router/GlobalStatusRegion';
import { useBudgetStore } from '@/features/budgeting/presentation/hooks';
import styles from '@/app/router/RootLayout.module.scss';

interface NavigationItem {
  readonly to: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
  readonly end?: boolean;
}

const navigationItems: readonly NavigationItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/plan', label: 'Plan', icon: BookOpenText },
  { to: '/insights', label: 'Insights', icon: ChartNoAxesCombined },
  { to: '/review', label: 'Review', icon: ClipboardCheck },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function RootLayout() {
  const selectedPeriodKey = useBudgetStore((state) => state.selectedPeriodKey);

  return (
    <div className={styles.appShell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <header className={styles.header}>
        <NavLink className={styles.brand} to="/">
          Kakeibo
        </NavLink>
        <p className={styles.monthContext}>{selectedPeriodKey ?? 'No budget month selected'}</p>
      </header>
      <nav className={styles.navigation} aria-label="Primary navigation">
        {navigationItems.map(({ icon: Icon, label, to, end }) => (
          <NavLink
            key={to}
            className={({ isActive }) => (isActive ? styles.navigationLinkActive : styles.navigationLink)}
            end={end}
            to={to}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <GlobalStatusRegion />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
