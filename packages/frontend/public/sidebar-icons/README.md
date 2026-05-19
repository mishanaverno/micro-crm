Flaticon sidebar assets live in this folder.

The `*.png` files are the downloaded source icons. Matching `*.svg` files are traced
vector versions generated from those PNGs.

Expected filenames:

- `dashboard.svg`
- `clients.svg`
- `notes.svg`
- `tasks.svg`
- `reminders.svg`
- `orders.svg`
- `finances.svg`
- `events-log.svg`

The sidebar uses these public paths directly, for example:

```text
/sidebar-icons/dashboard.svg
```

If an icon is missing or fails to load, the sidebar falls back to the previous text symbol.

Current sidebar aliases:

- `dashboard.svg` is copied from `006-dashboard.svg`
- `clients.svg` is copied from `007-users.svg`
- `notes.svg` is copied from `002-sticky-note.svg`
- `tasks.svg` is copied from `001-checklist.svg`
- `reminders.svg` is copied from `003-google-calendar.svg`
- `orders.svg` is copied from `004-order.svg`
- `finances.svg` is copied from `008-growth.svg`
- `events-log.svg` is copied from `009-commit-git.svg`
