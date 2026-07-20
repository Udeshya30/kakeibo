# Validation and Error Handling

## Purpose

Set a consistent contract for data validity, user feedback, recovery, and failure classification.

## Overview

Validation protects user intent at the form boundary and protects data integrity at application and persistence boundaries. Errors are clear, local where possible, and never erase a user’s valid draft.

## Goals

- Prevent corrupt or ambiguous financial data.
- Give users immediate, accessible correction guidance.
- Distinguish expected validation from unexpected system failure.
- Keep failure behavior consistent across features.

## Responsibilities

Zod schemas define input parsing contracts. Domain policies enforce business invariants. Repositories protect persistence integrity. Presentation maps typed outcomes to accessible messages and recovery actions.

## Functional Requirements

- Validate required fields, supported values, dates, and monetary inputs before mutation.
- Normalize user-entered money without floating-point loss.
- Validate backups fully before import changes begin.
- Confirm irreversible actions.
- Preserve field values after a failed submission whenever safe.

## User Stories

As a user, I can understand why an amount was rejected. As a user, I do not lose a note because saving failed. As a user, I am warned before deleting a month and its transactions.

## Technical Design

Validation occurs in three stages: form parsing for user feedback; use-case validation for invariant enforcement; persistence/import validation for untrusted stored or file data. Typed error categories include validation, not found, conflict, storage unavailable, storage quota, import format, import version, and unexpected failure. Monetary input accepts locale-appropriate presentation but is converted to integer minor units before domain use.

## UI Considerations

Show field error text adjacent to the control and associate it programmatically. Use an error summary for multi-field forms. Use non-modal status messaging for successful saves and recoverable operation failures; dialogs are reserved for consequential confirmation. Do not expose technical stack traces.

## Data Model

Validated values conform to the entity constraints in `data-model.md`; invalid drafts are transient UI state and are not persisted.

## Validation

Budget month calendar key is unique. Amounts are positive for transactions, planned amounts are zero or positive, notes have a documented length limit, and reviews accept only defined question fields. IDs, enum values, and ISO dates are checked at all trust boundaries.

## Error Handling

Expected errors provide corrective action. Missing records return users to a valid screen. Storage failures leave authoritative data unchanged whenever possible. Unexpected errors are contained by route-level error boundaries with a retry and safe navigation option.

## Edge Cases

- Decimal separators differ by locale.
- Extremely large but syntactically valid input exceeds safe integer range.
- A record is deleted in another open tab before save.
- Import contains valid records plus one invalid record.
- A disabled submit button would otherwise hide why input is invalid.

## Acceptance Criteria

- No invalid record reaches IndexedDB through normal UI flows.
- Every user-correctable failure states how to proceed.
- Failed operations do not falsely report success or silently discard drafts.
- Import failure leaves existing data intact.

## Future Improvements

Add richer duplicate-resolution flows and user-selectable currency input conventions if multi-currency support is added.

## Developer Notes

Keep schemas near their feature contracts and reuse them across UI and application boundaries where semantics are identical. Do not use generic catch-all messages for known failures.
