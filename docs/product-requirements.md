# Product Requirements

## Purpose

Define the user problem, product boundaries, and observable behavior for Kakeibo.

## Overview

Kakeibo helps an individual plan a month, record income and spending, classify spending into four reflective categories, and review the month through guided questions and clear totals.

## Goals

- Encourage deliberate spending rather than exhaustive accounting.
- Reduce the effort of daily entry.
- Make monthly progress legible at a glance.
- Keep the product entirely personal and local.

## Responsibilities

The product provides budgeting workflows, local data control, and understandable insights. It does not provide bank sync, collaboration, accounts, cloud storage, tax advice, investment advice, or multi-user features.

## Functional Requirements

- Create, select, edit, archive, and reopen monthly budgets.
- Record income and expenses for a selected month.
- Assign expenses to Needs, Wants, Culture, or Unexpected.
- Define planned income, fixed commitments, savings target, and optional category limits.
- Show available-to-spend, actual spending, planned-versus-actual values, and category distribution.
- Support transaction search, filtering, editing, and deletion with confirmation.
- Capture a monthly review containing reflection answers and an optional next-month intention.
- Export all local data and import a compatible backup after explicit confirmation.
- Offer settings for currency, locale-sensitive display preferences, and data management.

## User Stories

- As a budgeter, I can create this month’s budget so I know my intended limits.
- As a budgeter, I can add an expense in seconds so my record stays current.
- As a budgeter, I can see how spending maps to Kakeibo categories so I can reflect on habits.
- As a budgeter, I can review a completed month so I can make a better plan next month.
- As a budgeter, I can export my data so I retain ownership of it.

## Technical Design

Requirements are organized as independent features: onboarding/settings, months, planning, transactions, dashboard/insights, review, and data management. Each feature owns its presentation, application behavior, domain rules, and persistence boundary.

## UI Considerations

The primary action on small screens is adding a transaction. Dense financial tables must have a mobile alternative. Empty states explain the next useful action; charts never carry essential meaning alone.

## Data Model

The main records are budget months, plan values, transactions, reviews, application settings, and backup metadata. See `data-model.md`.

## Validation

Amounts must be non-negative monetary values within supported precision. Expense categories are required. Dates must be valid and belong to the active budgeting month unless the user deliberately changes the month.

## Error Handling

Invalid fields identify the problem next to the relevant control. Failed local operations preserve form input and offer retry. Destructive actions require confirmation and explain impact.

## Edge Cases

- A month has no income but has expenses.
- Fixed commitments exceed planned income.
- A transaction is entered for a past or future month.
- An archived month is viewed without being accidentally modified.
- Imported data conflicts with existing local records.

## Acceptance Criteria

- A first-time user can plan, record spending, and complete a monthly review without an account or connection.
- All totals derive from locally stored records.
- Every required workflow has a clear empty, loading, success, and recoverable-failure state.

## Future Improvements

Recurring transaction templates, custom categories, receipt attachments stored locally, configurable fiscal start day, and optional encrypted backups may be considered after the core workflow is stable.

## Developer Notes

Avoid scope drift toward a general ledger. Kakeibo’s value is reflection around four categories and monthly intention, not complexity.
