# prompt.md
This file documents the prompts and AI-assisted workflow used to build this submission (Task 1 — Product Catalog Filters), as required by the challenge guidelines.

**Tool used:** Claude (Anthropic), through Claude.ai chat with code execution.

---

## Brief given to the assistant
The candidate provided:

1. The challenge guidelines PDF containing the general requirements:

- MVP-first implementation
- Full-stack baseline
- Database + API + frontend
- Automated tests
- Production-quality code
- Graceful error handling
- `prompt.md` and `README.md`
- Git hygiene
- Final technical defense
2. The Task 1 specification — **Product Catalog Filters**:

> Build a product catalog that allows users to filter and sort products by category, price, rating and other supported criteria. The application should provide a usable frontend, a backend API, persistent product data, pagination, meaningful filter facets, validation, and appropriate loading/error/empty states.
The development was approached incrementally, starting with requirement analysis and backend design, followed by frontend implementation, testing, edge-case handling, and final repository review.

---

## How the request was decomposed and iterated

1. **Understand the catalog requirements before implementation.**

- The first step was to identify the required filters, sorting behavior, pagination requirements, API structure, UI states, and acceptance scenarios.
- The implementation was intentionally kept focused on the challenge instead of adding unnecessary e-commerce features.
2. **Choose a simple full-stack architecture.**

- SQLite was selected instead of an external database because the project needed to be easy to run from a fresh clone.
- Express was used for the REST API and React/Vite for the frontend.
- The backend was separated into validation, repository, controller, route, database, and middleware layers.
3. **Create deterministic product data.**

- Around 100 products were generated across eight electronics-related categories.
- A seeded pseudo-random generator was used so the same dataset is produced consistently.
- This makes automated tests and manual verification reproducible.
4. **Implement filtering and sorting in the repository layer.**

- Category, price, rating, search, sorting and pagination are converted into SQL conditions.
- SQL logic is kept outside the controllers.
- Query parameters are validated before reaching the repository.
5. **Handle category facets correctly.**

- Category counts are calculated while excluding the category predicate itself.
- This keeps the sidebar counts useful even when one or more categories are selected.
6. **Treat pagination edge cases explicitly.**

- An out-of-range page returns an empty result array with the correct total count rather than silently changing the requested page.
- Page size is capped to prevent unnecessarily large requests.
7. **Make URL state the source of truth for the frontend.**

- Filters, search, sorting and pagination are represented through URL search parameters.
- This makes the current catalog state refresh-safe, shareable and bookmarkable.
8. **Protect against stale frontend requests.**

- Fast filter changes can produce multiple requests.
- A request-id mechanism was used so an older response cannot overwrite newer results.
9. **Build a domain-specific visual design.**

- Instead of using a generic e-commerce template, the interface uses a dark electronics/signal-console visual language.
- Signal-bar ratings were used instead of conventional stars to match the electronics theme.
10. **Verify the implementation through automated and manual checks.**

- Backend integration tests cover the main filtering, sorting, validation and pagination scenarios.
- Frontend tests cover important filter and pagination behavior.
- ESLint and the production build were also verified.

---

## Assumptions made explicit rather than silently guessed

- The catalog contains approximately 100 deterministic mock products.
- The supported categories are:

- Audio
- Wearables
- Laptops
- Cameras
- Gaming
- Home
- Phones
- Accessories
- Higher rating values represent better-rated products.
- Category facet counts should exclude the active category filter while retaining other active filters.
- An out-of-range page should return no products rather than silently changing the requested page.
- A maximum page size is enforced to prevent unnecessarily large responses.
- URL search parameters are treated as the source of truth for catalog state.
- Filter changes reset pagination to page 1.
- Sorting does not unnecessarily reset the current page.
- Product images were not required, so deterministic gradient placeholder artwork was used instead of external image dependencies.
- SQLite was selected to provide persistent database-backed behavior without requiring an external database service.

---

# AI-Assisted Development Prompts — Evaluation-Ready Reconstruction
The following sequence captures the engineering workflow used for Task 1.

It is a reconstruction of the prompts and resulting decisions rather than a verbatim chat transcript. The prompts represent the iterative way the AI assistant was used during development, debugging, testing and review.

---

## 1. Understand the task and identify the requirements

### Prompt

> I have been given Task 1 — Product Catalog Filters as part of a full-stack coding challenge.
> 
> Please go through the task requirements carefully and help me understand what I need to build before I start coding.
> 
> Identify:
> 
> 
> - required frontend functionality
> - required filters
> - sorting behavior
> - pagination requirements
> - backend/API requirements
> - validation and error cases
> - testing requirements
> - important acceptance scenarios
> Please suggest a practical implementation plan that I can complete without overengineering the project.

### Decision
The task was divided into backend/data, API, frontend/filter state, testing, and final validation rather than implementing everything at once.

---

## 2. Choose the stack and project structure

### Prompt

> I want to build this as a full-stack application and I am comfortable with React and JavaScript.
> 
> I am considering React + Vite + Tailwind for the frontend and Node.js + Express + SQLite for the backend.
> 
> Is this a suitable stack for this challenge?
> 
> Please explain the main trade-offs and suggest a folder structure with separate areas for database, validation, repositories, controllers, routes, frontend components and hooks.
> 
> I want the project to be easy to run locally and easy to test.

### Decision
React/Vite/Tailwind and Node.js/Express/SQLite were selected because they provide a realistic full-stack implementation without requiring external infrastructure.

---

## 3. Design the SQLite database and deterministic seed data

### Prompt

> Help me set up the SQLite database for the product catalog using better-sqlite3.
> 
> I need fields for product id, name, brand, category, price, rating and review count.
> 
> The challenge needs realistic mock data, so I want around 100 products across Audio, Wearables, Laptops, Cameras, Gaming, Home, Phones and Accessories.
> 
> I also want the seed data to remain the same every time I run the application so that my tests don't depend on changing random data.
> 
> Please suggest useful indexes and a simple deterministic seed-data approach.

### Decision
A seeded PRNG was used to create reproducible product data, with indexes on frequently queried product fields.

---

## 4. Implement query validation

### Prompt

> I want to keep query validation separate from the database code.
> 
> Please help me create a product query validator that parses the Express query parameters into a normalized filter object.
> 
> It should support:
> 
> 
> - one or multiple categories
> - minPrice
> - maxPrice
> - rating
> - search
> - sort
> - page
> - pageSize
> Please handle invalid values, unsupported sorting options, invalid ratings, invalid pagination values and the case where minPrice is greater than maxPrice.
> 
> I want validation errors to be structured so the frontend can display a useful error.

### Decision
A dedicated `productQuery.js` validator and structured validation error handling were used rather than validating parameters inside the repository.

---

## 5. Implement filtering, sorting and pagination

### Prompt

> Now help me implement the repository logic for finding products.
> 
> The repository should support category filtering, price range, rating, search, sorting and pagination.
> 
> I also need the total number of matching products so the frontend can calculate pagination.
> 
> Please keep all SQL inside the repository and use parameterized queries.
> 
> One important requirement is that requesting a page beyond the available pages should return an empty array rather than silently changing the requested page.
> 
> Also make sure pagination does not cause products to be duplicated or skipped between consecutive pages.

### Decision
All SQL was kept in `productsRepository.js`, with filtering and pagination performed by the database and pagination metadata returned to the controller.

---

## 6. Implement meaningful category facets

### Prompt

> I need category counts for the filter sidebar.
> 
> There is an important behavior I want to get right: if Audio is selected, I don't want the Audio facet count to become zero just because the current category filter is Audio.
> 
> The category facet query should therefore exclude the category condition itself but continue applying the other active filters such as price, rating and search.
> 
> Please help me implement this without duplicating too much query-building logic.

### Decision
`findCategoryFacets` calculates category counts while excluding only the category predicate, allowing the sidebar counts to remain meaningful.

---

## 7. Build the products API and error handling

### Prompt

> Help me connect the validator and repository to the Express API.
> 
> I want:
> 
> GET /api/products
> 
> and:
> 
> GET /api/products/meta
> 
> The products response should contain:
> 
> 
> - data
> - pagination
> - facets
> - appliedFilters
> The meta endpoint should provide the initial category information and price bounds.
> 
> Please also add centralized 404 and error handling and make sure stack traces or internal implementation details are not returned to the client.

### Decision
Controllers were kept thin and responsible for connecting validation and repository results into consistent JSON responses.

---

## 8. Write backend integration tests

### Prompt

> The backend API is implemented now. Please help me write Jest and Supertest integration tests.
> 
> I want to test the actual API behavior rather than only testing individual functions.
> 
> Please cover:
> 
> 
> - single category filtering
> - multiple categories
> - price filtering
> - rating filtering
> - ascending and descending sorting
> - combined filters
> - pagination
> - no overlap between pages
> - empty results
> - invalid sort
> - invalid rating
> - minPrice greater than maxPrice
> - page-size limits
> - meta endpoint
> - 404 handling
> Also include the exact challenge example using Audio products between $50 and $200 with rating sorting.

### Result
The backend integration suite was expanded to cover the major filtering combinations, validation cases, pagination behavior and the specification's example scenario.

---

## 9. Build the React catalog interface

### Prompt

> The backend is working, so now I want to build the React frontend.
> 
> Please help me structure the application into reusable components.
> 
> I need:
> 
> 
> - header
> - filter panel
> - category checkboxes with counts
> - price filters
> - rating filter
> - active filter chips
> - search
> - sorting
> - product cards
> - pagination
> - loading state
> - empty state
> - error state
> Please keep the main filtering logic out of individual components where possible.

### Decision
The frontend was divided into focused components such as `FilterPanel`, `FilterDrawer`, `ActiveFilterChips`, `Toolbar`, `ProductCard`, `Pagination` and `StateViews`.

---

## 10. Design the electronics-focused UI

### Prompt

> I want the application to look different from a generic e-commerce site.
> 
> Since this is an electronics catalog, I want a dark technical visual style with a near-black background and amber/cyan accents.
> 
> I am thinking of using Space Grotesk, Inter and IBM Plex Mono, and I want product ratings to look like signal bars/audio meters instead of normal stars.
> 
> Product images are not available, so please suggest a clean way to create consistent placeholder artwork without external image dependencies.
> 
> Keep the design responsive and usable rather than adding visual effects that make the interface harder to use.

### Decision
A dark "Signalis"-inspired electronics interface was created, with signal-bar ratings and seeded gradient product artwork.

---

## 11. Store catalog state in the URL

### Prompt

> I want the URL to represent the complete state of the product catalog.
> 
> Please help me create a useCatalogFilters hook that reads and updates URL search parameters for:
> 
> 
> - categories
> - price range
> - rating
> - search
> - sort
> - page
> The important behavior is:
> 
> 
> - refreshing the page should preserve the filters
> - sharing the URL should reproduce the same state
> - changing a filter should reset the page to 1
> - sorting should preserve the other filters
> - pagination should preserve all active filters
> Please keep this hook as the single source of truth instead of duplicating filter state across components.

### Decision
`useCatalogFilters.js` became the single source of truth for catalog URL state.

---

## 12. Handle API fetching and stale requests

### Prompt

> Please help me implement a useProducts hook that fetches products whenever the catalog filters change.
> 
> I am concerned about a race condition when the user changes filters quickly. For example, an older request could finish after the latest request and overwrite the correct results.
> 
> Please implement a simple request-id based approach to ignore stale responses.
> 
> I also want the API wrapper to handle:
> 
> 
> - query-string construction
> - HTTP errors
> - network errors
> - unexpected non-JSON responses
> Keep the implementation simple and easy to understand.

### Decision
A request-id ref was used to prevent stale responses from replacing newer catalog results.

---

## 13. Add responsive filtering and frontend tests

### Prompt

> I want the filters to work properly on mobile as well.
> 
> On desktop I want the filter panel visible, while on mobile I want a slide-in filter drawer.
> 
> The drawer should close on:
> 
> 
> - backdrop click
> - Escape
> - resizing back to desktop
> After implementing this, help me add Vitest and React Testing Library tests for the important frontend behavior, especially filter toggling, URL state, page reset and pagination.
> 
> Please focus on user-visible behavior instead of testing implementation details.

### Decision
The mobile filter drawer and the main catalog interaction tests were added. The tests focus on observable behavior rather than internal component implementation.

---

## 14. Review edge cases and improve code quality

### Prompt

> I have most of the application implemented now. Please review it like you are reviewing a final-year student's full-stack coding challenge.
> 
> Look specifically for:
> 
> 
> - incorrect filter combinations
> - pagination issues
> - stale API responses
> - validation problems
> - SQL/query problems
> - duplicated logic
> - React state issues
> - missing loading/error/empty states
> - responsive issues
> - anything that could fail the original requirements
> Please do not suggest unnecessary rewrites. Focus only on changes that improve correctness, maintainability or the user experience.

### Result
The implementation was reviewed for edge cases including empty results, invalid queries, out-of-range pagination, rapid filter changes and responsive behavior.

---

## 15. Perform the final submission review

### Prompt

> I am preparing this Product Catalog Filters project for final submission.
> 
> Please perform a final review against the original challenge requirements.
> 
> Check:
> 
> 
> - backend functionality
> - frontend functionality
> - filtering
> - sorting
> - pagination
> - facet counts
> - URL state
> - validation
> - error handling
> - automated tests
> - linting
> - production build
> - README
> - prompt.md
> - environment files
> - Git repository hygiene
> Also verify the main acceptance scenario:
> 
> Audio + $50–$200 + rating sorting.
> 
> Give me a prioritized list of anything that should be fixed before submission. Do not add unrelated features just to make the project larger.

---

# Human-in-the-Loop Decisions
AI was used as a development assistant for requirement analysis, implementation guidance, debugging, testing suggestions and code review.

The final implementation decisions were reviewed manually.

Important decisions included:

- Selecting React + Vite + Tailwind for the frontend.
- Selecting Node.js + Express + SQLite for the backend.
- Using a seeded PRNG for reproducible mock data.
- Separating validation, repository, controller and route responsibilities.
- Using SQLite indexes for frequently queried product fields.
- Keeping SQL logic out of controllers.
- Making category facet counts independent of the active category predicate.
- Returning empty data for out-of-range pages instead of silently clamping the page.
- Using URL search parameters as the source of truth for catalog state.
- Resetting pagination when filters change.
- Preserving pagination when sorting changes.
- Using request IDs to prevent stale API responses.
- Choosing a domain-specific electronics/signal visual design.
- Using placeholder product artwork instead of relying on external image services.
- Adding automated backend and frontend tests.
- Reviewing the final implementation manually before submission.

---

# Verification Checklist
The final verification sequence was:

1. Install backend dependencies using a clean `npm ci`.
2. Run backend Jest/Supertest tests.
3. Run backend linting.
4. Verify the product API manually.
5. Verify the main Audio + $50–$200 + rating sorting scenario.
6. Verify single and multiple category filters.
7. Verify price and rating filters.
8. Verify sorting in both directions.
9. Verify pagination and ensure consecutive pages do not overlap.
10. Verify out-of-range pages return empty results with correct metadata.
11. Verify category facet counts remain meaningful when a category is selected.
12. Verify frontend URL state survives refresh.
13. Verify rapid filter changes do not display stale results.
14. Run frontend Vitest/Testing Library tests.
15. Run ESLint and the Vite production build.
16. Review `.gitignore`, environment files, generated database files and repository structure before submission.
The final implementation was kept focused on the challenge requirements while adding engineering improvements where they directly supported correctness, usability, testability or maintainability.
