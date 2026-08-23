import { useState } from 'react'
import type { YearlySnapshot, SimulationResult } from '../types'
import { formatCurrency } from '../engine/simulator'

interface Props {
  snapshots: YearlySnapshot[]
  retirementAge: number
  pensionStartAge?: number
  monteCarlo?: SimulationResult['monteCarlo']
}

export function YearlyTable({ snapshots, retirementAge, pensionStartAge, monteCarlo = null }: Props) {
  const hasPensionGap = pensionStartAge !== undefined && pensionStartAge > retirementAge
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 10

  const totalPages = Math.ceil(snapshots.length / pageSize)
  const pageItems = snapshots.slice(page * pageSize, (page + 1) * pageSize)

  const fmt = (n: number) => formatCurrency(n)

  const mcByAge = monteCarlo
    ? new Map(monteCarlo.points.map((p) => [p.age, p]))
    : null

  return (
    <div className="space-y-2" data-testid="yearly-table">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-400 transition"
        aria-expanded={open}
        aria-controls="yearly-table-content"
      >
        <span className="flex items-center gap-2">
          <span className="text-indigo-500 dark:text-indigo-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
          </span>
          Year-by-Year Breakdown
        </span>
        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
          {open ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Expand
            </>
          )}
        </span>
      </button>

      {open && (
        <div id="yearly-table-content">
          <div className="overflow-x-auto overflow-y-auto max-h-80 rounded-lg border border-slate-100 dark:border-slate-700">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wide sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2">Age</th>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                  {mcByAge && (
                    <>
                      <th className="px-3 py-2 text-right text-indigo-400">P10</th>
                      <th className="px-3 py-2 text-right text-indigo-500">P50</th>
                      <th className="px-3 py-2 text-right text-indigo-400">P90</th>
                    </>
                  )}
                  <th className="px-3 py-2 text-right">Earned</th>
                  <th className="px-3 py-2 text-right">Returns</th>
                  <th className="px-3 py-2 text-right">Expenses</th>
                  <th className="px-3 py-2 text-right">Net</th>
                  <th className="px-3 py-2 text-center">Phase</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((s) => {
                  const isRetirementStart = s.age === retirementAge
                  const netPositive = s.annualSavings >= 0
                  const mc = mcByAge?.get(s.age)
                  return (
                    <tr
                      key={s.age}
                      className={`border-t border-slate-100 dark:border-slate-700 ${
                        isRetirementStart ? 'bg-amber-50 dark:bg-amber-900/20' : s.isRetired ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''
                      }`}
                      data-testid={`row-age-${s.age}`}
                    >
                      <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">{s.age}</td>
                      <td className="px-3 py-2 text-slate-400 dark:text-slate-500">{s.year}</td>
                      <td className="px-3 py-2 text-right font-medium text-indigo-700 dark:text-indigo-400">
                        {fmt(s.balance)}
                      </td>
                      {mcByAge && (
                        <>
                          <td className="px-3 py-2 text-right text-indigo-400 dark:text-indigo-500">
                            {mc ? fmt(mc.p10) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-indigo-600 dark:text-indigo-300">
                            {mc ? fmt(mc.p50) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-indigo-400 dark:text-indigo-500">
                            {mc ? fmt(mc.p90) : '—'}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400">{fmt(s.annualIncome)}</td>
                      <td className="px-3 py-2 text-right text-violet-600 dark:text-violet-400">{fmt(s.investmentReturn)}</td>
                      <td className="px-3 py-2 text-right text-rose-500 dark:text-rose-400">{fmt(s.annualExpenses)}</td>
                      <td
                        className={`px-3 py-2 text-right font-medium ${
                          netPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                        }`}
                      >
                        {netPositive ? '+' : ''}{fmt(s.annualSavings)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {(() => {
                          const inGap = s.isRetired && hasPensionGap && pensionStartAge !== undefined && s.age < pensionStartAge
                          if (!s.isRetired) return (
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Working</span>
                          )
                          if (inGap) return (
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Gap</span>
                          )
                          return (
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Retired</span>
                          )
                        })()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2"
              data-testid="table-pagination"
            >
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300 transition"
                aria-label="Previous page"
              >
                ← Prev
              </button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300 transition"
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
