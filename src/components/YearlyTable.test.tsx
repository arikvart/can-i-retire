import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { YearlyTable } from './YearlyTable'
import type { YearlySnapshot, MonteCarloPoint } from '../types'

const makeSnapshots = (count: number): YearlySnapshot[] =>
  Array.from({ length: count }, (_, i) => ({
    year: 2026 + i,
    age: 35 + i,
    balance: 500000 + i * 10000,
    annualIncome: 240000,
    investmentReturn: 35000,
    annualExpenses: 144000,
    annualSavings: 96000,
    isRetired: 35 + i >= 67,
  }))

const snapshots5 = makeSnapshots(5)
const snapshots25 = makeSnapshots(25)

describe('YearlyTable', () => {
  it('renders the section toggle button', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    expect(screen.getByText(/Year-by-Year Breakdown/i)).toBeInTheDocument()
  })

  it('is collapsed by default', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('expands when toggle is clicked', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('collapses again when toggle is clicked twice', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    const btn = screen.getByRole('button', { name: /year-by-year/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows correct column headers', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('Earned')).toBeInTheDocument()
    expect(screen.getByText('Returns')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('Net')).toBeInTheDocument()
    expect(screen.getByText('Phase')).toBeInTheDocument()
  })

  it('shows first 10 rows for a dataset of 5', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByTestId('row-age-35')).toBeInTheDocument()
    expect(screen.getByTestId('row-age-39')).toBeInTheDocument()
  })

  it('shows Working badge for pre-retirement rows', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    const workingBadges = screen.getAllByText('Working')
    expect(workingBadges.length).toBeGreaterThan(0)
  })

  it('shows Retired badge for retired rows', () => {
    const retiredSnapshots: YearlySnapshot[] = [
      { year: 2058, age: 67, balance: 1000000, annualIncome: 60000, investmentReturn: 70000, annualExpenses: 144000, annualSavings: -84000, isRetired: true },
    ]
    render(<YearlyTable snapshots={retiredSnapshots} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByText('Retired')).toBeInTheDocument()
  })

  it('does not show pagination for small datasets', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.queryByTestId('table-pagination')).not.toBeInTheDocument()
  })

  it('shows pagination for large datasets', () => {
    render(<YearlyTable snapshots={snapshots25} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument()
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
  })

  it('navigates to next page', () => {
    render(<YearlyTable snapshots={snapshots25} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument()
    expect(screen.getByTestId('row-age-45')).toBeInTheDocument()
  })

  it('navigates to previous page', () => {
    render(<YearlyTable snapshots={snapshots25} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: /prev/i }))
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
  })

  it('disables Prev button on first page', () => {
    render(<YearlyTable snapshots={snapshots25} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(<YearlyTable snapshots={snapshots25} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('shows + prefix for positive net savings', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getAllByText(/^\+/)[0]).toBeInTheDocument()
  })

  it('highlights retirement start row', () => {
    const snapshotsWithRetirement: YearlySnapshot[] = [
      { year: 2058, age: 67, balance: 2000000, annualIncome: 60000, investmentReturn: 140000, annualExpenses: 120000, annualSavings: -60000, isRetired: true },
    ]
    render(<YearlyTable snapshots={snapshotsWithRetirement} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    const row = screen.getByTestId('row-age-67')
    expect(row).toHaveClass('bg-amber-50')
  })

  it('shows Gap badge for retired rows before pension starts', () => {
    const snapshotsWithGap: YearlySnapshot[] = [
      { year: 2058, age: 65, balance: 1500000, annualIncome: 0, investmentReturn: 90000, annualExpenses: 120000, annualSavings: -120000, isRetired: true },
      { year: 2059, age: 66, balance: 1380000, annualIncome: 0, investmentReturn: 82800, annualExpenses: 120000, annualSavings: -120000, isRetired: true },
      { year: 2060, age: 67, balance: 1260000, annualIncome: 60000, investmentReturn: 75600, annualExpenses: 120000, annualSavings: -60000, isRetired: true },
    ]
    render(<YearlyTable snapshots={snapshotsWithGap} retirementAge={65} pensionStartAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    const gapBadges = screen.getAllByText('Gap')
    expect(gapBadges.length).toBe(2)
    expect(screen.getByText('Retired')).toBeInTheDocument()
  })

  it('does not show Gap badge when pensionStartAge equals retirementAge', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} pensionStartAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.queryByText('Gap')).not.toBeInTheDocument()
  })

  it('shows investment return column values', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByText('Returns')).toBeInTheDocument()
    expect(screen.getAllByText('₪35,000').length).toBeGreaterThan(0)
  })

  it('applies muted background to non-start retired rows', () => {
    const snapshots: YearlySnapshot[] = [
      { year: 2058, age: 67, balance: 2000000, annualIncome: 60000, investmentReturn: 140000, annualExpenses: 120000, annualSavings: -60000, isRetired: true },
      { year: 2059, age: 68, balance: 1800000, annualIncome: 60000, investmentReturn: 126000, annualExpenses: 120000, annualSavings: -60000, isRetired: true },
    ]
    render(<YearlyTable snapshots={snapshots} retirementAge={67} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    const row68 = screen.getByTestId('row-age-68')
    expect(row68).toHaveClass('bg-slate-50/50')
  })

  it('toggle button has aria-expanded false when collapsed', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    const btn = screen.getByRole('button', { name: /year-by-year/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggle button has aria-expanded true when open', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} />)
    const btn = screen.getByRole('button', { name: /year-by-year/i })
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('does not show MC columns when monteCarlo is null', () => {
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} monteCarlo={null} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.queryByText('P10')).not.toBeInTheDocument()
    expect(screen.queryByText('P50')).not.toBeInTheDocument()
    expect(screen.queryByText('P90')).not.toBeInTheDocument()
  })

  it('shows P10, P50, P90 columns when monteCarlo is provided', () => {
    const points: MonteCarloPoint[] = snapshots5.map((s) => ({
      age: s.age,
      p10: s.balance * 0.5,
      p25: s.balance * 0.75,
      p50: s.balance,
      p75: s.balance * 1.25,
      p90: s.balance * 1.5,
    }))
    const monteCarlo = { successRate: 85, points }
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} monteCarlo={monteCarlo} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByText('P10')).toBeInTheDocument()
    expect(screen.getByText('P50')).toBeInTheDocument()
    expect(screen.getByText('P90')).toBeInTheDocument()
  })

  it('shows em dash for rows with no corresponding MC point', () => {
    const points: MonteCarloPoint[] = [{ age: 35, p10: 250000, p25: 375000, p50: 550000, p75: 625000, p90: 750000 }]
    const monteCarlo = { successRate: 85, points }
    render(<YearlyTable snapshots={snapshots5} retirementAge={67} monteCarlo={monteCarlo} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('shows formatted MC percentile values per row', () => {
    const points: MonteCarloPoint[] = [snapshots5[0]].map((s) => ({
      age: s.age,
      p10: 250000,
      p25: 375000,
      p50: 550000,
      p75: 625000,
      p90: 750000,
    }))
    const monteCarlo = { successRate: 85, points }
    render(<YearlyTable snapshots={[snapshots5[0]]} retirementAge={67} monteCarlo={monteCarlo} />)
    fireEvent.click(screen.getByRole('button', { name: /year-by-year/i }))
    expect(screen.getByText('₪250,000')).toBeInTheDocument()
    expect(screen.getByText('₪550,000')).toBeInTheDocument()
    expect(screen.getByText('₪750,000')).toBeInTheDocument()
  })
})
