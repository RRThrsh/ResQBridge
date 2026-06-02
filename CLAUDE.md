# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Development: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview: `npm run preview`
- Tests: `npm test` (all), `npm run test:unit`, `npm run test:integration`, `npm run test:security`, `npm run test:sanity`, `npm run test:features`, `npm run test:coverage`

## Architecture
The project is a React application built with Vite, TypeScript, and Tailwind CSS.

### Project Structure
- `src/pages/`: Page-level components and routing endpoints (e.g., Dashboard, WildlifeGuide, ReportPage).
- `src/components/`: Reusable UI components.
    - `src/components/layout/`: Layout-specific components like `Navbar` and `Footer`.
    - `src/components/ui/`: Low-level UI primitive components (shadcn/ui).
- `src/context/`: Global state management using React Context (e.g., `AuthContext`).
- `src/hooks/`: Custom React hooks for shared logic (e.g., `useScrollToHash`).
- `src/lib/`: Utility functions and external library configurations.
- `src/data/`: Static data and mock information.
- `src/App.tsx`: Main application component, defines routing using `react-router-dom`.
- `src/main.tsx`: Application entry point.

### Routing
Routing is managed via `react-router-dom` in `App.tsx`, with a `RouteWrapper` used to handle specific behavior like scrolling to hash fragments on route changes.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
