# Domain and Budgeting Rules

## Purpose

Define Kakeibo concepts and calculation rules independently of screens, storage, and libraries.

## Overview

Kakeibo organizes a calendar month around income, fixed commitments, desired savings, discretionary spending, four expense categories, and an end-of-month reflection.

## Goals

- Express calculations consistently across planning, dashboard, and review.
- Preserve a simple monthly budgeting mental model.
- Make assumptions visible rather than hiding them in UI.

## Responsibilities

The domain determines categorisation, month ownership, monetary arithmetic, plan metrics, actuals, and review status. It does not determine UI wording, database indexing, or chart selection.

## Functional Requirements

- A budget month is identified by a calendar year and month in the user’s configured locale/time zone policy.
- Expenses belong to exactly one Kakeibo category: Needs, Wants, Culture, or Unexpected.
- Income increases planned or actual available funds; expense decreases actual remaining funds.
- Fixed commitments are planned obligations kept distinct from discretionary categories.
- Savings target is a planned allocation, not an expense transaction by default.
- Available planned spending equals planned income minus planned fixed commitments minus savings target.
- Actual discretionary spend is the sum of expense transactions in the four categories.
- Actual remaining funds equals actual income minus actual expenses; the UI must label this clearly to avoid implying a bank balance.

## User Stories

As a budgeter, I can distinguish necessities from wants. As a budgeter, I can set aside a savings goal before evaluating flexible spending. As a budgeter, I can see whether a category limit is exceeded.

## Technical Design

Represent money as integer minor units with an ISO currency code, never floating-point currency. Calculate totals from records at read time or through explicitly invalidated derived views; never persist a silently stale aggregate as authority. Date interpretation uses a documented local calendar-month policy. Category limits are optional and do not prohibit recording overspending.

## UI Considerations

Use plain category names with short explanations. Distinguish “planned,” “spent,” and “remaining” visually and textually. Any negative value communicates the condition without relying only on color.

## Data Model

The aggregate root for planning is Budget Month; transactions and one review belong to it. The plan is a one-to-one value record for a budget month. See `data-model.md`.

## Validation

Only valid calendar dates and supported currencies are accepted. Transaction amount must be greater than zero. A transaction type must be income or expense; only expenses require a Kakeibo category.

## Error Handling

An impossible category/type combination, missing month, or currency mismatch is a rejected domain operation with an actionable message at the application layer.

## Edge Cases

- Leap years and month boundaries.
- Refunds: record as income or a signed adjustment only if the product later formally supports it; core scope uses a clearly named income transaction.
- Overspending and negative remaining amounts are valid results, not errors.
- Multiple currencies are not combined in totals; core scope uses one configured base currency.

## Acceptance Criteria

- Identical records always produce identical totals regardless of screen.
- A transaction has one unambiguous owner month.
- Calculation behavior is documented before it is reused in charts or summaries.

## Future Improvements

Support formal refunds, transfers, rollover policy, multiple currencies with explicit conversion policy, and custom category taxonomies only through new domain decisions.

## Developer Notes

Do not reinterpret Kakeibo categories as accounting accounts. Keep category labels stable for historical insight continuity.
