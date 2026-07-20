# Data Management

Kakeibo stores all data locally using IndexedDB. The Data Management screen allows you to:

- Export a JSON backup of all local records.
- Import a previously exported JSON backup (this replaces local data).

When importing a backup the app shows a preview summary of record counts and requires explicit confirmation before replacing local data.

Backups are compatible only with the same application version format. Exports include app settings, budget months, plans, transactions, reviews, and metadata.
