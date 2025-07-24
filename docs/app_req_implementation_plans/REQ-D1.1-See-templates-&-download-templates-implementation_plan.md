# Implementation Plan Templates for Dentist Portal

## REQ-D1.1: See templates & download templates

### Task 1: Repository & Data Layer Setup
**Prompt for AI:**
> Implement the data layer for this requirement by creating a repository interface in `src/data/interfaces/` and its Firebase implementation in `src/data/firebase/`. Export repository instance in `src/data/index.ts`. Follow the existing repository pattern and error handling approach. Create corresponding service layer functions in `src/services/` that consume the repository. Ensure all data operations include proper TypeScript typing and comprehensive error handling.

### Task 2: Server Components & UI Implementation
**Prompt for AI:**
> Implement the complete UI workflow for this requirement. Utilize relevant UI design file or ask for UI design file input. Create server components in `src/app/[locale]/` with async data fetching using the service layer. Build all necessary components in `src/components/` following the existing architectural patterns. Implement forms using React Hook Form with Zod validation, integrate internationalization using `use-client-translations` hook, and ensure consistent styling with Radix UI and Tailwind CSS. Include proper error handling and loading states.

### Task 3: Performance & Authentication Integration
**Prompt for AI:**
> Optimize the components for performance using React.memo, useCallback, and useMemo where appropriate. Integrate authentication and role-based access control using the existing auth context from `src/context/auth-context.tsx`. Implement proper loading states with Suspense boundaries and skeleton components. Add error boundaries and ensure all components follow React best practices for performance and user experience.

### Task 4: Data Layer Testing (Vitest)
**Prompt for AI:**
> Create comprehensive unit tests for the repository implementation in `tests/data_tests/`. Mock Firebase Admin SDK using dependency injection or manual mocks as needed, following the established patterns. Test all CRUD operations, error handling, and edge cases. Ensure tests achieve high code coverage and follow the established test structure and mocking patterns in the codebase.

### Task 5: Component Testing (Vitest + React Testing Library)
**Prompt for AI:**
> Create unit tests for all React components using Vitest and React Testing Library. Place these tests in the `tests/unit_test/` directory. Test user interactions, form validation, and error states. Test accessibility amd internationalization features. Use jsdom environment configured in vitest.config.tsfeatures. Mock external dependencies and services using Vitest's mocking capabilities. Ensure tests verify both functionality and user experience aspects of the components. Test reports should be configured to output to the `tests/reports/` directory.

### Task 6: End-to-End Testing (Playwright)
**Prompt for AI:**
> Create end-to-end tests using Playwright that simulate complete user workflows for this feature. Place these tests in the `tests/e2e_test/` directory. Use the existing authentication setup from `tests/e2e_test/global-setup.ts` and test with different user roles (dentist, lk_member, ozak_employee). Verify that the entire system (frontend, backend API, and database) works correctly. Ensure tests cover the primary user journeys and edge cases in a real browser environment. Test reports should be configured to output to the `tests/reports/` directory.
