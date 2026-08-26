# prompt.md

This file records the prompts used with Claude (Anthropic) to build this
solution for **Task 1 — Product Catalog Filters**, as required by the AI
Coding Challenge guidelines.

---

## Tool used

Claude (Sonnet, via claude.ai chat with code execution / file tools).

## Session prompts (in order)

**1. Initial brief** — uploaded `AI Coding Challenge Guidelines.pdf` and
`Question Set - E.pdf`, then:

> i have to create this task
> here let's start with the task 1 to implement read the task one carefully
> from the pdf we have to build it very impressive, attractive and also to
> get shortlist for the interview lets start it

**2. Clarification (asked by Claude, answered by candidate)**

> Claude asked: "What tech stack should I build Task 1 (Product Catalog
> Filters) with?" — Options offered: React + Node/Express + SQLite,
> React + Node/Express + mock JSON only, Next.js full-stack, or Other.
>
> Answer: **React + Node/Express + SQLite (recommended, fast to demo)**

**3. Continuation**

> Continue

## What Claude was asked to produce, and the constraints given

From the guidelines PDF, the following constraints were treated as binding
requirements for every prompt above:

- MVP first, then polish (edge cases, error handling, tests, docs).
- Full-stack baseline: functional database, CRUD-style API, connected
  frontend, foundational unit tests.
- Production-grade code: clean structure, separated concerns, standard
  style guide (ESLint).
- Graceful error handling: input validation, network/API failure handling
  with meaningful fallback responses.
- Structured JSON responses.
- Secrets in `.env`, never hardcoded, `.env` git-ignored.
- `prompt.md` and a comprehensive `README.md` at the repo root.
- Frequent, atomic git commits (candidate's responsibility post-delivery).

From the Task 1 spec (`Question Set - E.pdf`):

- Faceted filters: category, price range, rating.
- Sorting and pagination on a static/mocked dataset.
- Filters combine correctly, reset cleanly, remain usable on mobile
  (collapsible filter drawer acceptable).
- Users understand active filters, see result counts, can change sort
  without losing unrelated filters.
- Pagination preserves query state.
- Example acceptance case: category "Audio" + price $50–$200 + sort by
  rating returns only matching items with correct page transitions.

## How AI assistance was used

Claude was used to:

1. Scaffold the backend (Express + `better-sqlite3`), including a seeded
   mock-data generator, a validated query parser, a filtering/sorting/
   pagination repository layer, faceted category counts, centralized error
   handling, and a Jest/Supertest integration test suite (17 tests,
   including the exact "Audio + $50–200 + sort by rating" example from the
   spec).
2. Scaffold the frontend (Vite + React + Tailwind + React Router), design
   a distinctive visual identity (see "Design process" in README), and
   implement URL-synced filter state (`useCatalogFilters`), a data-fetching
   hook with stale-request cancellation, the filter panel, mobile drawer,
   active-filter chips, sortable/searchable toolbar, product grid,
   pagination, and loading/empty/error states.
3. Add ESLint (flat config) for the frontend and fix all resulting
   lint findings, including a React 19 effect-timing warning.
4. Add a Vitest + Testing Library unit test suite for the frontend
   (14 tests covering the rating indicator, pagination, and URL-state hook).
5. Manually smoke-test both servers together with `curl` before wrapping
   up, including the price/category/sort combination from the spec.
6. Write this `prompt.md` and the project `README.md`.

## Notable manual/iterative decisions (human-in-the-loop)

- Chose SQLite over a JSON-only mock when prompted, for a more realistic
  "functional database" per the guidelines while still satisfying the
  task's "static or mocked dataset" allowance (the DB is seeded with
  generated mock data, not live/external data).
- Reviewed and fixed lint errors surfaced by ESLint / eslint-plugin-react-
  hooks rather than suppressing them wholesale (one `useEffect` was
  restructured to avoid a synchronous `setState` inside the effect body).
