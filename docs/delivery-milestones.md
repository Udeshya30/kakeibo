# Delivery Milestones

## Purpose

Sequence Kakeibo into the smallest deployable vertical slices that deliver a coherent user outcome while preserving clean architecture, offline-first behavior, and local-data safety.

## Delivery Principles

- Every milestone is production-deployable on its own and leaves prior workflows working.
- A milestone contains the minimum UI, application logic, persistence, and tests needed for its outcome.
- No milestone introduces a temporary second source of truth or knowingly unsafe data mutation.
- Estimates are for one experienced engineer after product/design decisions are available; they exclude unplanned research and external review delays.
- Milestones 9 and 10 are mandatory before a broad/public release because financial data must be portable and safely recoverable.

## Milestone 1 — Offline Application Foundation

### Goal

Deliver an installable, accessible app shell that opens reliably offline and transparently reports unsupported storage or safe update state.

### Features

- React application bootstrap, router, error boundary, root layout, and route placeholders.
- Design-system foundations and shared accessible primitives needed by the shell.
- Dexie database version 1 initialization and storage-capability detection; no financial workflow yet.
- PWA manifest, application-shell caching, offline navigation fallback, installation affordance, and safe update notice.
- Primary navigation, skip link, global status region, and route announcements.

### Dependencies

Approved architecture, design system, Dexie design, PWA asset metadata, and supported-browser baseline.

### Estimated Complexity

Medium-high. PWA cache/update behavior and storage capability handling have broad impact despite a small visible feature set.

### Estimated Time

3–5 engineering days.

### Acceptance Criteria

- Production build launches core shell routes after a successful first load with network disabled.
- The app is installable on supported browsers.
- Unsupported or unavailable IndexedDB produces a clear recovery screen, not a blank/error-only app.
- Keyboard navigation, skip link, active navigation state, and route announcements work.
- Service-worker update does not force reload while a workflow later registers unsaved changes.

### Risks

Browser differences in PWA installation and private-mode storage; stale route chunks after update; service-worker cache incompatibility.

### Testing Strategy

Unit-test startup state transitions; integration-test storage capability outcomes; manually test a production build offline, installed, updated in two tabs, keyboard-only, and with reduced motion.

### Developer Notes

Do not add financial data to Zustand. Keep the shell useful but honest: it is a foundation release, not a simulated budgeting experience.

## Milestone 2 — Create and Plan a Budget Month

### Goal

Allow a user to create a calendar month and establish an initial Kakeibo plan.

### Features

- Create/select a budget month by canonical period key.
- Enter and edit planned income, fixed commitments, savings target, and optional four-category limits.
- Display planned available spending with explanatory labels.
- Archive/reopen lifecycle policy where approved; destructive month deletion remains deferred until dependent data exists.
- Budget-month and plan repositories, domain rules, validation, and route-level error/empty states.

### Dependencies

Milestone 1; Budgeting domain contracts; Money, currency, and period policies.

### Estimated Complexity

Medium.

### Estimated Time

3–4 engineering days.

### Acceptance Criteria

- A user can create one unique month, save a valid plan, reload offline, and see the same values.
- Duplicate period creation is rejected clearly.
- Planned available spending uses integer-minor-unit domain calculations and never floating point.
- Invalid amounts and impossible lifecycle transitions do not persist.
- Page works at narrow and wide widths with keyboard-accessible form behavior.

### Risks

Ambiguous actual-income policy and later currency changes can invalidate assumptions. Resolve both before implementation.

### Testing Strategy

Unit-test plan calculations and period validation; repository-test unique period/one-plan constraints; interaction-test form errors, save, reload, and archived state.

### Developer Notes

Keep the Budgeting aggregate boundary intact. Do not build dashboard totals or transaction placeholders in this milestone.

## Milestone 3 — Record, Edit, and Remove Transactions

### Goal

Enable fast, trustworthy entry and correction of monthly income and expenses.

### Features

- Quick-add and route/dialog transaction entry.
- Income and expense types; required Kakeibo category for expenses.
- Edit and confirmed delete workflows.
- Month ownership, date-within-period, currency, archive-state, and monetary validation.
- Typed mutation outcomes and accessible confirmation/error feedback.

### Dependencies

Milestone 2; finalized income/refund/correction policy; transaction table/index schema from Dexie design.

### Estimated Complexity

Medium-high.

### Estimated Time

4–5 engineering days.

### Acceptance Criteria

- A user can create valid income and expense records offline and see success feedback.
- An expense cannot be saved without a category; an income cannot retain one.
- Editing/deleting a transaction affects only its owning month and survives reload.
- Delete requires an explicit confirmation that identifies the affected record.
- Failed writes preserve safe form input and never report success.

### Risks

Locale-aware monetary input, stale edits in multiple tabs, and ambiguous refunds are the main correctness risks.

### Testing Strategy

Unit-test transaction invariants; repository-test indexed writes and stale/missing record handling; RTL-test keyboard form completion, error announcements, edit, and delete confirmation.

### Developer Notes

React Hook Form owns drafts. Dexie owns transactions. Zustand may open the dialog and report scoped operation state only.

## Milestone 4 — Browse and Filter Transaction History

### Goal

Make recorded spending easy to find and inspect without compromising responsiveness as history grows.

### Features

- Month-scoped transaction history route.
- Date ordering, type/category filters, bounded note search, and clear-filters action.
- Semantic desktop table and content-equivalent compact mobile list.
- Cursor pagination/load-more behavior and no-results versus first-use empty states.

### Dependencies

Milestone 3; compound transaction indexes; Transaction Store architecture.

### Estimated Complexity

Medium.

### Estimated Time

3–4 engineering days.

### Acceptance Criteria

- History reads only the selected month and presents deterministic date ordering.
- Filter changes reset pagination and do not leak results from another month.
- Table has headers/caption and mobile layout remains fully actionable without horizontal page scrolling.
- No-results and no-transactions states are distinguishable and actionable.
- Search does not introduce a global full-history scan.

### Risks

Unbounded note search, duplicated desktop/mobile queries, and cursor bugs can degrade performance or duplicate records.

### Testing Strategy

Repository integration-test every indexed query; interaction-test filtering, pagination reset, mobile/desktop semantic branches, keyboard row actions, and empty states.

### Developer Notes

Do not add virtualization before measured need. Keep search bounded to the already indexed month result set.

## Milestone 5 — Monthly Dashboard

### Goal

Give the user an understandable at-a-glance view of the selected month.

### Features

- Month-scoped reporting read model for planned available, actual income, actual expenses, remaining amount, and category totals.
- Dashboard summary metric cards, category-limit progress, category breakdown, recent activity, and review prompt.
- Accessible category chart with precise table/text equivalent.
- Dashboard-specific loading, empty, and recoverable failure states.

### Dependencies

Milestones 2–4; finalized calculation matrix; Reporting query repository/read-model contract.

### Estimated Complexity

Medium-high.

### Estimated Time

4–5 engineering days.

### Acceptance Criteria

- Every dashboard total derives from the same authoritative month-scoped reporting projection.
- Changing a plan or transaction refreshes affected dashboard data without reload.
- No dashboard card creates its own duplicate Dexie subscription.
- Chart meaning is available in text/table form and does not rely on color.
- Empty month communicates the next useful action without showing misleading zero-state success.

### Risks

Inconsistent calculation definitions and duplicate reactive queries are the key architecture risks; charts can create accessibility gaps.

### Testing Strategy

Unit-test reporting calculations; integration-test projection refresh after mutations; RTL-test loading/empty/error/normal states; manually inspect chart/table parity and reduced-motion behavior.

### Developer Notes

This is the first reporting surface. Do not persist totals or put report results in Zustand.

## Milestone 6 — Insights and Plan-versus-Actual Analysis

### Goal

Provide deeper, non-judgmental monthly insight beyond the dashboard summary.

### Features

- Category distribution, plan-versus-actual, spending timeline, and category-limit insight sections.
- Paired visual and tabular representations for every chart.
- Report display preference and progressively revealed insight sections.
- Explanatory insight copy grounded in actual local records.

### Dependencies

Milestone 5; approved insights view-model definitions; chart-library integration policy.

### Estimated Complexity

Medium.

### Estimated Time

3–4 engineering days.

### Acceptance Criteria

- Insights reuse reporting contracts rather than recomputing unrelated totals in components.
- Every visual has a precise accessible alternative.
- No animation is required to understand figures and reduced motion disables decorative chart motion.
- Empty or one-category months remain comprehensible.
- Chart rendering is deferred or bounded so it does not slow core transaction workflows.

### Risks

Overly dense analytics, misleading visual emphasis, and Recharts performance on large datasets.

### Testing Strategy

Unit-test chart-data adapters against fixed report models; RTL-test visual/table mode and accessible summaries; manual responsive, keyboard, and reduced-motion verification.

### Developer Notes

Insights must explain, not prescribe. Avoid turning Kakeibo into investment, credit, or financial-advice software.

## Milestone 7 — Monthly Reflection

### Goal

Complete the Kakeibo cycle with a guided, saved monthly reflection.

### Features

- Monthly review availability/status.
- Read-only reflection context drawn from the reporting model.
- Structured reflection questions, next-month intention, save, complete, and reopen policy.
- Review completion status on Dashboard/Plan where relevant.

### Dependencies

Milestone 5; fixed reflection prompt identifiers and completion/reopen product policy.

### Estimated Complexity

Medium.

### Estimated Time

3–4 engineering days.

### Acceptance Criteria

- A user can save and complete one review per month offline.
- Reflection drafts and validation remain local to the form; persisted answers survive reload after save.
- Completion/reopen behavior follows documented archive policy.
- Review summary uses shared reporting calculations, not duplicated metrics.
- The workflow is keyboard and screen-reader usable with clear error recovery.

### Risks

Unstable prompt wording can break historical answer meaning; accidentally persisting partial drafts increases privacy/retention scope.

### Testing Strategy

Unit-test review completion rules; repository-test one-review-per-month constraint; RTL-test save, validation, completion, focus/error flow, and reload persistence.

### Developer Notes

Keep prompt IDs stable even if display copy changes. Do not add automatic next-month planning or reminders without separate scope approval.

## Milestone 8 — Preferences and Supported-Device Experience

### Goal

Let users control supported display preferences and understand local-only application capabilities.

### Features

- Locale, week-start, and available theme-preference settings.
- Currency policy display and safe guidance rather than unsafe currency conversion.
- Install capability guidance and supported-browser messaging.
- Theme hydration from Dexie settings into Theme Store without localStorage duplication.

### Dependencies

Milestone 1; settled design-token theme support; settings schema contract.

### Estimated Complexity

Low-medium.

### Estimated Time

2–3 engineering days.

### Acceptance Criteria

- Valid preferences persist offline in settings and apply after reload.
- Theme preference honors system mode where supported and does not offer unavailable visual modes.
- Locale changes affect presentation, not canonical period ownership or stored transaction dates.
- Currency cannot be changed in a way that silently mixes financial histories.
- Settings controls are fully labeled and keyboard accessible.

### Risks

Locale parsing/display mismatch, inaccessible custom controls, and premature multi-currency support.

### Testing Strategy

Integration-test settings persistence/hydration; RTL-test controls and system-theme fallback; manual test with browser locale and color-scheme changes.

### Developer Notes

Keep settings small. Any durable new preference belongs in Dexie settings, not Zustand persistence middleware.

## Milestone 9 — Portable Local Backup Export

### Goal

Give users ownership of their local financial data through validated on-device export.

### Features

- Data Management route and storage/backup readiness status.
- Versioned complete backup manifest and local file generation.
- Consistent readonly snapshot across all managed tables.
- Sensitive-backup guidance and successful-export metadata.

### Dependencies

Milestones 2–8; complete backup format specification; cross-tab operation coordinator.

### Estimated Complexity

Medium-high.

### Estimated Time

3–4 engineering days.

### Acceptance Criteria

- Export contains every supported user record and required manifest metadata.
- Snapshot is internally consistent and is created with no network request.
- Exported payload validates against the documented backup contract.
- UI does not claim success if file download initiation fails or is cancelled.
- Backup file name avoids personal notes, device identifiers, and sensitive content.

### Risks

Large memory use, browser file-download restrictions, concurrent writes, and user misunderstanding that plain backups are unencrypted.

### Testing Strategy

Integration-test complete snapshot/manifest generation and round-trip parse validation; simulate download failure; manually test export offline and with a second active tab.

### Developer Notes

This milestone is deployable without restore, but must be delivered before inviting users to entrust significant records to the application.

## Milestone 10 — Validated Restore and Local Data Reset

### Goal

Safely restore a complete backup or deliberately erase all Kakeibo data.

### Features

- Local backup-file selection, bounded parsing, preflight validation, and incoming-data summary.
- Explicit replace restore in one atomic read-write transaction.
- Confirmed reset-local-data action.
- Cross-tab operation lock, success/failure recovery states, and post-restore query refresh.
- Unsupported/newer-format and quota/error handling.

### Dependencies

Milestone 9; backup compatibility tests; transactional restore design; cross-tab coordination from Milestone 1.

### Estimated Complexity

High.

### Estimated Time

4–6 engineering days.

### Acceptance Criteria

- Malformed, unsupported, oversized, or relationship-invalid backups do not alter existing data.
- Valid replacement restore atomically replaces all managed records and refreshes the app into a valid state.
- A failed write leaves prior data intact.
- Reset clearly states scope and requires deliberate confirmation.
- Restore/reset never clear unrelated browser storage or service-worker caches.

### Risks

Data loss from non-atomic replacement, memory/resource exhaustion from hostile imports, multi-tab races, and unclear destructive-action language.

### Testing Strategy

Integration-test valid round-trip, invalid format, duplicate IDs, broken relationships, unsupported version, quota-like failure, and atomic rollback. Manually test restore/reset across two tabs and after an application update.

### Developer Notes

Replace restore only. Do not add merge import until product policy defines collision resolution, ID semantics, and user-visible conflict handling.

## Release Gate

After Milestone 10, run the production release checklist: strict type checking, full unit/integration/RTL suite, migration fixture tests, backup round trip, offline install/update checks, keyboard and screen-reader core-flow review, responsive checks, and manual data-loss recovery exercise. Only then is the product ready for broad distribution.
