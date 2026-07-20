# Zustand State Architecture

## Purpose

Define how Zustand manages Kakeibo’s transient application and interface state without competing with Dexie, the authoritative local database.

## Overview

Zustand is used for small, focused client-side stores. It coordinates selected context, UI overlays, preferences already persisted through Dexie, filter state, and query lifecycle state. It does not own financial records, mutable dashboard totals, form values, or backup payloads.

The term “global store” means globally available application coordination state, not one monolithic store. Stores are independently created and accessed through narrow selectors.

## Governing Rules

- Dexie owns persisted settings, budget months, plans, transactions, reviews, and metadata.
- React Hook Form owns an open form’s draft, dirty state, and field validation state.
- Route parameters own durable navigation context, such as a directly addressed budget month or transaction.
- Zustand owns only state that is transient, derived from UI interaction, or required to coordinate multiple distant UI surfaces.
- A store may retain an identifier, filter, status, or error descriptor; it must not retain a second authoritative copy of a Dexie record collection.
- Derived financial values are calculated by domain/reporting query services, not inside mutable Zustand actions.
- Every store exposes narrow selectors. Components must not subscribe to an entire store object.

## Store Topology

```text
App coordination
├── Global Store       application lifecycle and cross-store coordination
├── UI Store           dialogs, toasts, navigation presentation, busy overlays
├── Theme Store        resolved display theme and preference hydration state
└── Feature stores
    ├── Budget Store       selected month and budget-screen context
    ├── Transaction Store  history filters, sort, pagination, mutation feedback
    ├── Category Store     fixed taxonomy presentation and category filters
    ├── Report Store       reporting period, visualization preference, query state
    └── Reflection Store   review-screen context and completion feedback
```

Feature stores never import each other directly. The application composition layer coordinates cross-feature transitions, such as selecting a new month and clearing incompatible transaction filters. The reporting feature reads typed query results from its own read-model service, not budget or transaction store internals.

## Global Store

### Responsibilities

The Global Store owns application-wide lifecycle state that has no natural feature owner: startup phase, selected budget-month identifier when it is not represented by a route, storage capability state, database schema readiness, current update availability, and cross-tab coordination status.

It does not own settings records, financial data, dialog state, form drafts, or route data.

### Actions

- Mark initialization lifecycle transitions: uninitialized, hydrating, ready, recoverable failure.
- Set the resolved active month identifier after route/application coordination.
- Record storage capability status and clear recovered failures.
- Record update availability and defer or allow safe update activation.
- Acquire/release a named cross-tab operation status for migration, export, import, or reset coordination.

Actions must be idempotent where possible and must not write database records directly. A use case or platform adapter performs the operation, then reports an outcome to the store.

### Selectors

- Application readiness.
- Active month identifier.
- Whether persistent storage is currently available for mutation.
- Whether a cross-tab exclusive operation is active.
- Whether an application update is ready and safe to present.

### Persistence

Do not persist this store through Zustand middleware. Readiness, locks, and error state are session-specific. The active month may be restored from a route or a settings preference via an application coordinator, but not silently written into browser storage by the store.

### Derived State

`canMutateData` is derived from application readiness, storage availability, and absence of an exclusive operation. `shouldDeferUpdate` is derived from update availability plus registered dirty-form state supplied by UI coordination, not by inspecting forms globally.

### Performance Optimizations

Keep values scalar and stable. Subscribe separately to readiness, active month, and update state; never subscribe to the entire lifecycle object. Cross-tab messages update only the affected scalar status.

## UI Store

### Responsibilities

The UI Store owns presentational state that may be triggered from more than one route: active dialog descriptor, toast/status queue, mobile-navigation presentation, command/quick-add surface state, and short-lived busy indicators.

It does not own the content being edited, financial data, validation state, or an unbounded notification history.

### Actions

- Open, replace, and close a typed dialog descriptor.
- Enqueue, dismiss, and expire a bounded toast/status message.
- Open/close quick-add presentation without creating a transaction.
- Set navigation-collapse or mobile-menu state.
- Register/unregister whether the currently visible workflow has unsaved changes for safe update warnings.

Dialog descriptors contain only a discriminated dialog kind and minimal IDs/context; they do not embed record objects or callbacks. Confirmation behavior remains in the feature application layer.

### Selectors

- Current dialog kind and contextual identifier.
- Visible status messages.
- Whether quick-add or mobile navigation is open.
- Whether any active screen reports unsaved changes.

### Persistence

No persistence. Reopening a browser should not restore a destructive confirmation, open dialog, toast, or stale busy state.

### Derived State

`hasBlockingOverlay` is derived from active modal state. `hasUnsavedChanges` is derived from registered route/workflow flags. Toast presentation priority is derived from severity and creation order.

### Performance Optimizations

Render the toast region and dialog host once near the application shell. Components request actions without subscribing unless they need visible state. Auto-dismiss timers live in the presentation effect layer, not the store, so tests and unmounting remain predictable.

## Theme Store

### Responsibilities

The Theme Store owns only the currently resolved color-scheme presentation choice and hydration status. The user preference itself belongs to `appSettings` in Dexie.

Supported preference values are system, light, and dark. The resolved value is light or dark after evaluating the operating-system preference when needed. A design-system decision may initially ship only the light visual theme while still reserving the preference contract; the UI must not falsely offer an unavailable mode.

### Actions

- Hydrate a valid saved preference supplied by Settings application service.
- Select a new preference through that service.
- Update resolved theme when system preference changes.
- Reset transient hydration/error state if settings load fails.

The action that changes a preference requests a persisted settings update through the feature use case; it does not independently write browser storage.

### Selectors

- Saved preference intent.
- Resolved active theme.
- Theme hydration readiness.

### Persistence

Persist only the settings record in Dexie. Never use Zustand persistence middleware or `localStorage` for theme state; doing so would create two competing preferences and break the local-data ownership rule.

### Derived State

Resolved theme derives from saved preference and media-query result. It is never manually maintained as a separate durable value.

### Performance Optimizations

Subscribe to the system color-scheme media query only when preference is system. Expose the resolved scalar token to the app shell; avoid individual component subscriptions.

## Budget Store

### Responsibilities

The Budget Store owns budget-screen context: selected month ID, list-view lifecycle/filter state, planned-versus-actual display mode where a screen needs one, and mutation feedback references. It does not own month, plan, or total records.

This is a presentation coordination store for the Budgeting bounded context. The `BudgetRepository` and budgeting use cases remain responsible for data access and mutation.

### Actions

- Select or clear a month context in coordination with the router.
- Set budget-list status or archive visibility filter.
- Request lifecycle operations through application use cases, then record a typed result reference for UI feedback.
- Clear obsolete screen feedback after it has been acknowledged.

Month creation, plan updates, archival, reopening, and deletion are use-case actions, not raw store mutations.

### Selectors

- Selected month ID.
- Current archive/list filter.
- Whether the budget screen has an in-flight operation.
- Last scoped mutation outcome descriptor.

### Persistence

Persist budget months and plans only in Dexie. Selected context is derived from the route when addressable; a non-route fallback may be initialized from the Global Store for convenience but is not persisted by Zustand.

### Derived State

Budget status cards, planned remaining, actual remaining, category limits, and archive eligibility are derived by domain/reporting services from Dexie query outputs. The store may derive simple UI booleans, such as whether a selected ID exists, but not financial calculations.

### Performance Optimizations

Store IDs and status descriptors, not whole months. Keep archive filtering independent from the selected month. A single budget-screen query source resolves plan/month data; cards consume its memoized view model rather than initiating duplicate reads.

## Transaction Store

### Responsibilities

The Transaction Store owns transaction-history interaction state: active month context reference, type/category filters, normalized note-search text, sort direction, pagination cursor, visible page size, and scoped mutation feedback.

It does not own transaction arrays, draft values, category definitions, calculated totals, or write logic.

### Actions

- Set/reset type and category filters.
- Set normalized search query and clear it.
- Set chronological sort direction.
- Advance/reset cursor pagination after the reporting/query layer returns a next cursor.
- Reset filters or pagination when month context changes.
- Report the completion/failure of a create, edit, or delete use case for visible feedback.

Create, edit, delete, and correction behavior belongs to transaction application services. Form drafts belong to React Hook Form; the store can request that quick-add UI open but cannot retain its fields.

### Selectors

- A stable filter object or individual filter scalars.
- Current pagination cursor and page size.
- Whether filters are active.
- Whether the current query can request another page.
- Scoped mutation status for a transaction ID, when necessary.

### Persistence

Filters may be represented in URL search parameters when shareable or useful on reload. The store hydrates from those parameters and never persists transaction data through middleware. Do not preserve an old cursor across a filter/month change.

### Derived State

`hasActiveFilters` derives from non-default filters. Query request parameters derive from month ID, filters, sort, and cursor. Search matching is a reporting/query concern performed only on an already month-bounded set; the store retains only the normalized term.

### Performance Optimizations

Use shallow equality for compact filter selectors and selectors for individual controls. Reset pagination atomically with a filter change. Query the compound Dexie indexes documented in the database design before applying bounded text search. Avoid a store-wide `isLoading`: request state is keyed by screen/query signature so one operation does not block unrelated history views.

## Category Store

### Responsibilities

The Category Store owns presentation state for the fixed Kakeibo taxonomy: selected category filter, category-help panel state, and the user’s active category choice only when a non-form surface needs it. The four category definitions are domain constants, not mutable store data.

It does not own custom categories, category totals, or category-limit values. Version 1 has no custom taxonomy.

### Actions

- Select/clear a category filter.
- Open/close category guidance.
- Synchronize a selected filter with transaction/reporting context through the application coordinator.

Form category selection remains within the form’s draft state, even when an initial suggestion comes from the store.

### Selectors

- Selected category filter.
- Whether category guidance is visible.
- Whether a given category is selected.

### Persistence

The taxonomy is static domain policy. A category filter may be URL-backed with transaction/report routes but has no independent durable store persistence.

### Derived State

Category labels, descriptions, icons, and semantic accent roles derive from the fixed domain taxonomy and design-system mapping. Category totals derive from reporting queries, never the store.

### Performance Optimizations

Expose a stable category lookup map from a pure domain selector/module, not a recreated state object. Subscribe to a single selected-category scalar. Keep visual metadata outside Zustand unless it must change at runtime.

## Report Store

### Responsibilities

The Report Store owns reporting presentation controls: selected reporting period reference, chart/table display preference, active insight section, and query lifecycle descriptors. It is deliberately read-only with respect to financial records.

It does not own dashboard totals, chart series, category totals, or transaction collections. Those are returned by `ReportingQueryRepository`/reporting application read models backed by Dexie.

### Actions

- Set report month context in coordination with the selected budget month/route.
- Select a display mode where an accessible table and a visual chart are both available.
- Expand/collapse non-essential insight sections.
- Register query start/success/failure metadata for a report signature.
- Retry a failed read by requesting the application query again.

### Selectors

- Report period ID.
- Current display preference.
- Active/expanded insight section.
- Query status and recoverable error descriptor keyed by report signature.

### Persistence

Financial report results are not persisted in Zustand. A non-essential display preference may be stored in `appSettings` through the preferences feature only if a durable user benefit is established; otherwise it is session-only.

### Derived State

All metrics derive from the report read model: planned available spending, actual income, actual expenses, remaining amount, category totals, limit deltas, and review-ready status. The store may derive `isEmpty` or `canRetry` from query descriptors but never recalculate monetary figures.

### Performance Optimizations

Use one month-scoped observable reporting projection per dashboard/insights route and share it among cards, charts, and accessibility tables. Memoize chart-ready transformations in the reporting selector layer keyed by report data revision, not in store actions. Defer rendering expensive charts until their route/section is visible, while always keeping a lightweight textual summary available.

## Reflection Store

### Responsibilities

The Reflection Store owns review-route context, current review status, completion feedback, and optional navigation between reflection sections. It does not own reflection answers while a form is open.

`monthlyReviews` remain in Dexie; React Hook Form owns the answer draft. The review application service validates and saves the final structured record.

### Actions

- Set/clear selected review month context.
- Select a review section in multi-section presentation.
- Request save/complete/reopen workflows through the review use case.
- Record a typed mutation result for UI feedback.
- Clear stale feedback when route context changes.

### Selectors

- Review month ID.
- Selected review section.
- Save/completion status.
- Whether the loaded review is complete, sourced from the query view model rather than duplicated state.

### Persistence

Persist reviews exclusively in Dexie. Never persist a partially completed reflection draft in Zustand. A future draft-recovery feature requires an explicit encrypted/local retention policy and is not implied by this architecture.

### Derived State

Completion eligibility and month summary values derive from validated form data plus reporting read models. `isReviewAvailable` derives from selected period, record state, and product policy. The store holds no parallel answer map.

### Performance Optimizations

Only the review route subscribes to review status. Scope loading/error descriptors by month ID. Maintain form state locally to prevent every keystroke from updating a global store and rerendering unrelated UI.

## Store Composition and Cross-Store Rules

The application composition layer creates and exposes stores independently. It may orchestrate intentional transitions, but stores do not call each other’s actions internally. Examples:

- Selecting a new route month resets transaction pagination and report query state through a coordinator.
- Beginning restore marks Global Store as exclusively busy and UI Store may display a non-dismissable status; data-management use case owns the operation.
- A saved settings preference hydrates Theme Store only after Dexie/settings validation succeeds.

This avoids circular dependencies such as Transaction Store importing Budget Store while Budget Store imports Report Store. It also keeps feature tests independent.

## Persistence Policy

Zustand persistence middleware is prohibited for financial entities, database records, financial aggregates, form drafts, dialogs, locks, errors, and notifications. It is normally unnecessary for all defined stores.

When a preference needs durability, the owning application service writes it to Dexie’s settings record. When a screen state benefits from shareable/reloadable context, use the route or URL search parameters. This gives each kind of state a single owner:

| State type | Owner |
| --- | --- |
| Financial records | Dexie repositories |
| Financial totals and charts | Reporting read models derived from Dexie |
| Form draft and validation | React Hook Form |
| Addressable screen identity | React Router |
| User preferences | Dexie settings via preferences feature |
| Session interaction state | Focused Zustand store |
| Design tokens | Static design-system configuration |

## Performance Optimizations

- Use atomic selectors and equality checks appropriate to small objects; avoid selecting whole stores.
- Keep store state flat, serializable, and small: IDs, enum values, booleans, cursors, and typed descriptors.
- Represent asynchronous state by query/mutation signature, avoiding a global loading boolean that blocks unrelated screens.
- Centralize each route’s Dexie-backed query/read model and share its result within that route.
- Reset stale page cursors, errors, and route-scoped feedback whenever their context identifier changes.
- Keep high-frequency input (typing, amount entry, review answers) out of Zustand.
- Ensure store actions preserve object identity for untouched branches to minimize rerenders.
- Profile before introducing selector memoization or caching beyond the reporting projection layer.

## Validation and Error Handling

Store actions validate only their own lightweight UI inputs, such as known filter values or legal dialog kinds. They do not duplicate domain validation. Application use cases return typed outcomes; stores retain only the safe, user-presentable error descriptor and context identifier. They must not store raw database exceptions, backup contents, notes, or review answers in global error state.

On a stale context, failed read, storage error, or deleted record, clear only the affected feature state and route the user to a valid recoverable screen. Do not reset unrelated filters or dismiss unrelated messages.

## Acceptance Criteria

- No financial record collection, plan, transaction, review answer draft, or report total is authoritative in Zustand.
- Each listed store has one documented ownership boundary and narrow selector set.
- Stores do not import each other; cross-feature coordination occurs in the app composition/application layer.
- Route and form state are not duplicated in stores.
- Any durable preference is persisted through Dexie settings, not Zustand middleware.
- Dashboard cards and charts share a month-scoped reporting read model instead of creating duplicate live queries.
- Store tests can exercise actions and selectors without Dexie, while repository/use-case tests verify data behavior separately.

## Future Improvements

If user-configurable dashboard layouts, navigation density, or local draft recovery are approved, introduce them as explicit settings/draft features with defined retention, migration, and privacy policies. Do not add a generic catch-all store.

## Developer Notes

Use Zustand because it is a small coordination tool, not because every state value belongs globally. Store names describe bounded UI ownership, but the database design remains authoritative. Any proposed state field must answer: why is it not route state, form state, a Dexie query, or a static design token?
