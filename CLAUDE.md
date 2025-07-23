# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 9002
- `npm run build` - Build the production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on the codebase
- `npm run typecheck` - Run TypeScript compiler without emitting files

### Testing
- `npm run test` - Run Vitest unit tests (single run)
- `npm run test:watch` - Run Vitest in watch mode
- `npx playwright test` - Run Playwright E2E tests (requires server on localhost:9002)

## Project Architecture

### Framework & Technology Stack
- **Next.js 15** with App Router and TypeScript
- **Firebase**: Authentication, Firestore database, Cloud Storage
- **Internationalization**: Built-in i18n with `en` and `de` locales (middleware handles routing)
- **UI Components**: Radix UI primitives with Tailwind CSS and shadcn/ui components
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Authentication**: Multi-role system (dentist, lk_member, ozak_employee)

### Directory Structure
- `src/app/[locale]/` - Internationalized page routes
- `src/components/` - Reusable React components organized by feature
- `src/services/` - Business logic and external API interactions
- `src/data/` - Repository pattern implementation with Firebase
- `src/lib/` - Utilities, configurations, and shared libraries
- `src/types/` - TypeScript type definitions
- `locales/` - Translation files for German and English
- `tests/` - Contains project tests, organized into subdirectories:
    - `tests/unit_test/`: General unit tests.
    - `tests/data_tests/`: Unit tests for the data layer (e.g., Firebase repositories).
    - `tests/e2e_test/`: End-to-end tests using Playwright.
    - `tests/reports/`: Directory for test reports.

### Architecture Patterns

#### Repository Pattern
The data layer uses repository interfaces with Firebase implementations:
- All repositories are defined in `src/data/interfaces/`
- Firebase implementations in `src/data/firebase/`
- Exported instances available from `src/data/index.ts`
- Services layer (`src/services/`) consumes repositories

#### Authentication & Authorization
- Firebase Auth with role-based access control
- User types: `User` (auth context) and `Person` (Firestore document)
- Auth state managed in `src/context/auth-context.tsx`
- Role-based navigation configured in `src/config/nav.ts`

#### Internationalization
- Middleware handles locale routing (`/en/*`, `/de/*`)
- Translation files in `locales/[lang]/[namespace].json`
- Custom hook `use-client-translations.ts` for client-side translations

### Firebase Configuration
- Environment variables required for Firebase services
- Admin SDK used for server-side operations
- Storage organized with folders: `users/`, `document_templates/`, `logos/`
- Firestore indexes defined in `firestore.indexes.json`

### Form Handling
- React Hook Form with Zod validation
- Registration flow uses Zustand store (`lib/registrationStore.ts`)
- Multi-step forms with file uploads to Firebase Storage

### Key Configuration Files
- `next.config.mjs`: Server actions limit (10mb), TypeScript/ESLint ignore during builds
- `middleware.ts`: Locale detection and routing
- `vitest.config.ts`: Test configuration with jsdom environment
- `playwright.config.ts`: E2E test setup with authentication states

### Development Notes
- Development server runs on port 9002 (not default 3000)
- TypeScript and ESLint errors ignored during builds (see next.config.mjs)
- Playwright tests include global setup for user authentication
- Firebase emulators can be used for local development
- Image uploads support Firebase Storage and placeholder services