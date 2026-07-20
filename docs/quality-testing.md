# Quality and Testing Strategy

## Purpose

Define the quality gates that make Kakeibo safe to evolve as a local financial application.

## Overview

Testing focuses on high-value budgeting rules, persistence safety, accessible user workflows, and offline/PWA behavior. Tooling includes Vitest and React Testing Library.

## Goals

- Catch financial calculation and data-loss regressions early.
- Verify user-visible behavior instead of component internals.
- Preserve accessibility and responsive intent.
- Keep feedback fast enough for regular development.

## Responsibilities

Domain tests verify pure rules. Repository tests verify migrations, indexes, transactions, import/export, and failures against an isolated IndexedDB environment. Feature tests verify rendered workflows. Manual production-build checks verify PWA installation and offline behavior.

## Functional Requirements

- Test all money calculations, category aggregation, and month boundary rules.
- Test create/edit/delete transaction workflows and plan changes.
- Test invalid form behavior and accessible error announcements.
- Test backup validation and atomic import semantics.
- Test key empty, loading, error, and archived-month states.

## User Stories

As a user, I can trust displayed totals after an update. As a contributor, I receive a focused failure when changing a business rule. As a keyboard user, I remain able to finish core workflows after UI changes.

## Technical Design

Use unit tests for domain services and parsers; integration tests for repositories with isolated databases; component/feature tests through user interactions and accessible queries. Mock only external platform boundaries, not business behavior. Maintain a small suite of representative fixtures: empty month, planned month, overspent month, completed review, and malformed backup.

## UI Considerations

Tests query by role, label, and visible text first. They assert focus movement for dialogs and error flows, and verify text alternatives for charts. Visual review is required for responsive layouts and reduced-motion states.

## Data Model

Fixtures mirror versioned domain records and must not bypass validation except in tests specifically covering corrupt persisted data.

## Validation

Test validation at field, use-case, and import boundaries, including localized monetary parsing, unsupported enums, malformed dates, and safe-integer limits.

## Error Handling

Test failed writes, quota-like failures, stale identifiers, and invalid imports. Assertions verify both user messaging and that existing persisted data remains correct.

## Edge Cases

- Month transitions, leap day, and time-zone-adjacent dates.
- Zero plan values, no transactions, and overspending.
- Screen reader labels for icon-only actions.
- Two operations targeting the same record.

## Acceptance Criteria

- Core domain rules have deterministic automated coverage.
- Critical financial mutations and import flows have integration coverage.
- Core user workflows have accessible interaction tests.
- Offline, install, and update behavior are manually checked in a production build before release.

## Future Improvements

Add automated accessibility scanning, visual regression tests, browser-device matrix testing, and migration compatibility fixtures for every released schema.

## Developer Notes

Tests should describe behavior in domain language. Prefer a few durable workflow tests over brittle tests tied to implementation structure.
