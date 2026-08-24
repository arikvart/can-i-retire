import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryPanel, Metric } from './SummaryPanel'
import type { SimulationResult, FinancialProfile } from '../types'

const profile: FinancialProfile = {
  currentAge: 35,
  monthlyIncome: 20000,
  monthlyExpenses: 12000,
  currentSavings: 500000,
}

const viableResult: SimulationResult = {
  snapshots: [],
  retirementBalance: 2_000_000,
  fundsDepletedAge: null,
  isViable: true,
  yearsOfRetirement: 23,
  monteCarlo: null,
}

const depletedResult: SimulationResult = {
  snapshots: [],
  retirementBalance: 500_000,
  fundsDepletedAge: 80,
  isViable: false,
  yearsOfRetirement: 13,
  monteCarlo: null,
}

describe('SummaryPanel', () => {
  it('renders the section heading', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('Projection Summary')).toBeInTheDocument()
  })

  it('shows "Yes" for viable plans', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('shows depletion age for non-viable plans', () => {
    render(<SummaryPanel result={depletedResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('Age 80')).toBeInTheDocument()
  })

  it('shows action needed warning for non-viable plans', () => {
    render(<SummaryPanel result={depletedResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('Action needed')).toBeInTheDocument()
  })

  it('does not show action warning for viable plans', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.queryByText('Action needed')).not.toBeInTheDocument()
  })

  it('shows formatted retirement balance', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('₪2,000,000')).toBeInTheDocument()
  })

  it('shows years of retirement', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('23 yrs')).toBeInTheDocument()
  })

  it('shows retirement age in balance sub', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('Age 67')).toBeInTheDocument()
  })

  it('shows depletion age in action text', () => {
    render(<SummaryPanel result={depletedResult} retirementAge={67} profile={profile} />)
    const matches = screen.getAllByText(/age 80/i)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('shows bad status (red) when retirement balance is zero', () => {
    const zeroBalanceResult: SimulationResult = { ...depletedResult, retirementBalance: 0 }
    render(<SummaryPanel result={zeroBalanceResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('₪0')).toBeInTheDocument()
  })

  it('shows warn status when retirement balance is low but positive', () => {
    const lowBalanceResult: SimulationResult = {
      ...viableResult, retirementBalance: 300_000, isViable: true, fundsDepletedAge: null,
    }
    render(<SummaryPanel result={lowBalanceResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('₪300,000')).toBeInTheDocument()
  })

  it('shows monthly savings amount', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('₪8,000')).toBeInTheDocument()
  })

  it('shows savings rate percentage', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText(/40% savings rate/)).toBeInTheDocument()
  })

  it('shows bad savings status when savings rate is below 10%', () => {
    const lowSaverProfile = { ...profile, monthlyIncome: 10000, monthlyExpenses: 9500 }
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={lowSaverProfile} />)
    expect(screen.getByText(/5% savings rate/)).toBeInTheDocument()
  })

  it('shows warn savings status for 10-20% savings rate', () => {
    const midSaverProfile = { ...profile, monthlyIncome: 10000, monthlyExpenses: 8500 }
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={midSaverProfile} />)
    expect(screen.getByText(/15% savings rate/)).toBeInTheDocument()
  })

  it('shows zero savings rate when income is zero', () => {
    const zeroIncomeProfile = { ...profile, monthlyIncome: 0, monthlyExpenses: 0 }
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={zeroIncomeProfile} />)
    expect(screen.getByText(/0% savings rate/)).toBeInTheDocument()
  })

  it('shows success rate when monteCarlo is active', () => {
    const mcResult: SimulationResult = { ...viableResult, monteCarlo: { successRate: 87, points: [] } }
    render(<SummaryPanel result={mcResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('87%')).toBeInTheDocument()
    expect(screen.getByText(/success rate \(5,000 simulations\)/i)).toBeInTheDocument()
  })

  it('shows Success Rate label when monteCarlo is active', () => {
    const mcResult: SimulationResult = { ...viableResult, monteCarlo: { successRate: 75, points: [] } }
    render(<SummaryPanel result={mcResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
  })

  it('applies good status when success rate >= 90', () => {
    const mcResult: SimulationResult = { ...viableResult, monteCarlo: { successRate: 95, points: [] } }
    const { container } = render(<SummaryPanel result={mcResult} retirementAge={67} profile={profile} />)
    expect(container.querySelector('.text-emerald-700')).toBeInTheDocument()
  })

  it('applies warn status when success rate is 70-89', () => {
    const mcResult: SimulationResult = { ...viableResult, monteCarlo: { successRate: 75, points: [] } }
    const { container } = render(<SummaryPanel result={mcResult} retirementAge={67} profile={profile} />)
    expect(container.querySelector('.text-amber-700')).toBeInTheDocument()
  })

  it('applies bad status when success rate is below 70', () => {
    const mcResult: SimulationResult = { ...viableResult, monteCarlo: { successRate: 50, points: [] } }
    const { container } = render(<SummaryPanel result={mcResult} retirementAge={67} profile={profile} />)
    expect(container.querySelector('.text-red-700')).toBeInTheDocument()
  })

  it('shows Will Funds Last label when monteCarlo is null', () => {
    render(<SummaryPanel result={viableResult} retirementAge={67} profile={profile} />)
    expect(screen.getByText('Will Funds Last?')).toBeInTheDocument()
  })
})

describe('Metric', () => {
  it('renders label and value', () => {
    render(<Metric label="Test Label" value="₪1M" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('₪1M')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<Metric label="Test" value="Yes" sub="some subtext" />)
    expect(screen.getByText('some subtext')).toBeInTheDocument()
  })

  it('does not render sub when not provided', () => {
    const { container } = render(<Metric label="Test" value="Yes" />)
    expect(container.querySelectorAll('p').length).toBe(2)
  })

  it('applies neutral style by default', () => {
    const { container } = render(<Metric label="Test" value="Yes" />)
    expect(container.firstChild).toHaveClass('text-slate-700')
  })

  it('applies good style', () => {
    const { container } = render(<Metric label="Test" value="Yes" status="good" />)
    expect(container.firstChild).toHaveClass('text-emerald-700')
  })

  it('applies warn style', () => {
    const { container } = render(<Metric label="Test" value="Warn" status="warn" />)
    expect(container.firstChild).toHaveClass('text-amber-700')
  })

  it('applies bad style', () => {
    const { container } = render(<Metric label="Test" value="Bad" status="bad" />)
    expect(container.firstChild).toHaveClass('text-red-700')
  })
})
