# React Component Hierarchy

## Purpose

Define Kakeibo’s complete React composition map before components are implemented. The hierarchy establishes ownership, route boundaries, reusable UI boundaries, and the hook/context/utilities each layer may use.

## Principles

- Pages compose feature widgets; pages do not contain domain calculations or raw Dexie access.
- Widgets compose feature-local cards, forms, tables, and charts.
- Shared components are domain-neutral and reusable in more than one feature.
- Hooks connect presentation to application services, query read models, Zustand UI state, and route state.
- Components receive typed view models and callbacks; they do not receive Dexie tables or repositories.
- Charts always have an equivalent textual summary or data table in the same widget.
- A component remains feature-local unless two independently evolving features need the same stable behavior.

## Top-Level Hierarchy

```text
App
├── AppErrorBoundary
│   └── AppProviders
│       ├── ServiceProvider
│       ├── ThemeController
│       ├── AccessibilityAnnouncer
│       ├── Router
│       │   ├── RootLayout
│       │   │   ├── SkipLink
│       │   │   ├── AppHeader
│       │   │   │   ├── BrandLink
│       │   │   │   ├── MonthContextControl
│       │   │   │   └── HeaderActions
│       │   │   │       ├── QuickAddButton
│       │   │   │       └── MobileNavigationButton
│       │   │   ├── PrimaryNavigation
│       │   │   │   ├── DesktopNavigation
│       │   │   │   └── MobileNavigation
│       │   │   ├── MainContent
│       │   │   │   └── RouteOutlet
│       │   │   ├── GlobalStatusRegion
│       │   │   │   ├── StorageStatusBanner
│       │   │   │   └── UpdateAvailableBanner
│       │   │   ├── ToastRegion
│       │   │   └── DialogHost
│       │   │       ├── QuickAddTransactionDialog
│       │   │       ├── EditTransactionDialog
│       │   │       ├── ConfirmDeleteDialog
│       │   │       ├── ArchiveMonthDialog
│       │   │       ├── RestoreBackupDialog
│       │   │       ├── ResetLocalDataDialog
│       │   │       └── UpdateApplicationDialog
│       │   ├── DashboardPage
│       │   ├── TransactionsPage
│       │   ├── BudgetPlanPage
│       │   ├── InsightsPage
│       │   ├── MonthlyReviewPage
│       │   ├── SettingsPage
│       │   ├── DataManagementPage
│       │   ├── MonthNotFoundPage
│       │   ├── UnsupportedStoragePage
│       │   └── RouteErrorPage
│       └── RouteAnnouncer
└── Development-only diagnostic boundary (not included in production UI)
```

`App` owns bootstrap only. It does not render feature data, make financial decisions, or directly initialize a feature repository. `AppErrorBoundary` catches unexpected render failures and renders a safe recovery screen. `AppProviders` establishes the few cross-cutting providers required by the application.

## Contexts and Providers

React Context is intentionally limited because Zustand already provides focused UI state and Dexie remains authoritative persistence.

| Provider/context | Responsibility | Must not contain |
| --- | --- | --- |
| `ServiceProvider` / service context | Supplies application-service interfaces and repository implementations assembled at the composition root. | Mutable financial records, feature UI state, or business calculations. |
| `ThemeController` | Applies the resolved theme from Theme Store to the document/app shell and observes system preference when needed. | A second durable theme preference. |
| `AccessibilityAnnouncer` | Provides a polite and assertive live-region outlet for route, save, and recoverable error announcements. | Toast queue ownership or arbitrary application state. |
| Router provider | Resolves routes, parameters, route errors, and navigation. | Selected data collections or form drafts. |

`RouteAnnouncer` reads resolved route metadata and announces meaningful route changes. It does not announce every render, filter keystroke, or decorative chart update.

## Root Layout and Navigation

### `RootLayout`

Owns the persistent application chrome: landmarks, responsive navigation placement, global status areas, the route outlet, dialog host, and toast region. It does not know route-specific financial totals.

### Header Components

| Component | Responsibility |
| --- | --- |
| `SkipLink` | Moves keyboard focus directly to the main landmark. |
| `AppHeader` | Groups brand, global month context, and header actions in a semantic header landmark. |
| `BrandLink` | Navigates to Dashboard with an accessible application name. |
| `MonthContextControl` | Displays and changes the active budget period through route/application coordination; it never calculates month status. |
| `HeaderActions` | Lays out global quick-add and compact-navigation controls. |
| `QuickAddButton` | Opens the typed quick-add dialog descriptor through UI Store. |
| `MobileNavigationButton` | Opens/closes mobile navigation and exposes its expanded state. |

### Navigation Components

| Component | Responsibility |
| --- | --- |
| `PrimaryNavigation` | Selects desktop/sidebar or compact/mobile arrangement without changing destinations. |
| `DesktopNavigation` | Renders persistent wide-screen navigation links. |
| `MobileNavigation` | Renders compact bottom navigation and the accessible path to lower-frequency destinations. |
| `NavigationLink` | Shared link pattern that exposes current-page state and icon/text label. |
| `MoreNavigationMenu` | Contains lower-frequency Settings and Data Management navigation in compact layouts. |

Destinations are Dashboard, Transactions, Plan, Insights, Review, and Settings. Data Management is reachable from Settings and compact “More” navigation. Navigation reads route state; it does not write budgets or filters.

### Global Feedback Components

| Component | Responsibility |
| --- | --- |
| `GlobalStatusRegion` | Reserved live/visual region for application-wide conditions. |
| `StorageStatusBanner` | Explains unavailable or quota-limited local storage and provides recovery path. |
| `UpdateAvailableBanner` | Offers a safe application update after checking for unsaved work. |
| `ToastRegion` | Renders bounded non-modal success, information, warning, and error messages from UI Store. |
| `DialogHost` | Maps typed UI Store dialog descriptors to feature-owned dialog components; it holds no business callback closures. |

## Page Hierarchy

Every page renders a route-level `PageHeader` with title, optional description, and page actions, then composes only its feature widgets. Each page has a route-specific loading, empty, not-found, and recoverable error presentation.

### `DashboardPage`

```text
DashboardPage
├── PageHeader
│   ├── PageTitle
│   ├── MonthContextSummary
│   └── AddTransactionAction
├── DashboardLoadingState
├── DashboardErrorState
├── DashboardEmptyState
└── DashboardContent
    ├── MonthlySummaryGrid
    │   ├── FinancialMetricCard: PlannedAvailable
    │   ├── FinancialMetricCard: ActualIncome
    │   ├── FinancialMetricCard: ActualExpenses
    │   └── FinancialMetricCard: Remaining
    ├── BudgetProgressCard
    │   ├── ProgressSummary
    │   └── CategoryLimitList
    │       └── CategoryLimitRow
    ├── CategorySpendingCard
    │   ├── CategoryDistributionChart
    │   └── CategoryDistributionTable
    ├── RecentTransactionsCard
    │   ├── TransactionCompactList
    │   │   └── TransactionListItem
    │   └── ViewAllTransactionsLink
    └── MonthlyReflectionPromptCard
        └── StartOrContinueReviewAction
```

`DashboardPage` obtains one month-scoped reporting view model through `useDashboardReport`. `MonthlySummaryGrid` only lays out supplied metrics. `FinancialMetricCard` labels a value, period, and status; it never computes money. `BudgetProgressCard` shows plan progress and category limit status without implying a bank balance. `CategorySpendingCard` always renders both chart and accessible table/summary. `RecentTransactionsCard` receives a bounded recent-activity view model, not a live transaction table. `MonthlyReflectionPromptCard` guides the user to a review based on supplied review status.

### `TransactionsPage`

```text
TransactionsPage
├── PageHeader
│   ├── PageTitle
│   └── AddTransactionAction
├── TransactionFilterBar
│   ├── TransactionSearchField
│   ├── TransactionTypeFilter
│   ├── CategoryFilter
│   ├── DateOrderControl
│   └── ClearFiltersAction
├── TransactionLoadingState
├── TransactionErrorState
├── NoTransactionsEmptyState
├── NoTransactionResultsEmptyState
└── TransactionHistory
    ├── TransactionTable (medium and wide layouts)
    │   ├── TransactionTableCaption
    │   ├── TransactionTableHeader
    │   └── TransactionTableRow
    │       ├── TransactionCategoryTag
    │       └── TransactionRowActions
    ├── TransactionMobileList (compact layouts)
    │   └── TransactionMobileListItem
    │       ├── TransactionCategoryTag
    │       └── TransactionItemActions
    └── TransactionPagination
        ├── LoadMoreButton
        └── TransactionCountSummary
```

`TransactionsPage` coordinates route month, Transaction Store filter state, and a single `useTransactionHistory` query. `TransactionFilterBar` controls only filter UI. `TransactionTable` is semantic tabular history; `TransactionMobileList` is its content-equivalent compact presentation, not a second query. Row/item actions open typed edit/delete dialog descriptors with a transaction ID. `TransactionPagination` receives cursor availability from the query hook and never slices a global transaction collection.

### `BudgetPlanPage`

```text
BudgetPlanPage
├── PageHeader
│   ├── PageTitle
│   └── BudgetMonthStatusBadge
├── BudgetPlanLoadingState
├── BudgetPlanErrorState
├── BudgetMonthMissingState
└── BudgetPlanContent
    ├── PlanOverviewCard
    │   ├── PlannedIncomeMetric
    │   ├── FixedCommitmentsMetric
    │   ├── SavingsTargetMetric
    │   └── PlannedAvailableMetric
    ├── BudgetPlanForm
    │   ├── MoneyField: PlannedIncome
    │   ├── MoneyField: FixedCommitments
    │   ├── MoneyField: SavingsTarget
    │   ├── CategoryLimitFieldset
    │   │   └── CategoryLimitField × 4
    │   ├── FormErrorSummary
    │   └── FormActions
    │       ├── SavePlanButton
    │       └── CancelPlanChangesButton
    └── BudgetLifecycleActions
        ├── ArchiveMonthAction
        ├── ReopenMonthAction
        └── DeleteMonthAction
```

`BudgetPlanPage` gets a budget/plan view model through `useBudgetPlan`. `PlanOverviewCard` displays supplied values only. `BudgetPlanForm` owns draft/validation through React Hook Form and delegates save to `useSaveBudgetPlan`; it does not write Dexie directly. `BudgetLifecycleActions` exposes actions allowed by current lifecycle policy and opens confirmation dialogs for consequential changes.

### `InsightsPage`

```text
InsightsPage
├── PageHeader
│   ├── PageTitle
│   └── ReportDisplayModeControl
├── InsightsLoadingState
├── InsightsErrorState
├── InsightsEmptyState
└── InsightsContent
    ├── SpendingByCategoryCard
    │   ├── CategoryDistributionChart
    │   └── CategoryDistributionTable
    ├── PlanVsActualCard
    │   ├── PlanVsActualChart
    │   └── PlanVsActualTable
    ├── SpendingTimelineCard
    │   ├── SpendingTimelineChart
    │   └── SpendingTimelineTable
    ├── CategoryLimitInsightList
    │   └── CategoryLimitInsightRow
    └── InsightExplanationCard
```

`InsightsPage` consumes a single `useInsightsReport` view model for the selected month. `ReportDisplayModeControl` selects a visual or tabular emphasis, but both representations remain available. The three chart/table pairs use the same supplied data; chart transforms happen in reporting presentation helpers, not in the page. `InsightExplanationCard` provides calm explanatory copy and never offers prescriptive financial advice.

### `MonthlyReviewPage`

```text
MonthlyReviewPage
├── PageHeader
│   ├── PageTitle
│   └── ReviewStatusBadge
├── ReviewLoadingState
├── ReviewErrorState
├── ReviewUnavailableState
└── ReviewContent
    ├── ReviewMonthSummaryCard
    │   ├── ReviewSummaryMetricList
    │   └── CategoryReflectionSummary
    ├── MonthlyReviewForm
    │   ├── ReflectionQuestionSection × defined prompt count
    │   │   ├── ReflectionQuestion
    │   │   └── ReflectionAnswerField
    │   ├── NextMonthIntentionField
    │   ├── FormErrorSummary
    │   └── ReviewFormActions
    │       ├── SaveReviewButton
    │       └── CompleteReviewButton
    └── ReviewCompletionCard
```

`MonthlyReviewPage` combines a review record query with a read-only monthly reporting summary through `useMonthlyReview`. `ReviewMonthSummaryCard` is not a dashboard duplicate; it gives only the reflective context needed to answer review questions. `MonthlyReviewForm` retains answers locally in React Hook Form and uses the Reflection Store only for route section and operation feedback. `ReviewCompletionCard` appears after completion and offers next-month navigation without auto-creating a plan.

### `SettingsPage`

```text
SettingsPage
├── PageHeader
│   └── PageTitle
├── SettingsLoadingState
├── SettingsErrorState
└── SettingsContent
    ├── DisplayPreferencesCard
    │   └── DisplayPreferencesForm
    │       ├── LocaleSelectField
    │       ├── WeekStartSelectField
    │       ├── ThemePreferenceControl
    │       └── SaveSettingsButton
    ├── CurrencySettingsCard
    │   ├── BaseCurrencyDisplay
    │   └── CurrencyChangeGuidance
    ├── InstallationCard
    │   └── InstallApplicationAction
    └── DataManagementLinkCard
```

`SettingsPage` reads the singleton settings view model through `useSettings`. `DisplayPreferencesForm` is the only editor for supported preferences and saves through Settings application services. `CurrencySettingsCard` states the currency policy; it does not provide an unsafe selector when financial records exist. `InstallationCard` is capability-aware and does not render a broken install action on unsupported browsers.

### `DataManagementPage`

```text
DataManagementPage
├── PageHeader
│   └── PageTitle
├── DataManagementStatusBanner
├── BackupCard
│   ├── BackupSummary
│   └── ExportBackupButton
├── RestoreCard
│   ├── RestoreGuidance
│   └── SelectBackupFileAction
├── StorageHealthCard
│   └── StorageStatusSummary
└── DangerZoneCard
    ├── ResetLocalDataAction
    └── BrowserDataWarning
```

`DataManagementPage` displays data-operation readiness and known local-storage capability through `useDataManagementStatus`. `ExportBackupButton`, `SelectBackupFileAction`, and `ResetLocalDataAction` request flows through data-management services and dialogs; they never parse files or clear tables in a component. `StorageHealthCard` reports only supported browser signals and never promises protection from browser-data eviction.

### Recovery Pages

| Page | Responsibility |
| --- | --- |
| `MonthNotFoundPage` | Explains that a requested month is unavailable and provides navigation to a valid month list/dashboard. |
| `RouteErrorPage` | Provides safe recovery for unexpected route-load/render failure without exposing a stack trace. |
| `UnsupportedStoragePage` | Shown only when storage cannot be initialized; explains limitations and recovery, without claiming normal offline operation. |

## Dialog Hierarchy

```text
DialogHost
├── QuickAddTransactionDialog
│   └── TransactionForm
├── EditTransactionDialog
│   └── TransactionForm
├── ConfirmDeleteDialog
│   └── DestructiveActionSummary
├── ArchiveMonthDialog
│   └── ArchiveImpactSummary
├── RestoreBackupDialog
│   └── RestoreImpactSummary
├── ResetLocalDataDialog
│   └── ResetImpactSummary
└── UpdateApplicationDialog
    └── UpdateSafetySummary
```

All dialogs are feature-owned compositions rendered by `DialogHost`. `TransactionForm` is shared only within the Budgeting feature between quick-add and edit flows. Confirmation dialogs receive concise impact view models and invoke application-service callbacks supplied through a dialog orchestration hook; no dialog performs raw persistence. The host never stores callbacks or full records in Zustand.

## Shared Component Hierarchy

```text
shared/ui
├── Action
│   ├── Button
│   ├── IconButton
│   └── LinkButton
├── Form
│   ├── FormField
│   ├── FieldLabel
│   ├── FieldHelpText
│   ├── FieldErrorText
│   ├── TextInput
│   ├── MoneyInput
│   ├── DateInput
│   ├── SearchInput
│   ├── TextArea
│   ├── Select
│   ├── Checkbox
│   ├── RadioGroup
│   └── Switch
├── Feedback
│   ├── Alert
│   ├── StatusMessage
│   ├── EmptyState
│   ├── LoadingState
│   ├── Skeleton
│   └── ErrorState
├── Surface
│   ├── Card
│   ├── Section
│   ├── PageHeader
│   └── Divider
├── DataDisplay
│   ├── Badge
│   ├── Chip
│   ├── Tag
│   ├── Metric
│   ├── KeyValueList
│   └── ProgressIndicator
├── Overlay
│   ├── Dialog
│   ├── DialogHeader
│   ├── DialogBody
│   ├── DialogFooter
│   ├── Popover
│   └── Tooltip
└── Navigation
    ├── NavigationLink
    ├── Tabs
    └── PaginationControl
```

| Shared component | Responsibility |
| --- | --- |
| `Button`, `IconButton`, `LinkButton` | Accessible action/navigation primitives with consistent focus, disabled, and loading behavior. |
| `FormField` family | Associates labels, help text, errors, required state, and controls; it does not own feature validation policy. |
| `MoneyInput` | Presents/edits money with locale/currency context while passing parsed field values to the owning form adapter. |
| `Alert` and `StatusMessage` | Accessible contextual feedback with appropriate live-region behavior. |
| `EmptyState`, `LoadingState`, `Skeleton`, `ErrorState` | Consistent non-data and recoverable-failure patterns; content remains feature supplied. |
| `Card`, `Section`, `PageHeader`, `Divider` | Semantic visual grouping without domain behavior. |
| `Badge`, `Chip`, `Tag`, `Metric`, `KeyValueList`, `ProgressIndicator` | Small presentational data patterns with no calculation logic. |
| `Dialog` family | Focus-managed overlay primitive; feature dialogs supply title, content, and actions. |
| `Popover`, `Tooltip` | Supplemental contextual information; never the sole way to access required content. |
| `NavigationLink`, `Tabs`, `PaginationControl` | Keyboard-accessible navigation controls; feature/route code owns destination and data queries. |

Shared components may use only shared utilities, static design-system tokens, and platform-neutral hooks. They may not import any feature, repository, reporting calculation, or Zustand feature store.

## Feature Widgets, Tables, and Charts

| Feature-local component | Responsibility |
| --- | --- |
| `FinancialMetricCard` | Renders one supplied financial metric with label, period, status text, and optional supporting comparison. |
| `CategoryLimitRow` | Renders one category’s plan limit, actual amount, and textually described state. |
| `TransactionCompactList` | Displays a bounded recent-activity list for Dashboard. |
| `TransactionTable` | Presents sortable, accessible desktop transaction records. |
| `TransactionMobileList` | Presents the same query result in a narrow-screen record layout. |
| `CategoryDistributionChart` | Visualizes supplied category totals; never computes them. |
| `CategoryDistributionTable` | Supplies the chart’s accessible precise alternative. |
| `PlanVsActualChart` / `PlanVsActualTable` | Present supplied plan/actual comparisons in paired visual and tabular form. |
| `SpendingTimelineChart` / `SpendingTimelineTable` | Present supplied day/period spending sequence and precise values. |
| `MonthlyReviewForm` | Collects structured reflection drafts and delegates validation/save to form/application hooks. |
| `StorageHealthCard` | Explains supported local storage state and recovery guidance. |

Chart components must honor reduced-motion preference and provide a static rendering option. Chart tooltips supplement, never replace, the table and text summary. Table and list components own no filtering policy; they render a supplied query result and callbacks.

## Hooks

### App and Shared Hooks

| Hook | Responsibility |
| --- | --- |
| `useAppInitialization` | Coordinates database readiness, settings hydration, PWA status setup, and safe startup transitions. |
| `useActiveBudgetMonth` | Resolves route/global selected month context into a validated month identifier or recovery state. |
| `useRouteAnnouncement` | Announces meaningful navigation changes through AccessibilityAnnouncer. |
| `useMediaQuery` | Reads a browser media query safely for responsive/theme behavior. |
| `useReducedMotion` | Exposes user motion preference to feature/shared presentation. |
| `useFocusReturn` | Restores focus after a controlled overlay closes. |
| `useDialog` | Opens/closes typed UI Store dialog descriptors without embedding callbacks. |
| `useToast` | Publishes bounded status messages to UI Store. |
| `useUnsavedChangesRegistration` | Registers a route’s dirty state for safe navigation/update warnings. |

### Budgeting Hooks

| Hook | Responsibility |
| --- | --- |
| `useBudgetPlan` | Retrieves month and plan view model through Budgeting application/query contracts. |
| `useSaveBudgetPlan` | Submits a validated plan command and exposes typed operation state. |
| `useBudgetLifecycle` | Coordinates archive, reopen, and delete confirmation/use-case flows. |
| `useTransactionHistory` | Converts route/filter state into a paged, month-scoped transaction query. |
| `useTransactionMutation` | Performs create/edit/delete use cases and invalidates relevant query source. |
| `useTransactionForm` | Adapts React Hook Form and schema validation for the transaction form; no persistence logic. |

### Reporting and Review Hooks

| Hook | Responsibility |
| --- | --- |
| `useDashboardReport` | Retrieves one month-scoped dashboard read model. |
| `useInsightsReport` | Retrieves one month-scoped insights read model and chart/table view preferences. |
| `useMonthlyReview` | Retrieves review record plus minimal reflective reporting context. |
| `useMonthlyReviewForm` | Adapts React Hook Form/schema validation for reflection answers. |
| `useSaveMonthlyReview` | Saves/completes review commands and returns typed status. |

### Settings, Data Management, and PWA Hooks

| Hook | Responsibility |
| --- | --- |
| `useSettings` | Retrieves settings view model and update command access. |
| `useThemePreference` | Bridges validated settings preference to Theme Store and document controller. |
| `useInstallPrompt` | Exposes browser install capability without assuming it exists. |
| `usePwaUpdate` | Exposes safe update availability and activation request. |
| `useDataManagementStatus` | Retrieves storage/backup readiness without reading financial records into UI state. |
| `useExportBackup` | Starts an export use case and exposes safe progress/outcome. |
| `useRestoreBackup` | Coordinates file selection, preflight summary, confirmation, and restore use case. |
| `useResetLocalData` | Coordinates explicit confirmed local-data reset flow. |

Hooks may call feature application-service interfaces and focused Zustand selectors. They must not call raw Dexie tables, contain duplicated financial calculations, or expose untyped exceptions to components.

## Utilities and Presentation Helpers

| Utility | Responsibility |
| --- | --- |
| Money formatter/parser adapter | Converts validated minor units to localized display and form-compatible text; domain money arithmetic remains separate. |
| Date/period formatter | Formats canonical period/date values without changing their meaning. |
| Category presentation map | Maps fixed domain category identifiers to label, description, icon, and semantic design token. |
| Metric status presenter | Maps supplied comparison/limit state to user-facing label and non-color status treatment. |
| Chart data adapter | Converts an already calculated reporting view model to chart-library input and matching table rows. |
| Transaction row presenter | Maps a transaction view model to table/list-safe display fields. |
| Error-message mapper | Converts typed application outcomes to concise recoverable user copy. |
| Route builder | Creates canonical, typed route destinations and query parameters. |
| Focus/keyboard helpers | Encapsulates non-domain accessibility interactions required by shared overlays and controls. |

Utilities are pure where possible. No utility should query IndexedDB, mutate Zustand, use `any`, or import a page/component. Domain calculations are domain services, not presentation utilities.

## Data Flow

```text
Route and UI interaction
        ↓
Page → feature hook → application service / read-model query
        ↓                         ↓
Shared component ← typed view model / typed outcome ← repository adapter → Dexie
        ↓
Focused Zustand store only for transient UI coordination
```

This direction prevents components from becoming persistence controllers and prevents feature widgets from coupling to each other’s stores.

## Acceptance Criteria

- Every route has an explicit loading, empty/unavailable, error, and normal-content branch.
- Every financial chart has a paired table or textual summary.
- Shared UI remains feature-agnostic; feature components do not access Dexie directly.
- Forms retain drafts locally and submit through feature hooks/use cases.
- Dialog host state contains only a typed kind and minimal context, not callbacks or record copies.
- Navigation, tables, dialogs, and all actions are keyboard accessible with clear semantic labels.
- No component repeats domain calculations or keeps an authoritative financial record copy in local/Zustand state.

## Developer Notes

This is a target hierarchy, not an instruction to generate every component immediately. Begin each feature with the smallest set of route, widget, and shared primitives needed for the approved workflow. Add a component only when it has a distinct responsibility; prefer composition over generic “container” components.
