# Signalis — Product Catalog Filters

A faceted product catalog: category, price, and rating filters that combine
correctly, sorting, and pagination that preserves the full query state in
the URL — built for the Task 1 brief ("Product Catalog Filters").

![status](https://img.shields.io/badge/backend%20tests-17%20passing-2ea043)
![status](https://img.shields.io/badge/frontend%20tests-14%20passing-2ea043)

---

## Overview

- **Backend**: Node.js + Express REST API backed by SQLite (`better-sqlite3`),
  seeded with a deterministic set of ~100 mock products across 8 categories.
  Handles category (multi-select), price range, minimum rating, free-text
  search, six sort modes, and pagination — and returns faceted category
  counts so the UI can show "how many results if I also pick X" before the
  user clicks.
- **Frontend**: React (Vite) + Tailwind CSS. Every filter, the sort key, and
  the page number live in the URL query string, so the view is shareable,
  bookmarkable, and survives a refresh. Filters combine (AND), reset
  individually or all at once, and the mobile layout collapses the filter
  panel into a slide-in drawer.
- **Design direction**: a dark, technical "signal terminal" aesthetic (see
  [Design process](#design-process) below) with a signature five-bar
  "signal meter" used in place of star ratings, tying the visual language
  to the electronics-catalog subject matter.

---

## Setup & Running

Requires **Node.js 18+**.

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm start          # seeds the SQLite DB automatically on first run
```

The API starts on **http://localhost:4000**. Health check: `GET /api/health`.

To reseed the mock catalog manually (e.g. after changing the generator):

```bash
npm run seed
```

Run the backend test suite:

```bash
npm test
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env    # VITE_API_URL defaults to http://localhost:4000
npm install
npm run dev
```

Open **http://localhost:5173**.

Run the frontend test suite / lint:

```bash
npm test
npm run lint
```

### 3. Try the spec's example scenario

Category **Audio** + price **$50–$200** + sort **by rating** — either
through the UI, or directly against the API:

```bash
curl "http://localhost:4000/api/products?category=Audio&minPrice=50&maxPrice=200&sort=rating_desc"
```

---

## Architecture & Design Choices

### Backend

```
backend/src/
  app.js                    Express app factory (kept separate from server.js for testability)
  server.js                 Entry point: loads env, auto-seeds on first boot, starts listening
  db/
    connection.js           better-sqlite3 connection + schema
    seed.js                 Deterministic mock-data generator (seeded PRNG)
  validators/
    productQuery.js         Parses & validates raw query params -> typed filter object
  repositories/
    productsRepository.js   All SQL: filtering, sorting, pagination, faceted counts
  controllers/
    productsController.js   HTTP layer: wires validation + repository into JSON responses
  routes/products.js        Route definitions
  middleware/errorHandler.js Centralized 404 + error -> JSON response mapping
```

**Why SQLite over an in-memory array or JSON file:** the task spec allows a
"static or mocked dataset," but the challenge guidelines require a
*functional database* for full-stack tasks. SQLite via `better-sqlite3`
satisfies both — the data is generated/mocked (no external data source),
but it lives in a real relational database with indexes on `category`,
`price`, and `rating`, and the filtering logic is expressed as real SQL
rather than in-memory array filtering, so it's representative of how a
production catalog service would behave.

**Why a seeded PRNG for the mock data:** a hand-written JSON fixture of 100
products is tedious to maintain and easy to make internally inconsistent
(e.g. rating distributions that don't look real). A small `mulberry32` PRNG
seeded with a fixed constant generates realistic-looking, *reproducible*
data — the same catalog every time, so tests and manual QA see consistent
results, without committing a large static blob.

**Why facet counts are computed with the category filter excluded:** if
"Audio" is already selected, the sidebar should show how many results each
*other* category would add if the user also selects it — not collapse to
"Audio: 12, everything else: 0". Price/rating/search filters still apply
to the facet counts, since those genuinely narrow what "adding this
category" would mean.

**Why pagination returns `page: N` with an empty array instead of clamping
to the last page:** clamping silently changes what the user asked for. The
API is honest about "you asked for a page that doesn't exist under these
filters" and the frontend already treats an out-of-range page the same as
"no results," rather than surprising the user with different data than the
URL implies.

### Frontend

```
frontend/src/
  api/products.js               fetch wrapper: builds query strings, normalizes errors
  hooks/
    useCatalogFilters.js        Single source of truth: reads/writes filters via useSearchParams
    useProducts.js              Fetches on filter change; cancels stale in-flight requests
  components/
    FilterPanel.jsx             Category / price / rating controls (shared by sidebar + drawer)
    FilterDrawer.jsx            Mobile slide-in drawer wrapper
    ActiveFilterChips.jsx       Removable chips summarizing the current filter set
    Toolbar.jsx                 Result count, search box, sort select, mobile "Filters" trigger
    ProductCard.jsx / ProductThumb.jsx   Grid item + seeded placeholder art
    SignalBars.jsx               Signature rating indicator (see Design process)
    Pagination.jsx               Page controls, delegates all state to the URL via a callback
    StateViews.jsx               Loading skeleton, empty state, error state
  App.jsx                       Wires everything together
```

**Why filter state lives in the URL (`useSearchParams`) instead of
component state:** this is what makes "pagination preserves query state"
and "usable on mobile with a collapsible drawer that doesn't lose filters"
both fall out for free — reloading, sharing a link, or using the browser
back button all keep (or correctly restore) the exact filtered/sorted/paged
view. It also means the sidebar and the mobile drawer can render the *same*
`FilterPanel` component from the *same* state without prop-drilling through
a separate store.

**Why changing a filter resets `page` but changing `sort` does not:** if a
user is on page 3 of "Gaming" and adds a price filter, page 3 of the new,
smaller result set is likely to be empty or a totally different set of
products — resetting to page 1 avoids that confusion. Re-sorting the same
result set, though, is still meaningful to view from wherever the user
currently is.

**Why a request-id ref instead of `AbortController` in `useProducts`:**
either would prevent a stale response from overwriting a newer one; the
request-id check keeps the fetch wrapper simple (no `signal` plumbing
through every layer) while still being fully correct for this API's needs.
It was primarily driven by fast, sequential filter changes (e.g. dragging
between price presets) rather than typing latency, since the current UI
uses discrete filter controls, not a live-typing price slider.

**Why a custom "signal bars" rating indicator instead of stars:** see
below.

### Design process

The brief is an electronics/gadget catalog (Audio, Wearables, Laptops,
Cameras, Gaming, Home, Phones, Accessories), so the visual direction leans
into that subject rather than a generic storefront look:

- **Palette**: near-black ink (`#12141A`) background, warm signal-amber
  (`#F2A93B`) as the primary accent, a cooler wave-cyan (`#4FD1C5`) as a
  secondary accent, set against muted slate surfaces (`#1A1D26` /
  `#20242F`).
- **Type**: Space Grotesk (display/headings) + Inter (body/UI) + IBM Plex
  Mono (prices, counts, category tags, SKU-style metadata) — the mono face
  is doing real work here, marking "this is a number/data point" the way a
  spec sheet would.
- **Signature element**: a five-bar "signal meter" rating indicator
  (`SignalBars`), styled after an audio level meter, used both as a
  read-only badge on product cards and as the interactive control in the
  rating filter — reused rather than introducing a second rating widget.
- **Structure**: category chips and the active-filter row double as
  navigation *and* as a legible summary of "what is currently filtering
  this view," per the task's usability requirement.

---

## API Reference

### `GET /api/products`

| Query param | Type              | Notes |
|---|---|---|
| `category`  | string (comma-separated) | e.g. `Audio,Gaming` |
| `minPrice`, `maxPrice` | number | inclusive bounds |
| `minRating` | number, 0–5 | inclusive lower bound |
| `search`    | string | matches name, brand, description |
| `sort`      | `relevance` \| `price_asc` \| `price_desc` \| `rating_desc` \| `newest` \| `name_asc` | |
| `page`      | integer ≥ 1 | default `1` |
| `pageSize`  | integer | default `12`, capped at `48` |

Returns `{ data, pagination, facets, appliedFilters }`. Invalid params
return `400 { error: "ValidationError", message, details }`.

### `GET /api/products/meta`

Returns `{ priceBounds: { min, max }, categories: [{ category, count }] }`
— used to render filter controls before any filtering happens.

---

## Trade-offs & Future Work

**Prioritized, given the time box:**
- A correct, tested filtering/sorting/pagination engine with faceted counts
  over a large surface of "nice to have" features.
- URL-state-driven filters (the core usability requirement) over a fancier
  price slider widget — the current price control is presets + numeric
  inputs, not a drag slider.
- Backend integration tests over frontend end-to-end tests (no
  Playwright/Cypress run in this environment); frontend tests are unit-level
  (hooks + components) with `Vitest`/`Testing Library`.

**Skipped / simplified due to time constraints:**
- No real product images — cards render a small seeded gradient "waveform"
  tile instead, since the task explicitly allows a mocked dataset and no
  image assets were provided.
- No debounce on the search input; with only ~100 rows the extra request
  volume is a non-issue, but at real scale this would need a ~250ms
  debounce (the URL-state pattern makes that a small, isolated change in
  `useCatalogFilters`).
- No authentication/authorization — out of scope for a catalog browsing
  task.
- Category list rendered from a hardcoded fallback array in `App.jsx` if
  `/api/products/meta` fails, so the filter panel degrades gracefully
  rather than disappearing.

**How I'd scale this for production:**
- Swap SQLite for Postgres and add a real full-text search index
  (`tsvector` or a dedicated search service) once catalog size or query
  complexity grows past what `LIKE` handles well.
- Move facet computation to a materialized/cached aggregate if the catalog
  grows large enough that the per-request `GROUP BY` becomes a bottleneck.
- Add response caching (`ETag`/`Cache-Control`) on `GET /api/products` for
  common filter combinations.
- Add Playwright end-to-end tests covering the full "filter → sort →
  paginate → refresh and confirm state persisted" flow described in the
  task's usability requirements.
- Debounce search input and add an `AbortController` alongside the
  request-id guard so genuinely stale HTTP requests are cancelled at the
  network layer, not just ignored on arrival.

---

## Tech Stack

- **Backend**: Node.js, Express, `better-sqlite3`, `dotenv`, `cors`,
  `morgan`; Jest + Supertest for testing.
- **Frontend**: React 19, Vite, React Router, Tailwind CSS; ESLint (flat
  config) for linting; Vitest + Testing Library for testing.
