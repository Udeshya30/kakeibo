# Kakeibo Documentation

## Purpose

Provide the authoritative planning and architecture reference for Kakeibo before implementation begins.

## Overview

Kakeibo is a private, offline-first progressive web application for intentional household budgeting using the Japanese Kakeibo method. All information remains on the device; IndexedDB is the system of record.

## Goals

- Make spending reflection quick, calm, and understandable.
- Be installable and fully usable without a network connection.
- Preserve data locally with predictable recovery and export options.
- Establish maintainable feature boundaries before code is introduced.

## Responsibilities

This index directs contributors to the documents that define product behavior, architecture, data, UX, offline behavior, and quality expectations.

## Functional Requirements

The documentation set covers monthly planning, transaction recording, categorisation, insights, review, local data management, and application shell behavior.

## User Stories

As a contributor, I can find the contract for a product area before changing it. As a user, I benefit from consistent behavior across every screen.

## Technical Design

Documents are arranged by concern. Product and domain documents define what and why; architecture and data documents define boundaries and contracts; UX and quality documents define experience and verification.

## UI Considerations

Consult `ux-accessibility.md` for interaction, responsive, visual, and assistive-technology requirements.

## Data Model

Consult `data-model.md` for entities, relationships, ownership, retention, export, and migration policy.

## Validation

Consult `validation-error-handling.md` for input rules and user-facing recovery behavior.

## Error Handling

Documentation conflicts are resolved by this precedence: explicit product requirements, domain rules, data contracts, then UI conventions. Record material decisions as ADRs.

## Edge Cases

If a proposed feature is not represented here, document its impact on all affected concerns before implementing it.

## Acceptance Criteria

- Every project decision has an appropriate home in this folder.
- No document prescribes framework implementation code.
- Documents can be used independently by product, design, and engineering roles.

## Future Improvements

Add decision records, release notes, and research artifacts as the project matures.

## Developer Notes

Read `architecture.md`, `product-requirements.md`, and `data-model.md` before implementation. Update affected documents in the same change as any approved behavior change.

## Document Map

- [Product requirements](product-requirements.md)
- [Architecture](architecture.md)
- [Domain and budgeting rules](domain-model.md)
- [Data model and local persistence](data-model.md)
- [Dexie database design](dexie-database-design.md)
- [Zustand state architecture](zustand-state-architecture.md)
- [React component hierarchy](react-component-hierarchy.md)
- [UX and accessibility](ux-accessibility.md)
- [Design system](design-system.md)
- [Offline, PWA, privacy, and data portability](offline-pwa-privacy.md)
- [Validation and error handling](validation-error-handling.md)
- [Quality and testing strategy](quality-testing.md)
- [Delivery and operational guidance](delivery-operations.md)
- [Delivery milestones](delivery-milestones.md)
