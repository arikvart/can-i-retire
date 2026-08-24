import { useMemo, useEffect } from 'react'
import type { FinancialProfile, RetirementAssumptions, SpendingWindow } from './types'
import { runSimulation } from './engine/simulator'
import { ProfileForm } from './components/ProfileForm'
import { AssumptionsForm } from './components/AssumptionsForm'
import { SpendingWindowsForm } from './components/SpendingWindowsForm'
import { SummaryPanel } from './components/SummaryPanel'
import { RetirementChart } from './components/RetirementChart'
import { YearlyTable } from './components/YearlyTable'
import { useLocalStorage, clearLocalStorage } from './hooks/useLocalStorage'

const DEFAULT_PROFILE: FinancialProfile = {
  currentAge: 40,
  monthlyIncome: 25000,
  monthlyExpenses: 21000,
  currentSavings: 1000000,
}

const DEFAULT_ASSUMPTIONS: RetirementAssumptions = {
  retirementAge: 60,
  pensionStartAge: 67,
  lifeExpectancy: 90,
  inflationRate: 3,
  investmentReturnRate: 6.5,
  monthlyPension: 10000,
  returnStdDev: 0,
  inflationStdDev: 0,
  monteCarloEnabled: false,
}

const SunIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
)

const ResetIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
)

export default function App() {
  const [profile, setProfile] = useLocalStorage<FinancialProfile>('cir-profile', DEFAULT_PROFILE)
  const [assumptions, setAssumptions] = useLocalStorage<RetirementAssumptions>(
    'cir-assumptions',
    DEFAULT_ASSUMPTIONS
  )
  const [spendingWindows, setSpendingWindows] = useLocalStorage<SpendingWindow[]>(
    'cir-spending-windows',
    []
  )
  const [isDark, setIsDark] = useLocalStorage<boolean>('cir-darkmode', false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const handleReset = () => {
    clearLocalStorage('cir-profile')
    clearLocalStorage('cir-assumptions')
    clearLocalStorage('cir-spending-windows')
    setProfile(DEFAULT_PROFILE)
    setAssumptions(DEFAULT_ASSUMPTIONS)
    setSpendingWindows([])
  }

  const result = useMemo(
    () => runSimulation(profile, assumptions, spendingWindows),
    [profile, assumptions, spendingWindows]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="3,15 7,10 11,13 17,5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Can I Retire?</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight mt-0.5">Personal retirement simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDark}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
              {isDark ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Reset to defaults"
            >
              <ResetIcon />
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <aside className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-5">
            <ProfileForm profile={profile} onChange={setProfile} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-5">
            <AssumptionsForm
              assumptions={assumptions}
              profile={profile}
              onChange={setAssumptions}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-5">
            <SpendingWindowsForm
              windows={spendingWindows}
              currentAge={profile.currentAge}
              lifeExpectancy={assumptions.lifeExpectancy}
              onChange={setSpendingWindows}
            />
          </div>
        </aside>

        <section className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-5">
            <SummaryPanel
              result={result}
              retirementAge={assumptions.retirementAge}
              profile={profile}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-5">
            <RetirementChart
              snapshots={result.snapshots}
              retirementAge={assumptions.retirementAge}
              pensionStartAge={assumptions.pensionStartAge ?? assumptions.retirementAge}
              fundsDepletedAge={result.fundsDepletedAge}
              monteCarlo={result.monteCarlo}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 p-5">
            <YearlyTable
              snapshots={result.snapshots}
              retirementAge={assumptions.retirementAge}
              pensionStartAge={assumptions.pensionStartAge ?? assumptions.retirementAge}
              monteCarlo={result.monteCarlo}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
