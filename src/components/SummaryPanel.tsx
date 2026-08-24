import type { SimulationResult } from '../types'
import { formatCurrency, getMonthlySavings } from '../engine/simulator'
import type { FinancialProfile } from '../types'

interface Props {
  result: SimulationResult
  retirementAge: number
  profile: FinancialProfile
}

interface MetricProps {
  label: string
  value: string
  sub?: string
  status?: 'good' | 'warn' | 'bad' | 'neutral'
}

export function Metric({ label, value, sub, status = 'neutral' }: MetricProps) {
  const colors = {
    good: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800',
    warn: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800',
    bad: 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800',
    neutral: 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600',
  }
  return (
    <div className={`rounded-lg border p-2.5 ${colors[status]}`}>
      <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
      <p className="text-lg font-bold leading-tight">{value}</p>
      {sub && <p className="text-xs mt-0.5 opacity-60">{sub}</p>}
    </div>
  )
}

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const WarnIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
)

const HERO_STYLE = {
  good: {
    wrap: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    icon: <CheckIcon />,
  },
  warn: {
    wrap: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    icon: <WarnIcon />,
  },
  bad: {
    wrap: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    icon: <XIcon />,
  },
}

export function SummaryPanel({ result, retirementAge, profile }: Props) {
  const mc = result.monteCarlo
  const successRate = mc ? Math.round(mc.successRate) : null
  const mcStatus: 'good' | 'warn' | 'bad' | undefined = mc
    ? successRate! >= 90 ? 'good' : successRate! >= 70 ? 'warn' : 'bad'
    : undefined

  const viabilityStatus = mc ? mcStatus! : (result.isViable ? 'good' : 'bad')
  const viabilityValue = mc ? `${successRate}%` : (result.isViable ? 'Yes' : `Age ${result.fundsDepletedAge}`)
  const viabilitySub = mc
    ? 'success rate (10,000 simulations)'
    : result.isViable
      ? `${result.yearsOfRetirement} years funded`
      : `${result.yearsOfRetirement} yrs before depletion`

  const retirementBalanceStatus =
    result.retirementBalance > 0
      ? result.retirementBalance > 500000
        ? 'good'
        : 'warn'
      : 'bad'

  const monthlySavings = getMonthlySavings(profile)
  const savingsRate =
    profile.monthlyIncome > 0
      ? Math.round((monthlySavings / profile.monthlyIncome) * 100)
      : 0
  const savingsStatus: 'good' | 'warn' | 'bad' =
    savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'warn' : 'bad'

  const hs = HERO_STYLE[viabilityStatus]

  return (
    <div className="space-y-3" data-testid="summary-panel">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2">
        Projection Summary
      </h2>

      <div className={`rounded-xl border p-4 ${hs.wrap}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${hs.iconBg} ${hs.text}`}>
            {hs.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold opacity-75 mb-0.5 ${hs.text}`}>
              {mc ? 'Success Rate' : 'Will Funds Last?'}
            </p>
            <p className={`text-2xl font-bold leading-none ${hs.text}`}>{viabilityValue}</p>
            <p className={`text-xs mt-1 opacity-60 ${hs.text}`}>{viabilitySub}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric
          label="Retirement Balance"
          value={formatCurrency(result.retirementBalance)}
          sub={`Age ${retirementAge}`}
          status={retirementBalanceStatus}
        />
        <Metric
          label="Years Funded"
          value={`${result.yearsOfRetirement} yrs`}
          status={result.isViable ? 'good' : 'warn'}
        />
        <Metric
          label="Monthly Savings"
          value={formatCurrency(monthlySavings)}
          sub={`${savingsRate}% savings rate`}
          status={savingsStatus}
        />
      </div>

      {!result.isViable && result.fundsDepletedAge !== null && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          <p className="font-semibold mb-1">Action needed</p>
          <p>
            At current projections, savings run out at age {result.fundsDepletedAge}. Consider
            increasing savings, reducing expenses, or adjusting retirement age.
          </p>
        </div>
      )}
    </div>
  )
}
