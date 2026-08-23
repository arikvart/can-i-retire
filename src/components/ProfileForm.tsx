import type { FinancialProfile } from '../types'
import { NumberInput } from './NumberInput'

interface Props {
  profile: FinancialProfile
  onChange: (profile: FinancialProfile) => void
}

export function ProfileForm({ profile, onChange }: Props) {
  const update = <K extends keyof FinancialProfile>(key: K, value: FinancialProfile[K]) =>
    onChange({ ...profile, [key]: value })

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
        <span className="text-indigo-500 dark:text-indigo-400">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </span>
        <span>Your Profile</span>
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Current Age"
          value={profile.currentAge}
          onChange={(v) => update('currentAge', v)}
          min={18}
          max={100}
          step={1}
          suffix="yrs"
        />

        <NumberInput
          label="Monthly Income"
          value={profile.monthlyIncome}
          onChange={(v) => update('monthlyIncome', v)}
          prefix="₪"
          min={0}
          step={500}
          useCommas
        />

        <NumberInput
          label="Monthly Expenses"
          value={profile.monthlyExpenses}
          onChange={(v) => update('monthlyExpenses', v)}
          prefix="₪"
          min={0}
          step={500}
          useCommas
        />

        <NumberInput
          label="Current Savings"
          value={profile.currentSavings}
          onChange={(v) => update('currentSavings', v)}
          prefix="₪"
          min={0}
          step={10000}
          useCommas
        />
      </div>
    </div>
  )
}
