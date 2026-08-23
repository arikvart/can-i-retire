import { useState } from 'react'

interface Props {
  label: string
  value: number
  onChange: (value: number) => void
  prefix?: string
  min?: number
  max?: number
  step?: number
  suffix?: string
  helpText?: string
  useCommas?: boolean
}

export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  min = 0,
  max,
  step = 1,
  suffix,
  helpText,
  useCommas = false,
}: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const showOverlay = useCommas && !isFocused

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        {showOverlay && (
          <span
            aria-hidden="true"
            className={`absolute inset-0 flex items-center pointer-events-none text-sm text-slate-800 dark:text-slate-100 pr-8 ${prefix ? 'pl-7' : 'pl-3'}`}
          >
            {value.toLocaleString('en-US')}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          max={max}
          step={step}
          className={`w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2 pr-3 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
            prefix ? 'pl-7' : 'pl-3'
          } ${suffix ? 'pr-10' : 'pr-3'} ${showOverlay ? 'text-transparent dark:text-transparent' : 'dark:text-slate-100'}`}
          aria-label={label}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
    </div>
  )
}
