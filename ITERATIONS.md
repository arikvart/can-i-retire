# Retirement Simulator — Iteration Log

## Iteration 13 — Clean Chart Legend + Monte Carlo 10k (2026-08-24)

### Summary
Removed redundant vertical-line entries from the Wealth Projection legend (task 012). The reference lines already have inline labels ("Retire", "Pension", "Depleted") on the chart itself — showing them again in the legend was noise. Also bumped Monte Carlo from 1,000 to 10,000 iterations for tighter percentile bands. 212 tests, 100% coverage.

### What this iteration does
- **Task 012** (`RetirementChart.tsx`): Removed "Stop working", "Pension start", and "Funds depleted" legend rows. Only Balance, Income, Expenses, and Monte Carlo band remain in the legend — reference lines are self-labeled on the chart
- **Monte Carlo** (`simulator.ts`): Default `n` changed from 1000 → 10000. UI strings updated: "10,000 simulations" in `SummaryPanel.tsx` and `RetirementChart.tsx`
- **Tests** (`RetirementChart.test.tsx`): Flipped two legend tests from `getByText` to `queryByText(...not.toBeInTheDocument()`

### Evaluation
| Metric | Result |
|---|---|
| Tests | 212 passing |
| All coverage | 100% |
| Legend clutter | Removed 3 redundant entries |
| Monte Carlo accuracy | 10× more iterations, tighter bands |

---

## Iteration 12 — Final Tasks: Input Reorder, Default Values, Comma Currency (2026-08-23)

### Summary
Completed the three remaining open tasks: swapped Investment Return before Inflation Rate in the assumptions form, updated all default values to realistic Israeli user profile, and changed currency display throughout to full comma-separated numbers (₪1,000 instead of ₪1K). Chart Y-axis retains compact K/M format via new `formatCurrencyCompact`. 208 tests, 100% coverage.

### What this iteration does
- **Task 009 — Input order swap** (`AssumptionsForm.tsx`): Investment Return now precedes Inflation Rate in the 2-column grid. More natural order: return first, then the rate that erodes it
- **Task 010 — Updated defaults** (`App.tsx`): `DEFAULT_PROFILE` → age 40, income ₪15,000/mo, expenses ₪25,000/mo, savings ₪1,000,000. `DEFAULT_ASSUMPTIONS` → pension ₪10,000/mo. Expenses intentionally exceed income, reflecting a user drawing down savings in working years
- **Task 011 — Comma currency format** (`simulator.ts`): `formatCurrency` now uses `toLocaleString('en-US')` for full comma-separated display. New exported `formatCurrencyCompact` retains K/M abbreviations for the chart Y-axis (`RetirementChart.tsx`). All table cells (YearlyTable, SummaryPanel metrics) auto-pick up the new format
- **Tests updated**: `simulator.test.ts` (renamed assertions + new `formatCurrencyCompact` describe block adding 5 tests), `SummaryPanel.test.tsx`, `YearlyTable.test.tsx`, `AssumptionsForm.test.tsx` (swapped input indices for inflation/investment tests)

### Evaluation
| Metric | Result |
|---|---|
| Tests | 208 passing (+5 from formatCurrencyCompact) |
| All coverage | 100% |
| Build | Clean |
| Currency in tables | Full commas: ₪1,000,000 not ₪1M |
| Chart Y-axis | Compact: ₪1M, ₪500K (unaffected, readable) |
| Input order | Investment Return → Inflation Rate |
| Defaults on reset | Age 40, ₪15K income, ₪25K expenses, ₪1M savings, ₪10K pension |

---

## Iteration 11 — Split Retirement Age from Pension Start Age (2026-08-23)

### Summary
Split the single `retirementAge` into two independent fields: the age you stop working (`retirementAge`) and the age your pension income begins (`pensionStartAge`). When the two differ, the simulator models a gap period with no income, the chart shows a separate "Pension" reference line, and the year-by-year table shows "Gap" phase badges. 203 tests, 100% coverage.

### What this iteration does
- **`types.ts`**: Added `pensionStartAge?: number` (optional for backward compat with old localStorage data)
- **`simulator.ts`** (both deterministic and MC paths): Income now computed as `salary (if !retired) + pension (if age >= pensionStartAge)`. Default: `pensionStartAge ?? retirementAge` for existing data. Supports pension before retirement (supplements salary), gap period (retired but no pension), or same-age (original behavior unchanged)
- **`AssumptionsForm.tsx`**: New "Pension Start" input paired with "Retirement Age" in row 1 of the 2-column grid. Min 18, max lifeExpectancy. Falls back to `retirementAge` value when `pensionStartAge` is undefined
- **`RetirementChart.tsx`**: Shows optional emerald "Pension" reference line + "Pension start" legend entry when `pensionStartAge !== retirementAge`. Legend "Retirement start" renamed to "Stop working" for clarity
- **`YearlyTable.tsx`**: New "Gap" phase badge (orange) shown for rows where `isRetired && age < pensionStartAge`. Only active when `pensionStartAge > retirementAge`
- **`App.tsx`**: `DEFAULT_ASSUMPTIONS` includes `pensionStartAge: 67`; both `RetirementChart` and `YearlyTable` receive `pensionStartAge` prop

### Evaluation
| Metric | Result |
|---|---|
| Tests | 203 passing |
| All coverage | 100% |
| Build | Clean |
| Pension gap simulation | No income in gap years, correctly draws down savings |
| Pension before retirement | Pension supplements salary in working years |
| Chart reference line | Emerald "Pension" line appears only when ages differ |
| Gap badge | Orange "Gap" in year-by-year table for pension-less retired rows |
| Backward compat | Old localStorage data without `pensionStartAge` defaults to `retirementAge` |

---

## Iteration 10 — Visual Redesign: Competitive Analysis + Applied Improvements (2026-08-23)

### Summary
Fetched and graded the three leading retirement calculator sites (ProjectionLab, NerdWallet, SmartAsset) against six criteria. Applied all relevant findings: summary-first layout, full-width hero viability card, SVG section icons, logo-mark header, stronger card shadows, and improved input border contrast. 192 tests, 100% coverage.

### Competitive Analysis

Fetched live content from projectionlab.com, nerdwallet.com/calculator/retirement-calculator, and smartasset.com/retirement/retirement-calculator.

| Criterion | ProjectionLab | NerdWallet | SmartAsset | Our app (pre-iter-10) |
|---|---|---|---|---|
| **Ease of use** | 8/10 — feature-rich, some learning curve | 9/10 — minimal form, smart % presets, single Calculate button | 8/10 — 3-panel wizard, sequential input reduces overwhelm | 6/10 — all inputs exposed at once, no guidance |
| **Ease of understanding** | 8/10 — excellent charts, some expert jargon | 9/10 — Graph/Summary toggle, result is the first thing shown | 9/10 — prominent "on track / off track" verdict with color | 6/10 — answer buried below chart, small tiles |
| **Usage rate** | Med — FIRE/advanced users | Very high — mass consumer finance audience | High — mainstream financial content site | N/A |
| **Color scheme** | 9/10 — sophisticated gradient palette, consistent accent | 8/10 — clean teal/neutral, trustworthy, branded | 7/10 — functional but generic financial services look | 7/10 — indigo/slate good but cards blended into bg |
| **Structure** | 9/10 — key outcome prominent before charts, excellent hierarchy | 8/10 — two-column, form left / results right, result leads | 8/10 — panels flow logically from personal → savings → goals | 6/10 — chart came before answer, card shadow too flat |
| **Easy on the eye** | 9/10 — minimalist, chart-forward, generous whitespace, medium shadows | 8/10 — clean, low visual clutter, visible input borders | 7/10 — clean but less visually distinctive | 6/10 — shadow-sm too flat, input borders barely visible |

### What was applied from each site

**From ProjectionLab + Empower:** Cards upgraded from `shadow-sm border-slate-100` → `shadow border-slate-200`. Cards now visibly lift off the gradient background, matching the card depth those sites use.

**From NerdWallet:** Result shown before chart (Summary → Chart → Table order). Input borders strengthened from `border-slate-200` → `border-slate-300` for clearly visible field boundaries. Icon-labelled header buttons.

**From SmartAsset:** Hero viability card (full-width, color-coded ✓/⚠/✕ + large answer value) directly mirrors their "on track / off track" verdict card. SVG section icons added for scannable sidebar.

### What this iteration does
- **Summary first**: Right column order changed to Summary → Chart → Table — answer visible before scrolling
- **Hero viability card**: Full-width card with circular status icon, large "Yes / Age 80 / 87%", sub-line. Emerald/amber/red for good/warn/bad. Works for both deterministic and MC modes
- **3-column secondary metrics**: Retirement Balance, Years Funded, Monthly Savings in a single row below hero
- **Section header icons**: Inline SVG icons on all 5 section headers (person, sliders, calendar, bar-chart, table)
- **Header logo mark**: Indigo square with trend-line SVG; Dark/Reset buttons gain sun/moon/reset SVG icons
- **YearlyTable toggle**: ASCII ▲▼ replaced with chevron SVGs
- **Card shadows**: `shadow-sm border-slate-100` → `shadow border-slate-200` on all cards
- **Input border contrast**: `border-slate-200` → `border-slate-300` in NumberInput and SpendingWindowsForm

### Evaluation
| Metric | Result |
|---|---|
| Tests | 192 passing |
| All coverage | 100% |
| Build | Clean |
| Summary position | First in right column — answer visible on load |
| Hero card | Large YES in emerald, Age 80 in red, 87% in emerald/amber/red |
| Section icons | All 5 sections have matching indigo SVG icons |
| Card depth | Visible shadow lifts cards off gradient background |
| Input clarity | `border-slate-300` makes fields clearly scannable |

---

## Iteration 9 — Remove USD, Fix Table Layout, Drop Nominal/Real Toggle (2026-08-23)

### Summary
Removed all USD currency support, fixed the year-by-year table layout shift by constraining its height, and removed the Nominal/Real toggle to keep only the nominal (future money) view. 192 tests, 100% coverage.

### What this iteration does
- **Remove USD (task 005)**: `Currency` type and `currency` field removed from `FinancialProfile`; `exchangeRate` removed from `RetirementAssumptions`; `convertCurrency` removed from simulator; `formatCurrency` simplified to hardcode `₪`; `CurrencyToggle` replaced with a no-op; exchange rate input removed from `AssumptionsForm`; `NumberInput` `currency` prop replaced with `prefix?: string`; all components updated to remove currency props; `App.tsx` no longer imports or renders `CurrencyToggle`
- **Fix table layout shift (task 006)**: `YearlyTable` expanded content now has `max-h-80 overflow-y-auto` on the table container, constraining expansion to 320px with internal scroll instead of growing the page. `<thead>` made `sticky top-0 z-10` to keep headers visible while scrolling
- **Nominal-only view (task 007)**: Removed `showReal` state, `displaySnapshots` memo, and `toRealValues` import from `App.tsx`. Removed `toRealValues` function from `simulator.ts`. Removed `showReal`/`onToggleReal` props and the toggle button group from `RetirementChart`. Chart always displays nominal (future money) values

### Evaluation
| Metric | Result |
|---|---|
| Tests | 192 passing |
| All coverage | 100% |
| Build | Clean |
| USD removed | No currency toggle, no exchange rate input, all values in ₪ |
| Table layout | Scrollable within fixed height, no page reshift on expand |
| Nominal-only | Toggle buttons gone, snapshots passed directly to chart/table |

---

## Iteration 8 — Monte Carlo Toggle + Year-by-Year MC Columns (2026-08-23)

### Summary
Added an explicit toggle to enable/disable Monte Carlo simulation (instead of auto-enabling via std devs), bumped to 1000 simulations, hid std dev inputs when MC is off, and extended the year-by-year breakdown table with P10/P50/P90 balance columns when MC is active. 224 tests, 100% coverage.

### What this iteration does
- **MC toggle**: `monteCarloEnabled: boolean` added to `RetirementAssumptions`. A pill toggle switch in the MC section header enables/disables MC. Std dev inputs are only shown when the toggle is on
- **1000 simulations**: `runMonteCarlo` default `n` changed from 500 → 1000. All "1000 simulations" strings updated everywhere
- **MC-gated early exit**: `runMonteCarlo` returns null when `monteCarloEnabled` is false (checked before std dev check). `?? false` null-coalescing handles old localStorage data missing the field
- **P10/P50/P90 columns in table**: `YearlyTable` accepts optional `monteCarlo` prop. When active, three extra columns (P10, P50, P90) appear after Balance, showing percentile balances per age. Rows with no matching MC point show "—"
- **App wiring**: `DEFAULT_ASSUMPTIONS` includes `monteCarloEnabled: false`; `monteCarlo={result.monteCarlo}` passed to `YearlyTable`

### Evaluation
| Metric | Result |
|---|---|
| Tests | 224 passing |
| All coverage | 100% |
| Build | Clean |
| MC toggle | Toggle shows/hides std dev fields; disabling returns to deterministic simulation |
| 1000 simulations | Confidence band and success rate computed from 1000 runs |
| P10/P50/P90 in table | Columns appear when MC active, "—" for ages without MC data |
| Visual | Chart band + success rate panel + table columns all render correctly |

### Issues found and resolved
- Playwright `$$('input[type=number]')` returns ALL page inputs (14 total across profile, assumptions, spending windows forms) — `inputs[5]` was Life Expectancy, not Return Std Dev. Fixed screenshot script to use `page.getByLabel('Return Std Dev')`
- P50 test value collided with Balance column value (`₪500K`) causing `getMultipleElementsFoundError` — changed P50 test value to `₪550K`

---

## Iteration 7 — Monte Carlo Simulation + Compact Forms (2026-08-23)

### Summary
Added Monte Carlo simulation with configurable standard deviations for investment return and inflation. Chart shows a 10th–90th percentile confidence band when MC is active. Summary panel switches to success rate display. Both Profile and Assumptions panels compacted to 2-column grid layouts. 212 tests, 100% coverage.

### What this iteration does
- **Monte Carlo engine**: `randomNormal` (Box-Muller), `getPercentile` (linear interpolation), `runMonteCarlo` (500 simulations per run) added to `simulator.ts`. Null when both std devs are 0 — deterministic simulation unchanged
- **Configurable std devs**: `RetirementAssumptions` gains `returnStdDev` and `inflationStdDev` fields. AssumptionsForm exposes a "Monte Carlo" section with these two inputs (step 0.5%, "0 = off" help text)
- **Confidence band on chart**: When MC active, stacked Area components (`mcBase`/`mcLow`/`mcMid`/`mcHigh`) render a 10th–90th percentile fan in indigo. Balance line changes to no-fill. MC keys filtered from tooltip. "500 simulations" subtitle shown
- **Success rate in summary**: When MC active, "Will Funds Last?" tile becomes "Success Rate" showing % with good/warn/bad color thresholds (≥90/70-89/<70)
- **Compact Profile form**: Changed from stacked layout to `grid grid-cols-2 gap-3` — all 4 fields in 2×2 grid, help text removed
- **Compact Assumptions form**: Same 2-column grid, help text trimmed, exchange rate field shown only for USD, MC section appended after border divider

### Evaluation
| Metric | Result |
|---|---|
| Tests | 212 passing |
| All coverage | 100% |
| Build | Clean |
| MC chart band | Visible indigo fan on chart when std dev > 0 |
| MC summary | Success rate % with color status replaces Yes/No |
| Compact forms | Profile: 2×2 grid; Assumptions: 2-column with MC section |
| MC off by default | returnStdDev=0 / inflationStdDev=0 → deterministic simulation unchanged |

### Issues found and resolved
- `getByText(/success rate/i)` matched both label ("Success Rate") and sub text ("success rate (500 simulations)") — fixed test to use specific regex `/success rate \(500 simulations\)/i`
- `getPercentile` empty-array and `lower===upper` branches unreachable via `runMonteCarlo` with n=500 — exported function and added direct unit tests

---

## Iteration 6 — Dark Mode, Income Split, Compact Summary (2026-08-23)

### Summary
Added full dark mode support, split the yearly table's "Income" column into "Earned" (salary/pension) and "Returns" (investment return), and compacted the Projection Summary from a stacked layout into a tighter 2×2 metric grid. 182 tests, 100% coverage.

### What this iteration does
- **Dark mode**: Toggle in header persists to localStorage. Adds `.dark` class to `<html>` and activates Tailwind `dark:` variants across all components — cards, inputs, table, chart tooltip, metric badges, phase badges, currency/nominal-real toggles
- **Income split**: `YearlySnapshot` gains `investmentReturn` field. Simulator captures `balance × (returnRate - 1)` per year. Table shows "Earned" (salary/pension, green) and "Returns" (investment return, violet) as separate columns. `toRealValues` deflates both fields
- **Compact summary**: `Projection Summary` changed from stacked 2-col + 2 full-width cards to a single 2×2 grid. `Metric` component uses `p-2.5` / `text-lg` instead of `p-3` / `text-xl`. "Balance at Retirement (Age X)" label split into title "Retirement Balance" + sub "Age X"

### Evaluation
| Metric | Result |
|---|---|
| Tests | 182 passing |
| All coverage | 100% |
| Build | Clean |
| Dark mode | Toggles correctly, persists, all components themed |
| Income split | Earned + Returns columns in table, correct values |
| Summary | Compact 2×2 grid, all key metrics visible at a glance |

---

## Iteration 5 — Dark Mode (2026-08-23)

### Summary
*(Folded into Iteration 6 above)*

---

## Iteration 2 — Cash Flow Chart, Real/Nominal Toggle, Persistence (2026-08-23)

### Summary
Added a second chart (monthly cash flow — income vs expenses vs net savings), Nominal/Real toggle to deflate chart values to today's purchasing power, localStorage persistence across sessions, and a monthly savings rate metric in the summary panel. Fixed a redundant duplicate branch in the simulation loop. Achieved 163 tests, 100% coverage.

### What this iteration does
- **localStorage persistence**: All profile, assumptions, and spending window state is persisted via a `useLocalStorage` hook and restored on page load
- **Monthly Cash Flow chart**: Bar chart showing income vs expenses per month + a net savings line — makes the working vs retirement income cliff visually obvious
- **Real/Nominal toggle**: Deflates chart values by inflation to show today's purchasing power (Real mode) vs raw future money (Nominal mode)
- **Monthly savings metric**: Summary panel now shows current monthly savings amount and savings rate (%, color-coded: green ≥20%, amber 10-19%, red <10%)
- **Fixed simulation bug**: Removed duplicate if/else branches that computed identical results
- **TypeScript cleanup**: Separated test/app tsconfigs; removed unused `useEffect` import

### Evaluation
| Metric | Result |
|---|---|
| Tests | 163 passing |
| Statement coverage | 100% |
| Branch coverage | 100% |
| Function coverage | 100% |
| Line coverage | 100% |
| Build | Clean |
| Cash flow chart | Visible, correct income/expense bars + net savings line |
| Real/Nominal toggle | Functional — deflates all values by inflation rate |
| localStorage | State persists across page reload |
| Monthly savings | ₪8K/mo shown, 40% savings rate (green) |

### Issues found and resolved
- `vi.clearAllMocks()` in test setup didn't restore spy implementations — changed to `vi.restoreAllMocks()`
- `window.localStorage` in jsdom doesn't support `vi.spyOn` on instance methods — replaced with a custom `createLocalStorageMock()` in setup.ts
- TypeScript `noUnusedLocals` flagged `useEffect` import in hook — removed
- Test/app tsconfig conflict caused build to include test files — added explicit `exclude` to tsconfig.app.json

---


## Iteration 4 — Reset Button, Exchange Rate, Page Title (2026-08-23)

### Summary
Added a Reset to Defaults button in the header, a USD/NIS exchange rate input that appears when USD is selected, and corrected the page title. 189 tests, 100% coverage across all metrics.

### What this iteration does
- **Reset button**: Header button clears all localStorage state and reverts to factory defaults
- **Exchange rate input**: Appears in Retirement Assumptions when USD is selected; allows user to configure the NIS/USD conversion rate (default 3.7)
- **Page title**: Updated from `caniretire-temp` to "Can I Retire? — Personal Retirement Simulator"

### Evaluation
| Metric | Result |
|---|---|
| Tests | 189 passing |
| All coverage | 100% |
| Build | Clean |
| Reset button | Clears localStorage and resets all state |
| Exchange rate | Shows only when USD selected, updates assumptions |
| Page title | Correct in browser tab |

---

## Iteration 3 — Year-by-Year Breakdown Table (2026-08-23)

### Summary
Added a collapsible year-by-year data table with pagination, Working/Retired phase badges, color-coded net savings, and retirement-start row highlighting. Fixed a critical vitest/vite version conflict (Vite 8 vs Vite 7 bundled in Vitest 3) by switching the JSX transform to esbuild in vitest.config.ts. 184 tests, 100% coverage.

### What this iteration does
- **YearlyTable component**: Collapsible table under the summary panel showing every simulated year with: age, calendar year, balance, income, expenses, net savings (+/- colored), and a Working/Retired badge
- **Pagination**: 10 rows per page with Prev/Next controls (only shown when >10 rows)
- **Retirement start highlight**: Amber background on the retirement start row for visual emphasis
- **Vitest/Vite fix**: Replaced `@vitejs/plugin-react` (requires Vite 8/rolldown) in vitest config with `esbuild: { jsx: 'automatic' }` to work with Vitest 3's bundled Vite 7

### Evaluation
| Metric | Result |
|---|---|
| Tests | 184 passing |
| All coverage metrics | 100% |
| Build | Clean |
| Yearly table | Correct data, paginated, phase badges |
| Retirement row highlight | Amber background at retirement start age |
| Real/Nominal toggle | Deflated values appear in table when Real mode selected |

### Issues found and resolved
- All 141 component tests suddenly failed with "React is not defined" after adding YearlyTable → caused by vitest.config.ts importing `@vitejs/plugin-react@6.0.4` (Vite 8 rolldown API) but vitest 3 bundles Vite 7 → fixed by using `esbuild.jsx: 'automatic'` instead

---

## Iteration 1 — Foundation Build (2026-08-23)

### Summary
Complete initial implementation from scratch: React + TypeScript + Vite + Recharts + Tailwind CSS v4. Achieved 100% test coverage (107 tests across statements, branches, functions, lines).

### What this iteration does
- Scaffolds the full project structure (Vite + React 19 + TypeScript 6 + Tailwind CSS 4)
- Implements the core financial simulation engine (`src/engine/simulator.ts`)
- Creates all UI components: ProfileForm, AssumptionsForm, SpendingWindowsForm, RetirementChart, SummaryPanel, CurrencyToggle, NumberInput
- Adds NIS (₪) and USD ($) currency support with a toggle
- Visualizes wealth projection with Recharts AreaChart (balance, income, expenses over time)
- Shows retirement start (amber dashed line) and optional funds-depletion marker (red dashed line)
- Adds custom spending periods (e.g. kindergarten, university) with age range and monthly amount
- Implements summary panel with viability status, retirement balance, and years-of-retirement metrics

### Evaluation
| Metric | Result |
|---|---|
| Tests | 107 passing |
| Statement coverage | 100% |
| Branch coverage | 100% |
| Function coverage | 100% |
| Line coverage | 100% |
| Build | Clean (tsc -b + vite build) |
| Visual render | Correct — ₪20.2M at retirement, "Yes" for 24 years funded |
| NIS support | ₪ prefix throughout, default currency |
| USD support | $ toggle works |
| Custom spending | Add/remove periods with name, amount, age range |
| Chart | Area chart with retirement reference line, legend |

### Issues found and resolved
- TypeScript build error: `viabilityLabel` declared but unused — removed
- TypeScript build error: Vitest `test` config in `vite.config.ts` caused type clash — split into separate `vitest.config.ts`
- Test failure: `zero investment return` test had wrong expected balance (age 61 vs age 60) — corrected
- Test failure: `shows depletion age in action text` matched multiple elements — used `getAllByText`
- Coverage gap: `addWindow` guard `!newName.trim() || newAmount <= 0` unreachable (button already disabled) — removed redundant guard
- Coverage gap: `formatY` closure in `RetirementChart` not called by mocked YAxis — updated mock to invoke `tickFormatter`

### Architecture decisions
- Core simulation engine is pure TypeScript functions (no React dependencies), making it fully unit-testable
- Inflation and investment returns applied per year as multipliers
- Spending windows use `startAge <= age < endAge` semantics (exclusive end)
- Balance clamped to 0 in snapshots (visual only), but actual depletion tracked separately
- Currency conversion utility provided but conversion at input time is the UX approach (user enters values in selected currency)
