## REQ-XXX: [Requirement Name]

### Task 1: Server Component & Performance Setup
**Location:** `src/app/[locale]/...`
**Prompt for Firebase Studio AI:**
> In the `src/app/[locale]` directory, within the module for this requirement, refactor the main page to be a Next.js Server Component. Implement async data fetching for the initial data directly within the page component. Integrate a cached data fetching function from `src/data/` or `src/services/` to fetch the data. Wrap the main data-display components in a React Suspense boundary with a corresponding skeleton component as the fallback.

### Task 2: Requirement-Specific Integration
**Location:** `src/app/[locale]/...` and `src/components/...`
**Prompt for Firebase Studio AI:**
> In the `src` directory, implement the full UI and interactive workflow for this requirement. This includes generating all necessary child components in `src/components`, popups, and forms. Implement the business logic for all user interactions and connect them to the appropriate functions in `src/services/` and `src/data/` for creating, reading, updating, and deleting data. Ensure comprehensive error handling for all data operations.

### Task 3: React Performance Optimization
**Location:** `src/components/...`
**Prompt for Firebase Studio AI:**
> In the `src/components` directory, optimize the rendering performance of the new components for this requirement. Apply `React.memo` to child components that render frequently to prevent unnecessary re-renders. Use the `useCallback` and `useMemo` hooks for functions and derived data that are passed as props. Implement lazy loading for any heavy components that are not required for the initial view.

### Task 4: TypeScript Enhancement & Unit/Component Testing (Vitest)
**Location:** `src/...` and `tests/...`
**Prompt for Firebase Studio AI:**
> In the `src` directory, finalize the feature by ensuring strict TypeScript typing is applied to all components, props, and data structures. Then, create a comprehensive **unit and component test suite** in the `tests` directory using **Vitest** and **React Testing Library**. The tests must achieve high code coverage and validate individual components and functions in isolation.

### Task 5: End-to-End (E2E) Testing (Playwright)
**Location:** `tests/`
**Prompt for Firebase Studio AI:**
> In the `tests` directory, create a new end-to-end test for the feature using **Playwright**. The test must simulate a complete user workflow in a real browser environment, from logging in to completing the primary action of the feature. The test should verify that the entire system (frontend, backend API, and database) works together correctly.