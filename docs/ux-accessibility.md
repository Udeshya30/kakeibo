# UX and Accessibility

## Purpose

Define the experience principles, information architecture, responsive behavior, and accessibility baseline for Kakeibo.

## Overview

The interface should feel focused and reassuring: a monthly dashboard answers “where am I?”, quick entry answers “what did I spend?”, and review answers “what will I change?”

## Goals

- Make common actions fast on a phone and comfortable on larger screens.
- Reduce financial anxiety through clear, non-judgmental language.
- Meet WCAG 2.2 AA intent for core workflows.
- Support keyboard, screen-reader, reduced-motion, and high-contrast needs.

## Responsibilities

UX defines screen hierarchy, content behavior, interaction feedback, and accessible semantics. It does not redefine domain calculations or persistence rules.

## Functional Requirements

- Provide routes for dashboard, transactions, monthly plan, insights, review, and settings/data management.
- Give a persistent way to add a transaction from primary financial screens.
- Offer filter and search controls for transaction history.
- Give every chart an equivalent textual summary or data table.
- Support keyboard operation for all controls and dialogs.

## User Stories

As a phone user, I can enter spending without horizontal scrolling. As a screen-reader user, I can understand my monthly status and complete a transaction. As a user sensitive to motion, I can use the app without distracting animation.

## Technical Design

Use semantic landmarks, native controls where practical, explicit form labels, visible focus indicators, logical heading order, and accessible dialog focus management. Reusable primitives provide consistent buttons, inputs, field messages, dialogs, status messages, empty states, and currency formatting. Framer Motion is decorative only, honors reduced-motion preference, and never gates interaction.

## UI Considerations

The dashboard prioritizes month selector, planned/actual summary, category progress, recent activity, and add action. Amounts use tabular numerals where available and locale-aware formatting. Category identity uses a label, icon, and color—not color alone. Negative or over-limit states include words and an icon. Touch targets are comfortably sized. Responsive layout moves from a single-column task flow to a multi-column overview without hiding capabilities.

## Data Model

Display models are derived from domain records. User preferences may store locale/display choices but must not alter financial history or calculation meaning.

## Validation

Errors appear inline after an attempted submission and are announced accessibly. Summaries link or direct focus to invalid fields. Validation never relies on a placeholder as the only label.

## Error Handling

Use clear recovery-focused messages: what happened, what is retained, and what the user can do next. Network-style wording is avoided when the relevant issue is local storage or file access.

## Edge Cases

- Very long notes and localized currency names.
- Empty month, no transactions, and all-zero plan.
- Large text settings and narrow viewports.
- Keyboard focus after deleting a list item or closing a dialog.
- Chart data with one category or no data.

## Acceptance Criteria

- Core tasks work at 320 CSS pixels and at desktop widths.
- No essential status is conveyed by color, animation, or charts alone.
- Every interactive element has an accessible name and visible focus state.
- Forms, dialogs, and navigation are usable by keyboard alone.

## Future Improvements

User-selectable density, localization, guided onboarding, and accessible printable month summaries.

## Developer Notes

Test with real keyboard navigation and at least one screen reader before declaring a workflow complete. Keep UX copy concise, calm, and specific.
