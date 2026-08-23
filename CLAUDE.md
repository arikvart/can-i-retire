# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server at http://localhost:5173
npm run build        # tsc -b && vite build
npm run test         # run all tests once
npm run test:watch   # run tests in watch mode
npm run test:coverage  # run tests with v8 coverage report
npm run lint         # oxlint
```

Run a single test file:
```bash
npx vitest run src/components/SummaryPanel.test.tsx
```

Run tests matching a name pattern:
```bash
npx vitest run -t "investment return"
```

## Architecture

**Simulation engine** (`src/engine/simulator.ts`) is pure TypeScript with no React dependencies. All financial logic lives here: `runSimulation()` produces `YearlySnapshot[]` for every year from current age to life expectancy, `toRealValues()` deflates snapshots to today's purchasing power, `formatCurrency()` / `convertCurrency()` / `getMonthlySavings()` are utility exports. The engine is the only place that does math — components never compute financial values themselves.

**State** lives entirely in `App.tsx` via three `useLocalStorage` hooks (`cir-profile`, `cir-assumptions`, `cir-spending-windows`) plus a `isDark` boolean (`cir-darkmode`). The simulation result is a `useMemo` derived from those three inputs. `displaySnapshots` is a second `useMemo` that applies `toRealValues` when real mode is active. No global state, no context.

**Types** (`src/types.ts`) are excluded from coverage and from the app `tsconfig`. All shared interfaces live here: `YearlySnapshot` (includes `investmentReturn`), `SimulationResult`, `FinancialProfile`, `RetirementAssumptions`, `SpendingWindow`.

## Toolchain gotchas

**Two separate configs**: `vite.config.ts` uses `@vitejs/plugin-react` (Vite 8 / rolldown) for the production build. `vitest.config.ts` uses `esbuild: { jsx: 'automatic' }` instead — do **not** add `@vitejs/plugin-react` to `vitest.config.ts`; Vitest 3 bundles Vite 7 internally and the plugin's rolldown API is incompatible.

**localStorage in tests**: jsdom's `localStorage` doesn't support `vi.spyOn` on instance methods. `src/test/setup.ts` replaces `window.localStorage` entirely with a custom in-memory mock via `Object.defineProperty`. Access it in tests as `window.localStorage`. `beforeEach` calls `localStorageMock._reset()` and `vi.restoreAllMocks()`.

**Dark mode**: Tailwind v4 class-based dark mode is configured via `@custom-variant dark (&:is(.dark, .dark *))` in `src/index.css`. The `dark` class is toggled on `document.documentElement` by a `useEffect` in `App.tsx`.

**`tsconfig.app.json`** excludes `src/test/**` and `*.test.{ts,tsx}` to prevent `vi` / `beforeEach` globals from leaking into the production build.
