# Dexie Database Design

## Purpose

Define the complete IndexedDB persistence design for Kakeibo. This document is a database contract, not a Dexie implementation.

## Overview

Kakeibo is local-only. A single Dexie database is the authoritative source of financial records and settings for one browser origin. Domain logic never depends on Dexie; feature repositories map typed domain records to database records, and application use cases coordinate all mutations.

## Goals

- Preserve complete, correct financial history offline.
- Make common month-scoped reads fast and predictable.
- Support forward-only schema changes without partial migration.
- Make export, import, and destructive recovery explicit and safe.
- Keep the database simple enough to reason about and test.

## Architectural Decisions

| Decision | Rationale |
| --- | --- |
| One database, named `kakeibo` | One local product owns one coherent consistency boundary; separate feature databases would make month deletion, backup, and migration needlessly fragile. |
| Normalized core records | Budget month, plan, transactions, and review change independently. Persisting dashboard totals would create stale-authority risk. |
| String IDs generated on-device | IDs remain stable across backup/restore and are safe for future merge semantics. IDs must use cryptographically secure randomness when implemented. |
| Integer minor units for money | Prevents floating-point currency errors. |
| ISO strings for persisted dates | `YYYY-MM` period keys and `YYYY-MM-DD` transaction dates are time-zone-stable; UTC ISO instants sort lexicographically for lifecycle timestamps and serialize safely in backups. |
| One configured base currency in version 1 | Totals remain unambiguous. Currency is retained on records as a historical invariant and future migration guard. |
| Dexie is infrastructure only | React, Zustand, forms, and domain calculations cannot be coupled to database objects. |
| No persisted aggregates | Reporting derives summaries from authoritative records or explicit read models; it never trusts a cached total as financial truth. |
| Replace restore before merge restore | A full, validated replacement is understandable and atomic. Cross-device merge requires explicit collision policy and is deferred. |

## Tables

### `appSettings`

Stores the singleton local profile. Its fixed record ID is `app-settings`.

| Field | Type contract | Required | Notes |
| --- | --- | --- | --- |
| `id` | literal singleton identifier | Yes | Primary key; there can be exactly one settings record. |
| `baseCurrency` | supported ISO 4217 currency code | Yes | Version 1 uses one base currency. |
| `locale` | BCP 47 locale tag | Yes | Display preference only; it does not reinterpret historic dates. |
| `weekStartsOn` | integer 0–6 | Yes | Calendar-display preference. |
| `createdAt` | UTC ISO instant | Yes | Record lifecycle metadata. |
| `updatedAt` | UTC ISO instant | Yes | Optimistic-concurrency and diagnostics metadata. |

Indexes: unique primary key `id`; an `updatedAt` secondary index is optional and should be added only if a concrete maintenance query requires it.

### `budgetMonths`

Represents the Kakeibo budgeting aggregate root for a calendar period.

| Field | Type contract | Required | Notes |
| --- | --- | --- | --- |
| `id` | stable opaque string ID | Yes | Primary key. |
| `periodKey` | `YYYY-MM` | Yes | Unique canonical month identity, independent of locale/time-zone changes. |
| `status` | `active` or `archived` | Yes | Lifecycle state; archive behavior is controlled by application policy. |
| `createdAt` | UTC ISO instant | Yes | Lifecycle metadata. |
| `updatedAt` | UTC ISO instant | Yes | Used for stale-write detection. |
| `archivedAt` | UTC ISO instant or absent | No | Present only when archived. |

Indexes: unique primary key `id`; unique `periodKey`; `status`; `updatedAt`. `periodKey` is the natural lookup key for routing and creation, while `id` is the stable relationship key.

### `budgetPlans`

Stores one editable plan for one budget month. It is separate from the month so plan data can evolve without changing transaction identity.

| Field | Type contract | Required | Notes |
| --- | --- | --- | --- |
| `id` | stable opaque string ID | Yes | Primary key. |
| `monthId` | existing `budgetMonths.id` | Yes | Unique: at most one plan per month. |
| `plannedIncomeMinor` | non-negative safe integer | Yes | Planned incoming funds. |
| `fixedCommitmentsMinor` | non-negative safe integer | Yes | Planned obligations outside discretionary categories. |
| `savingsTargetMinor` | non-negative safe integer | Yes | Planned allocation, not an expense transaction. |
| `categoryLimitsMinor` | complete map of four Kakeibo categories to non-negative safe integers or explicit absence | Yes | Optional limits are represented deliberately; no ambiguous `null`/missing mixture. |
| `currency` | equals settings base currency | Yes | Historical invariant. |
| `createdAt` | UTC ISO instant | Yes | Lifecycle metadata. |
| `updatedAt` | UTC ISO instant | Yes | Stale-write detection. |

Indexes: unique primary key `id`; unique `monthId`; `updatedAt` only if a real maintenance query needs it. The unique `monthId` index enforces the one-plan relationship at the database index level.

### `transactions`

Stores immutable-in-meaning financial events. Editing changes the record only through an application use case that validates the resulting event; a transaction never stores calculated month totals.

| Field | Type contract | Required | Notes |
| --- | --- | --- | --- |
| `id` | stable opaque string ID | Yes | Primary key. |
| `monthId` | existing `budgetMonths.id` | Yes | Owning budget aggregate. |
| `type` | `income` or `expense` | Yes | Determines category requirements and reporting treatment. |
| `category` | Needs, Wants, Culture, Unexpected, or absent | Conditional | Required only for `expense`; absent for `income`. |
| `amountMinor` | positive safe integer | Yes | Absolute amount; type expresses direction. |
| `currency` | equals month plan/settings currency | Yes | Preserves historical fact and blocks ambiguous totals. |
| `occurredOn` | `YYYY-MM-DD` | Yes | Local calendar date; must be inside the owning `periodKey` in version 1. |
| `note` | plain text within documented length | Yes | May be empty; never rendered as HTML. |
| `createdAt` | UTC ISO instant | Yes | Lifecycle metadata. |
| `updatedAt` | UTC ISO instant | Yes | Stale-write detection. |

Indexes:

| Index | Query it supports | Reason |
| --- | --- | --- |
| unique primary key `id` | direct mutation/read | Stable record access. |
| `monthId` | full monthly aggregation | Essential reporting join. |
| `[monthId + occurredOn + id]` | chronological transaction history and cursor pagination | Deterministic ordering, including same-day transactions. |
| `[monthId + category + occurredOn + id]` | category-filtered month history and category totals | Avoids scanning unrelated months. |
| `[monthId + type + occurredOn + id]` | income/expense filtering and actual-income query | Supports separate income and expense summaries. |
| `updatedAt` | maintenance and stale-data diagnostics | Not used for reporting. |

No note full-text index is included in version 1. Search operates within the active month’s bounded result set after indexed retrieval. Add a dedicated search index only after profiling demonstrates a real need; IndexedDB indexes are not a full-text search engine.

### `monthlyReviews`

Stores one structured reflection for a budget month.

| Field | Type contract | Required | Notes |
| --- | --- | --- | --- |
| `id` | stable opaque string ID | Yes | Primary key. |
| `monthId` | existing `budgetMonths.id` | Yes | Unique: at most one review per month. |
| `answers` | fixed, versioned map of reflection prompt identifiers to plain-text answers | Yes | Prompt identifiers are stable, not UI-copy strings. |
| `nextMonthIntention` | plain text within documented length | Yes | May be empty. |
| `completedAt` | UTC ISO instant or absent | No | Present after deliberate completion. |
| `createdAt` | UTC ISO instant | Yes | Lifecycle metadata. |
| `updatedAt` | UTC ISO instant | Yes | Stale-write detection. |

Indexes: unique primary key `id`; unique `monthId`; `completedAt` for completed-review listing only if that view is introduced; `updatedAt` for maintenance if needed.

### `appMetadata`

Stores small non-financial internal metadata. It is not a second settings table and must never become a generic dumping ground.

| Field | Type contract | Required | Notes |
| --- | --- | --- | --- |
| `key` | approved metadata key | Yes | Primary key. |
| `value` | versioned, validated metadata payload | Yes | Only approved key-specific shapes are valid. |
| `updatedAt` | UTC ISO instant | Yes | Lifecycle metadata. |

Initial approved keys are `lastSuccessfulBackupAt` and `lastSuccessfulRestoreAt`. Dexie schema version, backup format version, and user settings do not belong here.

Indexes: unique primary key `key`; no secondary indexes in version 1.

## Relationships and Integrity

```text
appSettings (singleton)

budgetMonths (1) ── (0..1) budgetPlans
       │
       ├────────── (0..*) transactions
       │
       └────────── (0..1) monthlyReviews
```

IndexedDB does not enforce foreign keys. The application layer owns referential integrity and executes multi-record mutations in a single Dexie transaction. Required policies are:

- Create a plan, transaction, or review only after the referenced month exists.
- Reject writes to archived months unless a named reopening policy authorizes them.
- Delete a budget month only through a confirmed cascade that removes its plan, transactions, and review in one transaction.
- Never delete settings as part of month deletion.
- Never change a record’s `monthId`, currency, or primary ID through an ordinary edit; create an explicit migration/correction workflow if such a need is approved.
- Reject a plan or transaction whose currency differs from settings base currency.

## TypeScript Interfaces

Implementation will use separate strict TypeScript contracts for domain entities, database records, repository inputs, and view models. Database record interfaces mirror the table fields above exactly and use no `any` values. The contracts are:

| Contract | Responsibility |
| --- | --- |
| `AppSettingsRecord` | Persisted singleton settings shape. |
| `BudgetMonthRecord` | Persisted month aggregate identity and lifecycle. |
| `BudgetPlanRecord` | Persisted plan amounts and category-limit map. |
| `TransactionRecord` | Persisted income/expense event, using a discriminated union for category/type validity. |
| `MonthlyReviewRecord` | Persisted structured reflection. |
| `AppMetadataRecord` | Persisted approved internal metadata. |
| `BackupManifest` | Versioned portable backup envelope and compatibility metadata. |
| `BackupPayload` | Manifest plus complete validated table collections. |

Use branded or otherwise constrained types for opaque IDs, period keys, local dates, UTC instants, currency codes, and minor-unit amounts where practical. Domain interfaces may be richer than persisted records but must map losslessly. Database-specific types must not enter React props or domain services.

## Validation

Validation occurs at three non-overlapping boundaries.

| Boundary | Validates | Failure behavior |
| --- | --- | --- |
| Form/input | User-entered strings, required fields, localized monetary input | Inline correction without mutation. |
| Application use case | Domain invariants, existing references, archive state, currency/period ownership, stale revisions | Typed workflow failure with recoverable message. |
| Persistence and import | Exact record shape, enum values, safe integers, IDs, date formats, backup format compatibility | Reject before committing a database mutation. |

All amounts are integer minor units from 1 through the configured maximum safe integer for transactions, and from 0 through that maximum for plans. `amountMinor` must not be zero. Dates use strict calendar validation, not just a string-pattern check. Notes and review answers have explicit length limits defined by product policy before implementation. Parsed imports must reject unknown mandatory format versions and unrecognized enum values; optional future fields may be ignored only when the backup compatibility policy explicitly permits it.

## Versioning

Three versions are independent:

| Version | Owner | Rule |
| --- | --- | --- |
| Database schema version | Dexie | Increases only when persisted schema or required record transformation changes. |
| Backup format version | Data-management feature | Increases when export semantics or portable record shape changes. |
| Application release version | Delivery process | Identifies a build but does not determine data compatibility alone. |

Initial database schema is version 1 and contains all six tables in this document. Table and index declarations are append-only through future Dexie schema versions: never edit historical schema declarations in place. A schema version is permanent once released.

## Migrations

Each migration must be a named, tested, forward-only transformation with these stages:

1. Document the old and new record contracts, affected indexes, compatibility window, and rollback/recovery plan.
2. Add a new Dexie schema version and its deterministic upgrade transformation.
3. Validate and transform records inside Dexie’s upgrade transaction; do not call UI, network, or file APIs from the migration.
4. Let an upgrade failure abort the transaction, leaving the prior database intact. Never continue by silently creating an empty replacement database.
5. Test migration fixtures from every supported prior released schema and test an interrupted/failed upgrade outcome.
6. Release a UI shell that can safely read the resulting version. Service-worker activation must not force an old open tab to operate against an incompatible shape.

For multi-tab upgrades, the active database connection receives a version-change event and must close its connection, preserve unsaved form drafts in memory only, and invite the user to reload. A cross-tab coordinator prevents an import/restore from running concurrently with a migration. Schema migration does not itself download a backup; release guidance encourages users to export before materially risky updates when a working app is available.

## Repository Layer

Repositories are feature-owned adapters over the central database; they are not generic table wrappers. Each repository exposes domain-oriented operations and maps records at its boundary.

| Repository contract | Owns | Must not own |
| --- | --- | --- |
| `BudgetRepository` | Create/find/list/archive/reopen budget months and their plan boundary | Dashboard rendering or raw Dexie tables in UI. |
| `TransactionRepository` | Read/create/update/delete transactions and paged month history | Money calculations outside query projection needs. |
| `ReviewRepository` | Get/save/complete one review per month | Month deletion policy. |
| `SettingsRepository` | Read/update singleton preferences | Currency migration policy without application authorization. |
| `ReportingQueryRepository` | Efficient read-only month projections and totals | Persisted summary authority or mutation. |
| `BackupRepository` | Read a consistent snapshot and write a validated restore within a transaction | UI confirmation and file-picker interactions. |

Application services coordinate repositories when a workflow crosses records: create month plus default plan, confirmed month deletion cascade, restore, and currency-policy validation. The Dexie database class, transaction runner, and migrations remain in shared infrastructure. Repository interfaces live beside their owning feature’s application contracts; concrete Dexie adapters live beside that feature’s infrastructure.

## Query Patterns

All routine financial reads are scoped by `monthId` or `periodKey`; the application must not load all historical transactions to render a monthly screen.

| Use case | Query pattern | Performance policy |
| --- | --- | --- |
| Open selected month | Find month by unique `periodKey`, then plan/review by unique `monthId` | Constant number of indexed reads. |
| Transaction history | Query `[monthId + occurredOn + id]` descending; use cursor-based page boundaries | Do not offset-scan large histories. |
| Category filter | Query `[monthId + category + occurredOn + id]` | Filter at the index boundary. |
| Income/expense filter | Query `[monthId + type + occurredOn + id]` | Filter at the index boundary. |
| Dashboard summary | One month-scoped reporting projection, shared by all dashboard widgets | Do not create one live subscription per card/chart. |
| Category totals | Aggregate only the active month’s expense rows or a month projection | Never persist totals as authority. |
| Note search | Retrieve an already bounded month set and apply normalized in-memory match | Add search infrastructure only after measured need. |
| Backup | Read all tables inside one readonly transaction/snapshot boundary | Do not combine inconsistent table reads outside a transaction. |

Reactive reads use a small number of feature-level observable query sources. A successful mutation invalidates or naturally refreshes those sources; Zustand may retain filters, selected month, and dialog state but never copies the authoritative transaction collection.

## Backup Strategy

A backup is a user-owned, versioned, portable file created entirely on-device. It contains:

- A manifest with backup format version, export timestamp, source application release when known, source database schema version, and base currency.
- Complete collections for `appSettings`, `budgetMonths`, `budgetPlans`, `transactions`, `monthlyReviews`, and approved portable `appMetadata` records.
- No service-worker caches, browser cache data, transient UI state, logs, or encryption secrets.

Export steps are: acquire the cross-tab data-management lock; read all collections in a single readonly transaction; validate the constructed payload; serialize a format with documented deterministic rules; initiate a local download; only then record `lastSuccessfulBackupAt` when download initiation succeeds. The export file is sensitive financial data. Use a non-identifying filename prefix such as `kakeibo-backup-YYYY-MM-DD`; do not include notes, names, or device identifiers in its filename.

Backups are plain portable data in version 1 and are not encrypted. The UI must state this plainly and recommend secure storage. Optional encrypted backups require a separate format version and key-recovery design, not an ad hoc wrapper.

## Restore Strategy

Version 1 supports **replace restore** only. Merge restore is intentionally unavailable until a stable duplicate and conflict-resolution policy is designed.

Restore steps are:

1. User selects a local backup file and sees an explicit replace-data warning.
2. Parse the file with bounded size and complexity limits before database mutation.
3. Validate manifest version, all record contracts, unique IDs, unique period keys, relationship integrity, currency policy, and no duplicate one-to-one month records.
4. Present a summary of incoming record counts and backup timestamp. Encourage exporting current data before replacement; do not claim a backup exists unless export initiation succeeded.
5. Acquire the cross-tab data-management lock and ensure no schema upgrade is in progress.
6. In one read-write transaction, clear the six managed tables and bulk-write the validated replacement records. If any write fails, abort the transaction so the prior data remains unchanged.
7. Refresh feature query sources, clear only stale transient UI state, release the lock, and show a success state with imported counts.

Unsupported newer formats, malformed files, storage quota errors, cancellation, and failed writes leave existing data unchanged. A restore never deletes browser caches or unrelated origin storage.

## Error Handling

Expected persistence failures are typed as not found, conflict/stale revision, invalid input, invalid import, unsupported backup version, storage unavailable, quota exceeded, blocked upgrade, and unexpected database failure. Presentation translates them into specific recovery guidance. Database errors must never be reported as a successful save.

If storage is unavailable, the app remains readable only to the extent existing in-memory data is available; it must not present a false offline-ready state. If quota is exhausted, block new writes, retain the user’s draft where safely possible, and guide the user toward exporting existing data or freeing browser storage. If a stale edit is detected, retain the draft and show the current record with a clear retry/review action.

## Security and Privacy

Financial data is private to the browser origin but is not inherently encrypted at rest. The app must make that limitation clear. Database records and backup contents are never sent to a server. Imported notes, answers, and metadata are treated as untrusted plain text and never rendered as HTML. Backup parsing applies file-size, collection-count, field-length, and nesting limits to reduce local resource-exhaustion risk.

The service worker must not cache backups, imported files, or IndexedDB contents. Clearing site data can erase the database; data-management UI should promote export before destructive browser-storage guidance.

## Testing and Acceptance Criteria

- Schema version 1 creates exactly the documented tables and indexes.
- Unique period, plan-month, and review-month constraints reject duplicate records.
- Domain/application tests cover foreign-key policy, archived-month policy, period ownership, currency policy, and cascade deletion.
- Repository integration tests verify every query pattern uses month-scoped data and returns deterministic date ordering.
- Migration tests run every released fixture through each supported upgrade path.
- Backup round-trip tests preserve all valid records and their relationships.
- Invalid or unsupported restore files never modify existing data.
- A failed restore write leaves all prior table contents intact.
- Reporting totals always derive from authoritative month records, never a persisted aggregate.

## Future Improvements

Potential future work includes encrypted backup format version 2, explicit merge restore, category customisation with a versioned taxonomy, recurring transaction templates, attachment storage, and formal corrections/refunds. Each requires a new domain and migration decision before schema changes.

## Developer Notes

Do not expose Dexie tables outside repository infrastructure. Do not use `any`, floating-point monetary values, mutable global record collections, or unversioned import formats. Add an index only for a documented query; every index increases write and storage cost. Keep database migrations and service-worker updates small, tested, and compatible with an offline user who may skip several releases.
