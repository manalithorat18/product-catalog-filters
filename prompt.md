# prompt.md

AI-Assisted Development Prompts
This file records the AI-assisted prompts used during the development of the Product Catalog Filters task. The prompts were used iteratively for understanding the requirements, implementation, debugging, testing, and final review.

## AI Tool Used
**Claude Sonnet via claude.ai** was used as the primary AI coding assistant.

---

## 1. Understanding the Requirements

### Prompt
I have been given a coding challenge to build a Product Catalog Filters application. Before I start coding, help me understand the requirements properly.

Please break down:

- what the frontend needs to contain
- what filters are required
- what the backend API should support
- how pagination should work
- what edge cases I should consider
- what tests I should write
Also suggest a practical development plan that I can follow without overengineering the solution.

---

## 2. Choosing the Technology Stack

### Prompt
I want to build this as a full-stack application. I am comfortable with React and JavaScript, so I am thinking about using React + Vite + Tailwind for the frontend and Node.js + Express + SQLite for the backend.

Is this a good stack for the given challenge?

Please explain why this would be suitable and suggest a clean project/folder structure. I want the project to be easy to run locally and easy to test.

---

## 3. Setting Up the Backend and Database

### Prompt
Help me implement the backend for the product catalog using Node.js, Express and SQLite.

I want to keep the backend separated into:

- database connection
- seed data
- validators
- repositories
- controllers
- routes
- error handling
The database should contain product information such as name, brand, category, price, rating and review count.

Please also suggest useful indexes for the fields that will be used for filtering and sorting.

---

## 4. Creating Deterministic Product Data

### Prompt
I need mock product data for the catalog. The task requires around 100 products across these 8 categories:

Audio, Wearables, Laptops, Cameras, Gaming, Home, Phones and Accessories.

Please help me create a seed script with realistic product names, brands, prices, ratings and review counts.

I don't want the data to change every time the application starts because that could make testing difficult. Can we use a seeded random number generator so the same data is generated every time?

---

## 5. Implementing Product Filtering API

### Prompt
Now help me implement GET /api/products.

The API needs to support:

- single and multiple category filters
- minimum and maximum price
- rating filter
- search
- sorting
- pagination
I want the SQL logic to remain inside the repository rather than the controller.

The API response should include the product data, pagination information, facets and the filters that were applied.

Please keep the implementation clean and easy to test.

---

## 6. Handling Validation and Edge Cases

### Prompt
I want to add a separate validator for the product query parameters.

Please help me validate cases such as:

- invalid category values
- invalid price values
- minPrice greater than maxPrice
- invalid rating
- invalid sort value
- invalid page number
- invalid page size
I also want structured validation errors instead of generic Express errors.

Please suggest how I can keep this validation separate from the SQL/repository code.

---

## 7. Implementing Facet Counts and Pagination Correctly

### Prompt
There are two things I want to make sure are implemented correctly.

First, category facet counts should remain useful when a category is selected. For example, selecting Audio should not make the Audio count become 0. The category filter itself should be excluded when calculating category counts, while the other filters should still apply.

Second, if the user requests a page beyond the available pages, I don't want to silently change the requested page. The API should return an empty array with the correct total count and pagination information.

Please help me implement both cases correctly.

---

## 8. Testing the Backend

### Prompt
The backend is implemented now. Help me write integration tests using Jest and Supertest.

I want to test the actual API endpoints and cover:

- single category filtering
- multiple categories
- price filtering
- rating filtering
- ascending and descending sorting
- combined filters
- pagination
- empty results
- invalid sort
- invalid rating
- minPrice greater than maxPrice
- page size limit
- metadata endpoint
- 404 handling
Also test the main example from the task: Audio products between $50 and $200 sorted by rating.

---

## 9. Building the React Frontend

### Prompt
The backend is working, so now I want to build the frontend using React, Vite and Tailwind.

The application should have:

- header
- search
- filter panel
- category filters with counts
- price filters
- rating filter
- active filter chips
- sorting
- product cards
- pagination
- loading state
- empty state
- error state
Please suggest a component structure that keeps the code reusable and avoids putting too much logic inside App.jsx.

---

## 10. Creating the UI Design

### Prompt
I don't want the application to look like a generic e-commerce website.

Since this is an electronics product catalog, I want a dark technical design inspired by electronic/signal interfaces.

I am thinking about:

- near-black background
- amber and cyan accents
- Space Grotesk / Inter / IBM Plex Mono fonts
- signal-bar style rating instead of normal stars
- seeded gradient artwork for products because there are no real product images
Please help me implement this using Tailwind while keeping the UI readable and responsive.

---

## 11. Keeping Filters in the URL

### Prompt
I want the URL to completely represent the current catalog state so that the user can refresh or share the URL and get the same results.

The URL should contain the active:

- categories
- price range
- rating
- search
- sort
- page
Filter changes should reset the page to 1, while sorting should preserve the current page.

Please help me create a reusable useCatalogFilters hook using URL search parameters.

---

## 12. Handling API Requests and Race Conditions

### Prompt
Please help me create a useProducts hook for fetching products whenever the URL filters change.

I noticed that if a user changes filters quickly, multiple API requests can be running at the same time. An older request could finish after the newer request and display incorrect results.

Please implement a simple way to prevent stale responses from overwriting newer results.

Also create an API wrapper that handles query-string construction and distinguishes network errors, HTTP errors and invalid/non-JSON responses.

---

## 13. Responsive Filters and Frontend Testing

### Prompt
I want the filter panel to work well on both desktop and mobile.

On desktop it can be a sidebar, but on mobile I want a filter drawer that can be opened from the toolbar.

The drawer should close when:

- the backdrop is clicked
- Escape is pressed
- the screen is resized back to desktop
After implementing this, help me add Vitest and React Testing Library tests for important user behavior such as filter toggling, page reset after filters change, URL state and pagination.

---

## 14. Code Review and Bug Finding

### Prompt
I have implemented most of the project now. Please review it like you are reviewing a final-year student's full-stack coding challenge.

Look specifically for:

- incorrect filtering behavior
- pagination bugs
- SQL problems
- validation issues
- duplicated code
- poor separation of concerns
- React state problems
- stale API responses
- missing loading/error/empty states
- responsive issues
- anything that could fail the requirements
Please don't suggest unnecessary rewrites. Focus on issues that actually improve correctness, maintainability or user experience.

---

## 15. Final Submission Review

### Prompt
I am preparing this project for final submission.

Please perform a final review against the original Product Catalog Filters requirements.

Check:

- backend functionality
- frontend functionality
- filters
- sorting
- pagination
- facet counts
- URL state
- validation
- error handling
- tests
- linting
- production build
- README
- prompt documentation
- environment files
- Git repository hygiene
Also verify the main acceptance scenario:

Audio + $50–$200 + rating sorting.

Give me a prioritized list of anything I should fix before submitting. Avoid adding features that are not required by the challenge.

---

# Human-in-the-Loop Decisions
AI was used as a development assistant for requirement analysis, implementation guidance, debugging, testing suggestions and code review.

The final implementation was reviewed manually.

Important decisions included:

- Using React + Vite + Tailwind for the frontend.
- Using Node.js + Express + SQLite for the backend.
- Using seeded mock data so the dataset remains consistent.
- Separating SQL logic into a repository layer.
- Keeping query validation separate from database logic.
- Using URL search parameters as the source of truth for catalog state.
- Resetting pagination when filters change.
- Preventing stale API responses from overwriting newer results.
- Excluding the active category filter while calculating category facets.
- Returning empty results for out-of-range pages instead of silently changing the requested page.
- Adding automated backend and frontend tests.
- Reviewing the final implementation before submission.

# Final Validation
The completed project was checked using:

- Jest/Supertest backend tests
- Vitest/React Testing Library frontend tests
- ESLint
- Vite production build
- Manual API testing
- Manual frontend testing
- Git repository review
