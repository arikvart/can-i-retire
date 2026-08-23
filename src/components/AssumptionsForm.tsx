import type { FinancialProfile, RetirementAssumptions } from '../types'
import { NumberInput } from './NumberInput'

interface Props {
  assumptions: RetirementAssumptions
  profile: FinancialProfile
  onChange: (assumptions: RetirementAssumptions) => void
}

export function AssumptionsForm({ assumptions, profile, onChange }: Props) {
  const update = <K extends keyof RetirementAssumptions>(
    key: K,
    value: RetirementAssumptions[K]
  ) => onChange({ ...assumptions, [key]: value })

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
        <span className="text-indigo-500 dark:text-indigo-400">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
          </svg>
        </span>
        <span>Retirement Assumptions</span>
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Retirement Age"
          value={assumptions.retirementAge}
          onChange={(v) => update('retirementAge', v)}
          min={profile.currentAge + 1}
          max={100}
          step={1}
          suffix="yrs"
        />

        <NumberInput
          label="Pension Start"
          value={assumptions.pensionStartAge ?? assumptions.retirementAge}
          onChange={(v) => update('pensionStartAge', v)}
          min={18}
          max={assumptions.lifeExpectancy}
          step={1}
          suffix="yrs"
        />

        <NumberInput
          label="Life Expectancy"
          value={assumptions.lifeExpectancy}
          onChange={(v) => update('lifeExpectancy', v)}
          min={assumptions.retirementAge + 1}
          max={120}
          step={1}
          suffix="yrs"
        />

        <NumberInput
          label="Monthly Pension"
          value={assumptions.monthlyPension}
          onChange={(v) => update('monthlyPension', v)}
          prefix="₪"
          min={0}
          step={500}
          useCommas
        />

        <NumberInput
          label="Investment Return"
          value={assumptions.investmentReturnRate}
          onChange={(v) => update('investmentReturnRate', v)}
          min={0}
          max={30}
          step={0.1}
          suffix="%"
          helpText="Expected annual return before inflation"
        />

        <NumberInput
          label="Inflation Rate"
          value={assumptions.inflationRate}
          onChange={(v) => update('inflationRate', v)}
          min={0}
          max={20}
          step={0.1}
          suffix="%"
        />
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Monte Carlo
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={assumptions.monteCarloEnabled}
            aria-label="Enable Monte Carlo simulation"
            onClick={() => update('monteCarloEnabled', !assumptions.monteCarloEnabled)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
              assumptions.monteCarloEnabled
                ? 'bg-indigo-600'
                : 'bg-slate-200 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                assumptions.monteCarloEnabled ? 'translate-x-[18px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>
        {assumptions.monteCarloEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Return Std Dev"
              value={assumptions.returnStdDev}
              onChange={(v) => update('returnStdDev', v)}
              min={0}
              max={30}
              step={0.5}
              suffix="%"
            />
            <NumberInput
              label="Inflation Std Dev"
              value={assumptions.inflationStdDev}
              onChange={(v) => update('inflationStdDev', v)}
              min={0}
              max={10}
              step={0.5}
              suffix="%"
            />
          </div>
        )}
      </div>
    </div>
  )
}
