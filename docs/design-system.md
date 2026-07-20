# Kakeibo Design System

## Purpose

Define a calm, clear, accessible visual and interaction language for Kakeibo. This document is the source of truth for design decisions before tokens or components are implemented.

## Design Principles

- **Quiet confidence:** financial information should feel understandable, never alarming or ornamental.
- **Intent before detail:** surface the current month’s decision-relevant status first; reveal dense history on request.
- **Meaning beyond color:** status and category identity always combine text, iconography, and color.
- **Comfortable precision:** values, dates, and forms must be easy to scan and difficult to misread.
- **Accessible by default:** keyboard, screen reader, zoom, reduced-motion, and contrast requirements are component requirements, not a later pass.

## Foundations

### Colors

Use semantic roles rather than direct color names in components. The palette is deliberately restrained: warm neutral surfaces, a deep ink for reading, a composed teal primary, and distinct but muted category hues.

| Token role | Value | Use |
| --- | --- | --- |
| Canvas | `#F7F7F4` | Application background. |
| Surface | `#FFFFFF` | Cards, dialogs, elevated controls. |
| Surface subtle | `#F0F1ED` | Recessed areas, table headers, inactive controls. |
| Surface selected | `#E8F3F0` | Selected navigation and gentle emphasis. |
| Ink strong | `#1D2523` | Primary text and high-emphasis icons. |
| Ink | `#3D4945` | Standard body text. |
| Ink muted | `#66716D` | Supporting text; never the only carrier of important information. |
| Border | `#D9DEDA` | Default boundaries and dividers. |
| Border strong | `#AEB8B3` | Focus-adjacent and stronger separation. |
| Primary | `#176B5D` | Primary actions and active controls. |
| Primary hover | `#115447` | Pointer/keyboard hover state. |
| Primary pressed | `#0B4036` | Pressed state. |
| Primary subtle | `#D9EEE9` | Quiet primary backgrounds. |
| Success | `#237A4B` | Completed/safe outcomes. |
| Warning | `#9A6408` | Caution requiring attention. |
| Danger | `#B33A32` | Destructive actions and errors. |
| Info | `#2C6598` | Neutral informative status. |
| Focus ring | `#165DFF` | Visible keyboard focus indicator. |

Kakeibo category colors are identity accents, not status colors:

| Category | Accent | Subtle surface | Required text label |
| --- | --- | --- | --- |
| Needs | `#337A67` | `#E2F0EA` | Needs |
| Wants | `#B36377` | `#F8E8ED` | Wants |
| Culture | `#7560A8` | `#EEEAF8` | Culture |
| Unexpected | `#B47727` | `#F8EEDC` | Unexpected |

All implemented foreground/background pairings must meet WCAG 2.2 AA contrast: at least 4.5:1 for normal text and 3:1 for large text, graphical objects, control boundaries, and focus indicators. Never use category accent text on a pale surface without verifying contrast; use strong ink where needed.

### Typography

Use a system sans-serif stack for fast offline availability and native readability. Do not depend on remotely hosted fonts. Numerals should use tabular figures in monetary, percentage, date, and table contexts.

| Style | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Display | 32 / 40 | 650–700 | Dashboard’s primary monthly figure, used sparingly. |
| Heading 1 | 28 / 36 | 650–700 | Route title. |
| Heading 2 | 22 / 30 | 650–700 | Major section heading. |
| Heading 3 | 18 / 26 | 600–650 | Card and subsection heading. |
| Body | 16 / 24 | 400–450 | Default readable content. |
| Body compact | 14 / 20 | 400–500 | Dense supporting content. |
| Label | 14 / 20 | 600 | Form labels and compact navigation. |
| Caption | 12 / 16 | 500–600 | Non-essential metadata only. |

Do not use text smaller than 12 px. Headings follow semantic document order, never visual size alone. Currency values stay together without line breaks where practical; use locale-aware formatting and announce the currency in accessible names where ambiguity is possible.

### Spacing

Use a 4 px base unit. The canonical spacing scale is 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, and 80 px. Use 8–16 px for compact control gaps, 16–24 px for component padding, 24–40 px between sections, and 40–64 px between page regions. Avoid arbitrary one-off spacing values.

The minimum interactive target is 44 × 44 CSS px. On compact layouts, page gutters are 16 px; on medium screens, 24 px; on wide screens, content is constrained to a readable maximum width rather than stretched edge-to-edge.

### Border Radius

| Token | Radius | Use |
| --- | --- | --- |
| None | 0 | Tables and intentionally square visual dividers. |
| Small | 6 px | Inputs, compact buttons, chips. |
| Medium | 10 px | Cards, standard buttons, alerts. |
| Large | 16 px | Dialogs, prominent summary surfaces. |
| Pill | 999 px | Badges, compact status pills, avatars if introduced. |

### Shadows and Elevation

Elevation communicates temporary layering, never importance of financial values. Prefer borders and tonal surfaces for ordinary cards; use shadows sparingly.

| Level | Shadow intent | Use |
| --- | --- | --- |
| 0 | No shadow; optional border | Canvas, ordinary content sections. |
| 1 | Soft, short shadow | Hovered card or sticky secondary surface. |
| 2 | Noticeable diffuse shadow | Popover, floating action area. |
| 3 | Strongest permitted shadow | Modal dialog only. |

Shadows must be neutral and low-opacity. Focus is always shown by a focus ring, not an elevation change alone. Avoid stacked elevated cards, which creates visual noise.

## Components

### Buttons

Buttons use a clear verb and represent an immediate action. Use a link when navigation is the only outcome.

| Variant | Use | Constraints |
| --- | --- | --- |
| Primary | One dominant action in a local context, such as Save transaction. | Never place multiple competing primary actions in one action group. |
| Secondary | Important alternative action. | Surface or outlined treatment; remains clearly interactive. |
| Tertiary / ghost | Low-emphasis contextual action. | Requires visible hover and focus affordance. |
| Destructive | Confirmed irreversible action. | Use only after context/confirmation where the impact is material. |
| Icon | Compact familiar action. | Requires accessible name and tooltip on pointer-capable devices. |

All variants have default, hover, focus-visible, pressed, disabled, and loading states. A loading button retains its label or provides an equivalent accessible state, reserves its width, and prevents duplicate submission. Disabled buttons must not be the only explanation of unavailable progress; provide instructions or validation feedback.

### Inputs

Inputs use a visible label, optional concise help text, and an adjacent error message. Placeholder text may illustrate format but never replaces a label. Use native controls where they provide accessible behavior.

Supported foundational patterns are text, monetary amount, date, search, textarea, select/combobox, checkbox, radio group, switch, and segmented choice. Monetary input has a visible currency context, supports locale-aware entry, and avoids relying on spinner controls. Date entry provides a keyboard-usable text format and does not assume every browser’s date picker behaves the same way.

The field container includes label, control, help/error text, and required/optional indicator. Error state uses text, icon, and border change. Validity is announced after user interaction or submission, not noisily on every keystroke.

### Cards

Cards group one coherent purpose: summary, task, recent activity, or explanatory empty state. They use Surface, Medium radius, and usually a Border with elevation 0. Padding is 16 px on compact layouts and 20–24 px when space permits. A card heading is semantic when present. Cards are not generic wrappers; avoid nesting cards unless a dialog contains a clearly separate low-elevation section.

Financial summary cards clearly label metric, time period, and meaning. They never rely on a green/red amount alone to explain positive/negative status.

### Dialogs

Use a modal dialog only for focused creation/editing when a dedicated route is disproportionate, or for consequential confirmation. Do not use dialogs for routine navigation, alerts that can be inline, or long multi-step flows.

Dialogs have an accessible name, optional description, initial focus on the most useful safe element, a visible close action, Escape support unless a dangerous operation is active, focus trapping, and focus return to the trigger. Destructive confirmations state what will be affected and make the destructive verb explicit, for example “Delete 12 transactions.” On small screens, dialogs may become a full-height sheet while preserving semantics.

### Tables

Use tables for comparable transaction history on medium and wide layouts. On narrow screens, use an accessible list or stacked record layout rather than horizontal compression. Data tables have a caption or adjacent heading, semantic headers, sensible column alignment, and a deterministic default sort. Monetary columns are right-aligned; text is left-aligned.

Row actions must be keyboard reachable and have an accessible label that includes the record context. Sorting and filtering expose state in text. Do not make an entire row an unlabeled button. Dense rows preserve a 44 px minimum target for interactive controls.

### Forms

Forms are organized in the order a person thinks: essential fields first, optional details second, actions last. A transaction form prioritizes amount, type, category when required, date, and note. Group related controls with fieldset/legend semantics. Required fields are indicated in text, not only with an asterisk.

Use immediate validation only for clear format problems; show complete validation on submit. When submission fails, show an error summary and move focus to it or the first invalid field. Preserve all valid draft input after failure. Provide save/cancel actions with a clear unsaved-change policy.

### Alerts

Alerts communicate a state that needs attention. Use inline alerts in the relevant context; reserve global banners for conditions that affect the whole application, such as storage unavailability or an update ready to install.

Variants are information, success, warning, and error. Every alert has a text heading or leading sentence, a concise explanation, and an optional action. Color and icon reinforce, never replace, the message. Use assertive live announcements only for urgent errors; routine confirmations use polite status messaging.

### Badges

Badges are compact non-interactive status labels, such as Archived or Review complete. They use pill radius, label text, and sufficient contrast. A badge is not a button, filter, or category selector. Do not use a badge to display an essential long sentence or primary metric.

### Chips and Tags

Use chips for compact, interactive filters or selections and tags for non-interactive metadata. A removable chip includes a separately labeled remove control; its removal changes state immediately and announces the change politely. A category tag combines category name and accent treatment but remains understandable in monochrome. Avoid overusing pills: transaction metadata that is read as prose should remain text.

### Navigation

Navigation reflects task hierarchy, not implementation modules. Primary destinations are Dashboard, Transactions, Plan, Insights, Review, and Settings. On compact screens, use a persistent bottom navigation for the highest-frequency destinations and an accessible “More” path for lower-frequency settings/data management. On wider screens, use a sidebar or top-level navigation with the same labels and order.

The current destination has a text label and an accessible current-page state, plus a visible active treatment that does not rely only on color. The selected month is a separate global context control, not a hidden navigation side effect. Deep links must restore a valid route and clearly handle an unavailable or deleted month.

### Empty States

Empty states distinguish between first use, no results, and unavailable data. Each contains a concise explanation, one relevant next action where appropriate, and optional restrained illustration. Do not show an action for a state the user cannot yet resolve. Examples include: “No expenses this month yet” with Add expense; “No matches” with Clear filters; and storage failure with recovery guidance rather than an optimistic empty state.

### Loading States

For local reads expected to resolve quickly, use lightweight placeholders rather than blocking the whole route. For write operations, preserve context and show progress on the initiating control. Avoid indeterminate full-screen loading after initial application startup. If a loading state lasts long enough to be noticed, explain what is being prepared without implying a network request.

### Skeletons

Skeletons mirror the shape and approximate hierarchy of the content they replace, including heading, total, and row areas. They do not animate when reduced motion is enabled. Skeletons are decorative to assistive technology and must not conceal existing content or delay an already available interaction. Use a static neutral fill or a subtle non-essential shimmer; never use a spinner inside every card.

## Motion Guidelines

Motion supports spatial continuity and feedback, not spectacle. Use a standard duration of 120–180 ms for micro-interactions, 180–240 ms for small surfaces, and at most 300 ms for dialogs or route-level changes. Use ease-out for entrances, ease-in for exits, and avoid elastic or bouncing motion in financial workflows.

Motion is appropriate for dialog appearance, expanding details, list insertion/removal, selected-state feedback, and unobtrusive skeleton shimmer. It is inappropriate for changing money values, error messages, essential status, focus changes, or any action that must be immediately available.

Respect `prefers-reduced-motion`: replace transitions with near-instant state changes; remove shimmer, parallax, auto-animated charts, and nonessential layout movement. Never make completion of an animation a prerequisite for interaction.

## Responsive and Accessibility Baseline

Design starts at 320 CSS px width and expands progressively. Content reflows instead of requiring horizontal page scrolling. Zoom at 200% remains usable. Keyboard focus is visible in every component and is not clipped. Touch and keyboard behavior are equivalent. Icons require a text alternative unless purely decorative. Charts always have a textual summary or table. Error, success, and selected states use semantic text and programmatic state in addition to visual treatment.

## Governance

New components must demonstrate a reusable need across at least two contexts or remain feature-local. Changes to semantic tokens, interaction patterns, or accessibility behavior update this document and require review from design and engineering. Avoid adding visual variants solely to accommodate a single screen; first reconsider composition, content hierarchy, or feature-local styling.

## Developer Notes

This is a specification, not CSS. During implementation, create semantic design tokens rather than copying raw hexadecimal values into components. Verify contrast, focus behavior, keyboard interaction, reduced-motion behavior, and screen-reader announcements with the implemented components.
