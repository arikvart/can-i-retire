import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { YearlySnapshot, SimulationResult } from '../types'
import { formatCurrencyCompact } from '../engine/simulator'

const MC_KEYS = new Set(['mcBase', 'mcBand'])

interface Props {
  snapshots: YearlySnapshot[]
  retirementAge: number
  pensionStartAge?: number
  fundsDepletedAge: number | null
  monteCarlo: SimulationResult['monteCarlo']
}

interface TooltipPayload {
  value: number
  name: string
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: number
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const visible = payload.filter((e) => !MC_KEYS.has(e.name))
  if (!visible.length) return null

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Age {label}</p>
      {visible.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-3">
          <span style={{ color: entry.color }} className="text-xs">
            {entry.name}
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-100 text-xs">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RetirementChart({
  snapshots,
  retirementAge,
  pensionStartAge,
  fundsDepletedAge,
  monteCarlo,
}: Props) {
  const mcByAge = monteCarlo
    ? new Map(monteCarlo.points.map((p) => [p.age, p]))
    : null

  const maxBalance = Math.max(...snapshots.map((s) => s.balance), 0)
  const yMax = maxBalance * 1.1

  const data = snapshots.map((s) => {
    const mc = mcByAge?.get(s.age)
    if (mc) {
      const p10c = Math.min(Math.round(mc.p10), yMax)
      const p90c = Math.min(Math.round(mc.p90), yMax)
      return {
        age: s.age,
        Balance: Math.round(s.balance),
        Income: Math.round(s.annualIncome),
        Expenses: Math.round(s.annualExpenses),
        mcBase: p10c,
        mcBand: p90c - p10c,
      }
    }
    return {
      age: s.age,
      Balance: Math.round(s.balance),
      Income: Math.round(s.annualIncome),
      Expenses: Math.round(s.annualExpenses),
    }
  })

  const formatY = (value: number) => formatCurrencyCompact(value)

  return (
    <div className="space-y-2" data-testid="retirement-chart">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-indigo-500 dark:text-indigo-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </span>
            Wealth Projection
          </h2>
          {monteCarlo && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Shaded band: 10th–90th percentile (5,000 simulations)
            </p>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Age', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            width={70}
            domain={[0, yMax]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={retirementAge}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: 'Retire', position: 'top', fontSize: 10, fill: '#f59e0b' }}
          />
          {pensionStartAge !== undefined && pensionStartAge !== retirementAge && (
            <ReferenceLine
              x={pensionStartAge}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: 'Pension', position: 'top', fontSize: 10, fill: '#10b981' }}
            />
          )}
          {fundsDepletedAge !== null && (
            <ReferenceLine
              x={fundsDepletedAge}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'Depleted', position: 'top', fontSize: 10, fill: '#ef4444' }}
            />
          )}
          {monteCarlo && <Area type="monotone" dataKey="mcBase" stackId="mc" fill="transparent" stroke="none" dot={false} activeDot={false} legendType="none" />}
          {monteCarlo && <Area type="monotone" dataKey="mcBand" stackId="mc" fill="#6366f1" fillOpacity={0.25} stroke="none" dot={false} activeDot={false} legendType="none" />}
          <Area
            type="monotone"
            dataKey="Balance"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill={monteCarlo ? 'none' : 'url(#balanceGrad)'}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="Income"
            stroke="#10b981"
            strokeWidth={1.5}
            fill="none"
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Area
            type="monotone"
            dataKey="Expenses"
            stroke="#f43f5e"
            strokeWidth={1.5}
            fill="none"
            dot={false}
            activeDot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 px-2">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-indigo-500"></span>
          Balance
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-emerald-500"></span>
          Income
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-rose-500"></span>
          Expenses
        </span>
        {monteCarlo && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-indigo-300 opacity-60"></span>
            Monte Carlo band
          </span>
        )}
      </div>
    </div>
  )
}
