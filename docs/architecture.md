# Architecture

## Purpose

Describe the system boundaries and design rules that keep a local-first Kakeibo application maintainable.

## Overview

The application is a client-only React PWA. IndexedDB, accessed through Dexie, is the persistence source of truth. UI state may be held in Zustand only when it is derived, ephemeral, or presentation-specific; it must not become a competing data store.

## Goals

- Isolate business rules from UI and database details.
- Permit feature evolution without cross-cutting coupling.
- Make local persistence reliable and testable.
- Keep components accessible, composable, and small.

## Responsibilities

Layers have one direction of dependency: presentation depends on application contracts; application depends on domain contracts; infrastructure implements persistence and platform contracts. Domain logic depends on no framework.

## Functional Requirements

- Routes map to feature entry points and remain independently loadable.
- Features perform user workflows through application services/use cases.
- Repositories abstract Dexie queries and writes.
- Domain policies calculate budget totals and enforce business invariants.
- Shared UI contains only reusable, domain-neutral primitives and patterns.

## User Stories

As an engineer, I can change transaction storage without rewriting dashboards. As a designer, I can alter a workflow without embedding finance calculations in components. As a tester, I can verify budgeting rules without a browser database.

## Technical Design

Use a feature-first organization. Within each feature, separate `domain`, `application`, `infrastructure`, and `presentation` concerns when complexity warrants it. Shared kernel types are limited to stable primitives such as IDs, money, result states, dates, and common UI contracts. Features communicate through explicit application-level interfaces, not direct imports of another feature’s database tables. Barrel exports expose intentional public APIs; internal files are not imported across feature boundaries.

Application state separates persisted state from transient state. Dexie-backed queries are rehydrated from IndexedDB and reactively refreshed after mutations. Zustand holds navigation preferences, open dialogs, selected filters, and similar non-authoritative state. React Hook Form owns draft form state. Route parameters identify durable navigation state.

## UI Considerations

Route screens compose feature UI and shared primitives. Business calculations are never performed inline in JSX. Loading placeholders, empty states, and error boundaries are designed per route.

## Data Model

Persistence schemas and repository interfaces are defined in `data-model.md`. UI receives domain records or explicit view models, never raw Dexie table objects.

## Validation

Validate at the form boundary, at application use-case boundary, and at database import boundary. Each layer protects its own invariant without duplicating presentation messages.

## Error Handling

Use typed, expected failure outcomes for validation, conflicts, unsupported backups, and missing records. Unexpected failures are logged locally where useful and presented with a recovery action; no sensitive data is sent externally.

## Edge Cases

- A deleted record is targeted by a stale route or dialog.
- IndexedDB is unavailable, blocked, or storage quota is exhausted.
- Schema upgrade is interrupted by app closure.
- UI state references an archived or removed month.

## Acceptance Criteria

- Domain calculations can be unit-tested without React, Dexie, or browser APIs.
- Persistence changes are isolated behind repository contracts.
- No feature accesses another feature’s persistence implementation directly.
- No authoritative financial value exists only in Zustand.

## Future Improvements

Introduce a lightweight event boundary for cross-feature refreshes and a formal ADR directory when feature interactions increase.

## Developer Notes

Favor simple composition. Do not introduce generic abstractions before at least two stable consumers need them. Strict TypeScript is required; avoid `any` and unsafe type assertions.
