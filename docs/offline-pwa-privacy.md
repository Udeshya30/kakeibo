# Offline, PWA, Privacy, and Data Portability

## Purpose

Define how Kakeibo remains useful without connectivity while respecting that all financial information is private and local.

## Overview

Kakeibo has no backend and no authentication. The installed PWA shell and all essential assets are available offline after installation or a successful initial load. User records live only in IndexedDB for that browser origin.

## Goals

- Ensure core workflows are network-independent.
- Make installation and update behavior predictable.
- Protect privacy by default through data minimization.
- Give users meaningful control over export and deletion.

## Responsibilities

The PWA layer owns application-shell caching, update prompts, install affordances, offline messaging, and cache lifecycle. Data management owns export/import/deletion. Neither may transmit financial data.

## Functional Requirements

- Provide manifest metadata, icons, and an installable application shell.
- Cache static application assets for offline startup.
- Keep all create/read/update/delete workflows available offline.
- Inform users when an update is ready and allow a safe reload at their chosen time.
- Export user data without a network request.
- Provide a deliberate, confirmed option to delete all local data.

## User Stories

As a commuter, I can add an expense without signal. As a privacy-conscious user, I know my data is not uploaded. As an installer, I can update the app without losing my local budget.

## Technical Design

Use an app-shell caching strategy for hashed build assets and a conservative update strategy that avoids replacing the active shell mid-edit. The service worker must not cache backup files or user financial records. IndexedDB is accessed directly by the application and is independent of Cache Storage. Online status is advisory only; application workflows must not wait for it. Manifest design identifies Kakeibo clearly in app launchers and supports standalone display.

## UI Considerations

Offline should be treated as normal operation, not a warning. Installation is offered contextually and never blocks budgeting. Update notices state that local data remains on the device; defer reload while a form has unsaved edits. Settings explain that clearing browser data can remove the app’s records and recommends exporting backups.

## Data Model

No server-side identity, telemetry profile, or remote replica exists. Backup format and local entities are described in `data-model.md`.

## Validation

Validate imported files locally before any record changes. Validate service-worker update state and installed-app capability defensively because browser support differs.

## Error Handling

If installation is unavailable, retain normal browser use. If storage fails, prevent false success and direct users to export available data or free space. If a stale shell is detected, provide a controlled refresh prompt.

## Edge Cases

- First visit without connectivity cannot load an uncached application shell.
- Browser clears site data, private mode blocks storage, or quota is reached.
- User has two tabs open during an update.
- A backup download is cancelled or file access is denied.

## Acceptance Criteria

- After a successful load, all core routes and record workflows operate with network disabled.
- No request sends financial records to a remote endpoint.
- Updates do not silently discard in-progress form entries.
- The user can export before destructive local-data actions.

## Future Improvements

Offline onboarding bundle, optional local encryption using a user-held passphrase, and more detailed storage diagnostics.

## Developer Notes

PWA behavior must be manually tested in production-like builds, not only the development server. Treat cache upgrades as data-safety work.
