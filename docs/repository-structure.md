# Repository Structure

## Purpose

Define the complete pre-implementation repository topology for Kakeibo. The directory markers in `src/`, `public/`, and `tests/` intentionally contain no executable code.

## Overview

The repository uses feature-first organisation. Each bounded context may contain clean-architecture layers where that separation has real value. Cross-cutting, stable code is held in `shared`; application composition belongs in `app`.

## Goals

- Keep feature ownership evident from the path.
- Prevent React, Dexie, and browser APIs from leaking into domain code.
- Avoid both a global “components” dumping ground and premature layer boilerplate.
- Reserve clear homes for offline, persistence, accessibility, testing, and data management.

## Responsibilities

`app` composes the product; `features` owns user-facing bounded contexts; `shared` holds small stable cross-cutting contracts and primitives; `public` holds static PWA assets; `tests` holds non-colocated test support.

## Functional Requirements

The structure must accommodate planning, transaction capture, reporting, reviews, preferences, import/export, Dexie persistence, PWA behavior, and accessible reusable UI without direct feature-to-feature persistence access.

## User Stories

As a contributor, I can find a business rule in its feature domain folder, an interaction in presentation, and a browser/database adapter in infrastructure. As a reviewer, I can identify an invalid dependency from its import path.

## Technical Design

The intended dependency direction is `presentation → application → domain`; `infrastructure` implements ports declared by application/domain and is wired by `app`. Reporting consumes published application read-model contracts rather than another feature’s database tables. `shared` may not depend on `features` or `app`.

## UI Considerations

Feature-specific components remain within their feature presentation folders. Only durable, domain-neutral primitives graduate to `shared/ui`. Global visual tokens and resets belong in `app/styles`; feature styles remain colocated with eventual presentation files.

## Data Model

The database schema, migrations, and Dexie lifecycle are central infrastructure. Feature repositories remain feature-owned adapters over the central database. See `data-model.md` for record contracts.

## Validation

Input schemas belong with the feature application contract; domain invariants belong in feature domain folders. Imported-file validation belongs to data management and must run before persistence mutation.

## Error Handling

Shared result/error primitives are intentionally small. Feature application layers map domain or persistence failures to workflow outcomes; presentation maps those outcomes to accessible feedback.

## Edge Cases

Do not create a new shared folder merely to avoid a relative import. First identify whether the code is feature-owned, an app composition concern, or a stable cross-cutting primitive.

## Acceptance Criteria

- All listed directories exist in the repository.
- Every empty leaf directory contains a `.gitkeep` marker.
- No React component, TypeScript implementation, CSS/SCSS, or feature behavior is created by this scaffold.
- The topology supports the approved feature boundaries and dependency direction.

## Future Improvements

Add a formal architecture-test rule set once module aliases and build tooling are introduced. Add end-to-end test folders only when an approved runner is selected.

## Developer Notes

`.gitkeep` files are structural markers only and must be removed when their directory gains a real tracked file. Tooling configuration files are intentionally deferred: adding Vite, TypeScript, linting, and test configuration is implementation/bootstrap work, not part of this structure-only task.

## Root Files

| Path | Why it exists |
| --- | --- |
| `.editorconfig` | Keeps basic whitespace and encoding conventions consistent across editors. |
| `.gitignore` | Prevents generated dependencies, builds, coverage, local settings, and OS artifacts from entering source control. |
| `docs/` | Holds the product and architecture source of truth. |
| `public/` | Reserves browser-served static assets, including future PWA icons. |
| `src/` | Reserves all application source by ownership boundary. |
| `tests/` | Reserves shared test helpers and fixtures that do not belong beside one feature. |

## Directory Map

| Path | Why it exists |
| --- | --- |
| `src/app/providers` | Application-wide provider composition, introduced only when required. |
| `src/app/router` | Route definitions, route guards, and route-level error handling composition. |
| `src/app/styles` | Global tokens, resets, and accessibility-wide styling foundations. |
| `src/shared/domain` | Stable value objects such as money, identifiers, date-period primitives, and typed results. |
| `src/shared/application` | Stable cross-feature application contracts; it must stay deliberately small. |
| `src/shared/infrastructure/database` | Dexie database lifecycle, schema versions, migrations, and transaction support. |
| `src/shared/infrastructure/platform` | Browser capability adapters such as storage, install, and cross-tab coordination. |
| `src/shared/lib` | Framework-agnostic utility functions with no business ownership. |
| `src/shared/ui` | Reusable, accessible, domain-neutral UI primitives. |
| `src/shared/hooks` | Reusable framework hooks that are not feature-specific. |
| `src/shared/types` | Shared non-domain TypeScript contracts, used sparingly. |
| `src/shared/constants` | Stable cross-cutting constants that are not domain policy. |
| `src/features/budgeting/domain` | Budget-month aggregate, plan, transaction rules, and Kakeibo category policy. |
| `src/features/budgeting/application` | Budget planning and transaction use cases, ports, input/output contracts, and validation. |
| `src/features/budgeting/infrastructure` | Budgeting repository adapters over the central database. |
| `src/features/budgeting/presentation/components` | Budgeting-only visual compositions. |
| `src/features/budgeting/presentation/hooks` | Budgeting-only UI orchestration hooks. |
| `src/features/budgeting/presentation/routes` | Route entry points for monthly planning and transaction workflows. |
| `src/features/reporting/application` | Read-model use cases for dashboard and insights; it does not own financial records. |
| `src/features/reporting/infrastructure` | Reporting query adapters and projections. |
| `src/features/reporting/presentation/components` | Reporting-specific summaries, tables, and chart wrappers. |
| `src/features/reporting/presentation/hooks` | Reporting interaction and filter hooks. |
| `src/features/reporting/presentation/routes` | Dashboard and insights route entry points. |
| `src/features/review/domain` | Monthly reflection concepts and completion rules. |
| `src/features/review/application` | Review use cases, contracts, and validation. |
| `src/features/review/infrastructure` | Review persistence adapter. |
| `src/features/review/presentation/components` | Review-specific interface compositions. |
| `src/features/review/presentation/hooks` | Review UI orchestration hooks. |
| `src/features/review/presentation/routes` | Monthly review route entry point. |
| `src/features/preferences/application` | Settings workflows and preference contracts. |
| `src/features/preferences/infrastructure` | Local preference persistence adapter. |
| `src/features/preferences/presentation/components` | Settings-specific interface compositions. |
| `src/features/preferences/presentation/hooks` | Settings UI orchestration hooks. |
| `src/features/preferences/presentation/routes` | Settings route entry point. |
| `src/features/data-management/application` | Backup export, import, reset, and compatibility workflows. |
| `src/features/data-management/infrastructure` | File and database adapters for local data portability. |
| `src/features/data-management/presentation/components` | Data-management confirmations and status UI. |
| `src/features/data-management/presentation/hooks` | Local file-operation UI hooks. |
| `src/features/data-management/presentation/routes` | Data-management route entry point. |
| `src/features/pwa/application` | PWA update/install workflow contracts. |
| `src/features/pwa/infrastructure` | Service-worker and browser-install adapters. |
| `src/features/pwa/presentation/components` | Install and safe-update notices. |
| `src/features/pwa/presentation/hooks` | PWA state hooks. |
| `src/test/factories` | Reusable valid domain-record builders for tests. |
| `src/test/helpers` | Test render, database, and accessibility helpers. |
| `src/test/fixtures` | Versioned representative data sets, including migration and backup inputs. |
| `tests/manual` | Repeatable manual production-build checks for offline, install, and accessibility behavior. |
| `public/icons` | Future manifest and launcher icon assets. |

## Placeholder Files

Every `.gitkeep` below exists solely to retain an intentionally empty leaf directory in version control. It is not application code and should be deleted as soon as the first real file is added to that directory.
