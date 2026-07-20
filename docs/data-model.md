# Data Model and Local Persistence

## Purpose

Specify local entities, relationships, persistence ownership, migrations, and data portability.

## Overview

IndexedDB is the only authoritative store. Dexie provides schema versioning, indexed queries, and transactional writes. All records are local to the browser profile and origin.

## Goals

- Maintain durable, queryable financial records offline.
- Make data export and restoration safe and understandable.
- Allow schema evolution without corrupting local records.

## Responsibilities

The persistence layer owns database schema, record serialization, indexes, migration steps, transactional boundaries, and backup parsing. It does not own dashboard presentation or form draft state.

## Functional Requirements

- Store application settings, budget months, plans, transactions, reviews, and metadata.
- Query transactions by budget month, date, category, and type.
- Perform multi-record mutations atomically when consistency requires it.
- Export a versioned, complete portable backup.
- Validate imports before replacing or merging local data.

## User Stories

As a user, my data remains after closing the app. As a user, I can restore a backup after changing devices. As a user, I can delete all local data intentionally.

## Technical Design

Records use stable string identifiers generated on-device. A `settings` singleton stores schema-compatible preferences including base currency. `budgetMonths` has unique calendar key, lifecycle status, timestamps, and display label metadata. `budgetPlans` references its month and stores planned income, fixed commitments, savings target, and optional category limits in minor units. `transactions` references its month and stores type, category when expense, amount minor units, currency, transaction date, note, and timestamps. `monthlyReviews` references its month and stores structured reflection answers, next-month intention, and completion timestamp. `metadata` stores backup and migration bookkeeping only.

Version 1 initializes the local profile with INR, `en-IN`, and a Monday week start. This is a deliberate, temporary product default for the initial release; Milestone 8 owns user-facing preference management. Currency is retained on every financial record so a future currency-change policy cannot silently rewrite history.

Indexes prioritize: month identifier; transaction month plus date; transaction month plus category; transaction month plus type; and calendar month key. Referential integrity is enforced in application transactions because IndexedDB has no foreign keys. Deleting a month cascades only after confirmation and within one transaction.

Backups include a format version, export timestamp, app version where available, base currency, and every supported record collection. Import modes must be explicit: replace all data, or merge only when stable-ID conflict policy is specified. The initial product should prefer replace-after-backup confirmation for lower ambiguity.

## UI Considerations

Data-management views describe browser-local storage plainly. Before destructive replacement or deletion, show record counts and the exact action. Export success includes a visible next step to store the file safely.

## Data Model

Relationship map: Settings (one local profile); Budget Month (one) → Budget Plan (zero or one), Transactions (zero to many), Monthly Review (zero or one). Transactions retain their category and currency as historical facts. No record is shared with a remote service.

## Validation

Validate record shape and backup format version at the boundary. Verify referenced budget months exist, dates are valid ISO calendar values, monetary values are safe integers, and enum values are recognized before commit.

## Error Handling

Database unavailability, quota errors, blocked upgrades, corrupt import files, and unsupported backup versions produce recoverable user guidance. Failed imports must not partially mutate existing data. Failed exports must not claim success.

## Edge Cases

- Browser storage eviction or private-browsing restrictions.
- A backup from a newer unsupported format.
- Duplicate calendar months during import.
- Interrupted schema upgrade.
- Device locale changes after records were created.

## Acceptance Criteria

- Financial records survive reload and offline use.
- Every mutation either completes atomically or leaves prior data unchanged.
- Export contains all user-owned records and can be validated before import.
- Persisted money never uses floating-point values.

## Future Improvements

Add optional encrypted backup archives, explicit merge conflict UI, storage-health reporting, and attachment stores if receipt support is introduced.

## Developer Notes

Version database schemas deliberately and retain migration tests. Never expose raw database records as a long-term public UI contract.

For the complete table, index, repository, migration, backup, and restore contract, see [Dexie database design](dexie-database-design.md).
