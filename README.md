# BuildVision Equipment Data Viewer

A Next.js application for visualizing and exploring extracted HVAC/MEP
equipment-schedule data from construction bid packages. Built on the
**BuildVision** design system.

## What this app does

It takes the three extracted CSV datasets in `data/`:

- `Project.csv` — projects (bid packages)
- `Equipment.csv` — every tagged equipment item across all projects
- `Requirements.csv` — every spec / requirement row attached to equipment

…and turns them into an interactive dashboard for browsing projects,
manufacturers, component types, individual equipment items with full specs,
and cross-cutting insights (e.g. Basis-of-Design vs. specified-manufacturer
deltas, manufacturer market share by category).

## Stack

- **Next.js 14** App Router + **TypeScript**
- **Tailwind CSS** configured with the BuildVision tokens (BV Blue, neutrals,
  semantic palette, type scale)
- **Inter** font via `next/font`
- **Recharts** for charts
- **Lucide-react** icons

## Data pipeline (build-time)

For maximum runtime performance, raw CSVs are not parsed in the browser or on
each request. Instead, `scripts/build-data.ts` runs as part of `prebuild` /
`predev` and produces precomputed JSON in `src/data/generated/`:

- `projects.json` — projects with denormalized counts
- `equipment.json` — all equipment rows
- `requirements-by-equipment.json` — specs grouped by equipment id (O(1)
  lookup for detail pages)
- `aggregates.json` — top manufacturers, top component types, equipment per
  project, BOD-vs-specified mismatches, market share by category, etc.

Pages import this JSON statically; Next.js handles the bundling and tree
shaking.

## Pages

| Path                         | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `/`                          | Dashboard with KPIs and headline charts        |
| `/projects`                  | Searchable, sortable list of all projects      |
| `/projects/[id]`             | Project detail: packages, top mfrs, equipment  |
| `/equipment`                 | Global equipment explorer with filters         |
| `/equipment/[id]`            | Equipment detail with grouped specifications   |
| `/manufacturers`             | Manufacturer leaderboard                       |
| `/component-types`           | Component-type catalog                         |
| `/insights`                  | BOD alignment, manufacturer market share, etc. |

## Getting started

```bash
npm install
npm run dev
```

The app will be available at <http://localhost:3000>.

The CSV → JSON build step runs automatically before `dev` and `build`. To run
it manually:

```bash
npm run build:data
```

## Production build

```bash
npm run build
npm run start
```

## Deployment

Works out of the box on **Vercel** — push this repo and import it. No
environment variables required. For self-hosted deployments, run
`npm run build` then `npm run start`.

## Project layout

```
.
├── data/                       # raw CSVs (Project / Equipment / Requirements)
├── BuildVision Logo PNG/       # source brand assets
├── public/logos/               # logos used by the site
├── scripts/build-data.ts       # CSV → JSON transform
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # ui, charts, data-table, header/footer
│   └── data/
│       ├── types.ts            # shared types
│       ├── load.ts             # static imports of generated JSON
│       └── generated/          # produced by build-data.ts
├── styleguide.md               # BuildVision design tokens
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## Design system

This app strictly follows the BuildVision style guide in `styleguide.md`:

- **Inter** typography across the full scale (h1–h5, body-lg/md/sm, detail,
  micro).
- **BV Blue (#4A3AFF)** for all interactive elements: links, primary CTAs,
  active navigation, focus rings, primary chart fills.
- **Neutral** palette for text, borders, surfaces.
- **Semantic** colors (green/yellow/red/purple) used sparingly for
  status/badges and chart accents.

## Notes

The `data/` folder also contains per-project subfolders that are simply slices
of the same three top-level CSVs — the app uses the top-level files only.
