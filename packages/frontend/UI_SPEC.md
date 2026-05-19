# UI Specification

This document describes the current visual system used by the frontend. The app follows a restrained shadcn-style light theme: white surfaces, near-black text, muted gray supporting UI, compact typography, and semantic colors only where they carry state.

## Sources

Primary style sources:

- `src/styles.css`: global CSS variables, base body styles, font family.
- `tailwind.config.js`: Tailwind aliases for CSS variables and shared shadows/radii.
- `src/components/ui/*`: base component classes.
- `src/shared/ui/*`: re-exports of the same base components.

## Color Tokens

All main theme colors are CSS variables declared on `:root` in `src/styles.css`. Tailwind exposes them through semantic classes in `tailwind.config.js`.

| Purpose | CSS variable | HSL value | Tailwind classes | Notes |
| --- | --- | --- | --- | --- |
| App background | `--background` | `0 0% 100%` | `bg-background` | Main page background. Applied to `body`. |
| Main text | `--foreground` | `240 10% 3.9%` | `text-foreground`, `bg-foreground` | Primary readable text and inverse dark fills. |
| Card surface | `--card` | `0 0% 100%` | `bg-card`, `text-card-foreground` | Card and dialog surfaces. Often used as `bg-card/80`. |
| Card text | `--card-foreground` | `240 10% 3.9%` | `text-card-foreground` | Text on card backgrounds. |
| Popover surface | `--popover` | `0 0% 100%` | `bg-popover` | Popover/menu semantic surface, though current components mostly use `bg-background`. |
| Popover text | `--popover-foreground` | `240 10% 3.9%` | `text-popover-foreground` | Text on popovers. |
| Primary fill | `--primary` | `240 5.9% 10%` | `bg-primary`, `text-primary`, `border-primary` | Main action color. Near-black. |
| Primary text | `--primary-foreground` | `0 0% 98%` | `text-primary-foreground` | Text on primary fill. |
| Secondary fill | `--secondary` | `240 4.8% 95.9%` | `bg-secondary` | Low-emphasis button fill. |
| Secondary text | `--secondary-foreground` | `240 5.9% 10%` | `text-secondary-foreground` | Text on secondary fill. |
| Accent fill | `--accent` | `240 4.8% 95.9%` | `bg-accent` | Calendar selected ranges and subtle accents. |
| Accent text | `--accent-foreground` | `240 5.9% 10%` | `text-accent-foreground` | Text on accent fill. |
| Muted fill | `--muted` | `240 4.8% 95.9%` | `bg-muted` | Empty states, hover states, subtle panels. |
| Muted text | `--muted-foreground` | `240 3.8% 46.1%` | `text-muted-foreground` | Secondary labels, descriptions, timestamps. |
| Border | `--border` | `240 5.9% 90%` | `border-border`, `bg-border`, `text-border` | Borders, event graph base lane, separators. |
| Focus ring | `--ring` | `240 5.9% 10%` | `ring-ring` | Focus-visible rings. |
| Sidebar surface | `--sidebar` | `0 0% 98%` | `bg-sidebar` | Left app sidebar. |
| Sidebar text | `--sidebar-foreground` | `240 5.3% 26.1%` | `text-sidebar-foreground` | Sidebar text. |
| Sidebar active fill | `--sidebar-primary` | `240 5.9% 10%` | `bg-sidebar-primary` | Active sidebar item and logo block. |
| Sidebar active text | `--sidebar-primary-foreground` | `0 0% 98%` | `text-sidebar-primary-foreground` | Text/icons on active sidebar fill. |
| Sidebar hover fill | `--sidebar-accent` | `240 4.8% 95.9%` | `bg-sidebar-accent` | Sidebar hover blocks and info panel. |
| Sidebar hover text | `--sidebar-accent-foreground` | `240 5.9% 10%` | `text-sidebar-accent-foreground` | Text on sidebar accent fill. |

### Semantic State Colors

These colors are currently direct Tailwind utility classes rather than root tokens.

| Purpose | Classes | Usage |
| --- | --- | --- |
| Success status | `bg-emerald-100 text-emerald-700 border-transparent` | `done`, `complete`, `Paid` finance badges. |
| Destructive text | `text-rose-700`, `text-rose-600` | Form errors, destructive dropdown actions. |
| Destructive button | `bg-rose-600 text-white hover:bg-rose-700` | Delete confirmations. |
| Negative finance badge | `bg-red-100 text-red-700 border-transparent` | `Spent` finance badge. |
| Event graph lanes | `sky-500`, `violet-500`, `amber-500`, `emerald-500`, `rose-500`, `cyan-500` | Colored order branches in `events-log.tsx`. |

## Typography

The global font family is declared in `src/styles.css`:

```css
--font-sans: "Avenir Next", Avenir, "Segoe UI", sans-serif;
```

Tailwind exposes it through:

```js
fontFamily: {
  sans: ['var(--font-sans)'],
}
```

Base inheritance:

- `html` uses `font-family: var(--font-sans)`.
- `button`, `input`, `select`, `textarea` inherit `font: inherit`.
- `body` uses `text-foreground`.

## Text Scale

The app mostly uses Tailwind default text sizes plus a few compact custom sizes.

| Role | Classes | Typical components |
| --- | --- | --- |
| Page/card title | `text-2xl font-semibold tracking-[-0.03em]` | `CardTitle`, `DialogTitle`. |
| Metric value | `text-3xl font-semibold tracking-tight` | Dashboard metric cards. |
| Body/table text | `text-sm` | Tables, forms, dropdown items, event item text. |
| Form labels | `text-sm font-medium text-foreground` | `Label`. |
| Secondary text | `text-sm text-muted-foreground` | `CardDescription`, loading/empty states. |
| Table header | `text-sm font-medium text-muted-foreground` | `TableHead`. |
| Badge text | `text-xs font-medium whitespace-nowrap` | `Badge`, `StatusBadge`. |
| Sidebar group label | `text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/60` | `SidebarGroupLabel`. |
| Event meta | `text-xs uppercase tracking-[0.24em] text-muted-foreground` | `LogItemMeta`. |
| Event footer/timestamp | `text-[11px] text-muted-foreground` | `LogItemFooter`, `LogItemTimestamp`. |
| Small sidebar pills | `text-[10px] font-medium` or `text-[11px] font-medium` | Network/outbox indicators. |

## Core Surface Styles

| Surface | Classes | Source |
| --- | --- | --- |
| Body | `bg-background text-foreground` | `src/styles.css` |
| Card | `rounded-[8px] border border-border/70 bg-card/80 shadow-panel backdrop-blur` | `src/components/ui/card.tsx` |
| Dialog content | `rounded-[8px] border border-border/70 bg-card p-6 shadow-panel` | `src/components/ui/dialog.tsx` |
| Popover | `rounded-3xl border border-border bg-background p-3 text-foreground shadow-lg` | `src/components/ui/popover.tsx` |
| Dropdown menu | `rounded-2xl border border-border bg-background p-2 text-foreground shadow-panel` | `src/components/ui/dropdown-menu.tsx` |
| Select menu | `rounded-3xl border border-border bg-background text-foreground shadow-lg` | `src/components/ui/select.tsx` |
| Event card | `rounded-[8px] border border-border/70 bg-card/80 px-4 shadow-sm` | `src/components/ui/log-item.tsx` |
| Event titlebar | `bg-zinc-200 border-b border-border/80` | `src/components/abstract-events-log-item.tsx` |
| Sidebar | `bg-sidebar text-sidebar-foreground` | `src/components/ui/sidebar.tsx` |

## Controls

| Component | Main classes | Notes |
| --- | --- | --- |
| Primary button | `bg-primary text-primary-foreground hover:bg-primary/90` | Default `Button` variant. |
| Secondary button | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Secondary `Button` variant. |
| Outline button | `border border-input bg-background text-foreground hover:bg-muted` | Outline `Button` variant. |
| Ghost button | `bg-transparent text-foreground hover:bg-muted` | Icon/action buttons and sidebar trigger. |
| Button base | `rounded-full text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring` | `src/components/ui/button.tsx`. |
| Input | `h-11 rounded-2xl border border-border bg-background px-4 py-2 text-sm` | `src/components/ui/input.tsx`. |
| Textarea | `min-h-[120px] rounded-3xl border border-input bg-background px-4 py-3 text-sm` | `src/components/ui/textarea.tsx`. |
| Select trigger | `h-12 rounded-3xl border border-input bg-background px-4 text-sm shadow-sm` | `src/components/ui/select.tsx`. |
| Toggle group item | `h-8 rounded-sm px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground` | `src/components/ui/toggle-group.tsx`. |

## Badges And Status

Base badge class:

```txt
inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors
```

Badge variants:

| Variant | Classes |
| --- | --- |
| `default` | `border-border bg-foreground text-background` |
| `secondary` | `border-border bg-muted text-foreground/90` |
| `outline` | `border-border bg-background text-foreground/80` |

Status mapping in `src/components/status-badges.tsx`:

| Status | Classes |
| --- | --- |
| `done`, `complete` | `border-transparent bg-emerald-100 text-emerald-700` |
| `inprogress`, `pending` | `Badge` variant `outline` |
| `created`, `reopened` | `border-transparent bg-foreground text-background` |

## Tables

Base table styles live in `src/components/ui/table.tsx`.

| Element | Classes |
| --- | --- |
| Table | `w-full caption-bottom text-sm` |
| Header row | `[&_tr]:border-b` |
| Row | `border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted` |
| Head cell | `h-12 px-4 text-left align-middle font-medium text-muted-foreground` |
| Body cell | `p-4 align-middle` |
| Caption | `mt-4 text-sm text-muted-foreground` |

## Event Graph

The event graph uses semantic theme colors for the base lane and fixed Tailwind palette colors for order lanes.

Base lane:

```ts
railClassName: 'bg-border/80'
markerBorderClassName: 'border-border'
curveClassName: 'text-border'
```

Order lane palette in `src/components/events-log.tsx`:

```ts
sky-500
violet-500
amber-500
emerald-500
rose-500
cyan-500
```

Graph primitives in `src/components/ui/event-graph.tsx`:

- Rails: `absolute w-0.5 -translate-x-1/2 bg-border/80`.
- Markers: `h-4 w-4 rounded-full border-[3px] bg-card shadow-sm`.
- Transitions: `duration-300 ease-out` for lane color, marker position, and compact state changes.

## Shadows And Radius

Tailwind extensions in `tailwind.config.js`:

```js
borderRadius: {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
}
boxShadow: {
  panel: '0 20px 60px rgba(15, 23, 42, 0.12)',
}
```

Current root radius:

```css
--radius: 1.5rem;
```

Component-level radii:

- Cards and dialogs use `rounded-[8px]`.
- Buttons use `rounded-full`.
- Inputs use `rounded-2xl`.
- Selects and textareas use `rounded-3xl`.
- Dropdown items use `rounded-xl`.
- Event titlebar action button uses `rounded-[8px]`.

## Practical Rules

- Use semantic Tailwind classes like `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, and `bg-muted` before hardcoded palette colors.
- Use direct palette colors only for semantic states, destructive actions, finance direction, and event graph lanes.
- Keep regular interface text at `text-sm`; use `text-xs` and `text-[11px]` for dense metadata.
- Use `font-medium` for labels and event titles, `font-semibold` for page/card/dialog titles.
- Use `Card`, `Button`, `Badge`, `Input`, `Textarea`, `Select`, `Table`, `DropdownMenu`, and `Dialog` components instead of restyling raw HTML controls.
- Keep overlays and dropdowns on opaque `bg-background` or `bg-card`; transparent popovers make the app harder to scan.
