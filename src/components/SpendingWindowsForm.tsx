import { useState } from 'react'
import type { SpendingWindow } from '../types'

interface Props {
  windows: SpendingWindow[]
  currentAge: number
  lifeExpectancy: number
  onChange: (windows: SpendingWindow[]) => void
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function SpendingWindowsForm({
  windows,
  currentAge,
  lifeExpectancy,
  onChange,
}: Props) {
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState(0)
  const [newStart, setNewStart] = useState(currentAge)
  const [newEnd, setNewEnd] = useState(currentAge + 5)

  const addWindow = () => {
    const w: SpendingWindow = {
      id: generateId(),
      name: newName.trim(),
      monthlyAmount: newAmount,
      startAge: newStart,
      endAge: newEnd,
    }
    onChange([...windows, w])
    setNewName('')
    setNewAmount(0)
    setNewStart(currentAge)
    setNewEnd(currentAge + 5)
  }

  const removeWindow = (id: string) => {
    onChange(windows.filter((w) => w.id !== id))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
        <span className="text-indigo-500 dark:text-indigo-400">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </span>
        <span>Custom Spending Periods</span>
      </h2>

      {windows.length === 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          No custom spending periods yet. Add costs like childcare, education, or mortgages.
        </p>
      )}

      {windows.map((w) => (
        <div
          key={w.id}
          className="flex items-start justify-between gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3"
          data-testid={`spending-window-${w.id}`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 truncate">{w.name}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-0.5">
              ₪{w.monthlyAmount.toLocaleString()}/mo · Age {w.startAge}–{w.endAge}
            </p>
          </div>
          <button
            onClick={() => removeWindow(w.id)}
            className="shrink-0 text-indigo-400 dark:text-indigo-500 hover:text-red-500 dark:hover:text-red-400 transition text-lg leading-none"
            aria-label={`Remove ${w.name}`}
          >
            ×
          </button>
        </div>
      ))}

      <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-3 space-y-3 bg-slate-50 dark:bg-slate-800">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Add Period</p>

        <input
          type="text"
          placeholder="Name (e.g. Kindergarten)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Spending period name"
        />

        <div className="flex items-center gap-2">
          <span className="text-slate-400 dark:text-slate-500 text-sm shrink-0">₪</span>
          <input
            type="number"
            placeholder="Monthly amount"
            value={newAmount || ''}
            onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
            min={0}
            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Monthly amount"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">From age</label>
            <input
              type="number"
              value={newStart}
              onChange={(e) => setNewStart(parseInt(e.target.value) || currentAge)}
              min={currentAge}
              max={lifeExpectancy - 1}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Start age"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">To age</label>
            <input
              type="number"
              value={newEnd}
              onChange={(e) => setNewEnd(parseInt(e.target.value) || currentAge + 5)}
              min={newStart + 1}
              max={lifeExpectancy}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="End age"
            />
          </div>
        </div>

        <button
          onClick={addWindow}
          disabled={!newName.trim() || newAmount <= 0 || newStart >= newEnd}
          className="w-full py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          aria-label="Add spending period"
        >
          + Add Period
        </button>
      </div>
    </div>
  )
}
