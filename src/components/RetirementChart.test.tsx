import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RetirementChart, CustomTooltip } from './RetirementChart'
import type { YearlySnapshot } from '../types'

vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  )
  const MockAreaChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  )
  const MockArea = ({ dataKey }: { dataKey: string }) => <div data-testid={`area-${dataKey}`} />
  const MockXAxis = () => <div data-testid="x-axis" />
  const MockYAxis = ({ tickFormatter }: { tickFormatter?: (v: number) => string }) => (
    <div data-testid="y-axis">{tickFormatter ? tickFormatter(1000000) : null}</div>
  )
  const MockCartesianGrid = () => <div data-testid="cartesian-grid" />
  const MockTooltip = () => <div data-testid="tooltip" />
  const MockReferenceLine = ({ x, label }: { x: number; label?: { value: string } }) => (
    <div data-testid={`reference-line-${x}`}>{label?.value}</div>
  )
  return {
    AreaChart: MockAreaChart,
    Area: MockArea,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    ReferenceLine: MockReferenceLine,
    ResponsiveContainer: MockResponsiveContainer,
  }
})

const mockSnapshots: YearlySnapshot[] = [
  { year: 2026, age: 35, balance: 500000, annualIncome: 240000, investmentReturn: 35000, annualExpenses: 144000, annualSavings: 96000, isRetired: false },
  { year: 2027, age: 36, balance: 640000, annualIncome: 240000, investmentReturn: 44800, annualExpenses: 144000, annualSavings: 96000, isRetired: false },
  { year: 2058, age: 67, balance: 4000000, annualIncome: 60000, investmentReturn: 280000, annualExpenses: 144000, annualSavings: -84000, isRetired: true },
]

const defaultProps = {
  snapshots: mockSnapshots,
  retirementAge: 67,
  pensionStartAge: 67,
  fundsDepletedAge: null,
  monteCarlo: null,
}

describe('RetirementChart', () => {
  it('renders the chart heading', () => {
    render(<RetirementChart {...defaultProps} />)
    expect(screen.getByText('Wealth Projection')).toBeInTheDocument()
  })

  it('renders the area chart', () => {
    render(<RetirementChart {...defaultProps} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('renders Balance area', () => {
    render(<RetirementChart {...defaultProps} />)
    expect(screen.getByTestId('area-Balance')).toBeInTheDocument()
  })

  it('renders Income and Expenses areas', () => {
    render(<RetirementChart {...defaultProps} />)
    expect(screen.getByTestId('area-Income')).toBeInTheDocument()
    expect(screen.getByTestId('area-Expenses')).toBeInTheDocument()
  })

  it('shows retirement reference line', () => {
    render(<RetirementChart {...defaultProps} />)
    expect(screen.getByTestId('reference-line-67')).toBeInTheDocument()
    expect(screen.getByText('Retire')).toBeInTheDocument()
  })

  it('shows depleted reference line when funds run out', () => {
    render(<RetirementChart {...defaultProps} fundsDepletedAge={82} />)
    expect(screen.getByTestId('reference-line-82')).toBeInTheDocument()
    expect(screen.getByText('Depleted')).toBeInTheDocument()
  })

  it('does not show depleted reference line when funds are sufficient', () => {
    render(<RetirementChart {...defaultProps} />)
    expect(screen.queryByText('Depleted')).not.toBeInTheDocument()
  })

  it('calls Y-axis formatter', () => {
    render(<RetirementChart {...defaultProps} />)
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
  })

  it('shows funds depleted legend entry when depleted', () => {
    render(<RetirementChart {...defaultProps} fundsDepletedAge={80} />)
    expect(screen.getByText(/funds depleted/i)).toBeInTheDocument()
  })

  it('shows pension start legend entry when pensionStartAge differs from retirementAge', () => {
    render(<RetirementChart {...defaultProps} retirementAge={65} pensionStartAge={70} />)
    expect(screen.getByText(/pension start/i)).toBeInTheDocument()
  })

  it('renders MC confidence band areas when monteCarlo is provided', () => {
    const mc = {
      successRate: 87,
      points: mockSnapshots.map((s) => ({
        age: s.age, p10: s.balance * 0.5, p25: s.balance * 0.75,
        p50: s.balance, p75: s.balance * 1.25, p90: s.balance * 1.5,
      })),
    }
    render(<RetirementChart {...defaultProps} monteCarlo={mc} />)
    expect(screen.getByTestId('area-mcBase')).toBeInTheDocument()
    expect(screen.getByTestId('area-mcBand')).toBeInTheDocument()
  })

  it('does not render MC band areas when monteCarlo is null', () => {
    render(<RetirementChart {...defaultProps} monteCarlo={null} />)
    expect(screen.queryByTestId('area-mcBand')).not.toBeInTheDocument()
  })

  it('shows Monte Carlo band legend entry when monteCarlo is active', () => {
    const mc = { successRate: 87, points: [] }
    render(<RetirementChart {...defaultProps} monteCarlo={mc} />)
    expect(screen.getByText(/monte carlo band/i)).toBeInTheDocument()
  })

  it('shows simulation subtitle when monteCarlo is active', () => {
    const mc = { successRate: 87, points: [] }
    render(<RetirementChart {...defaultProps} monteCarlo={mc} />)
    expect(screen.getByText(/1000 simulations/i)).toBeInTheDocument()
  })

  it('shows pension reference line when pensionStartAge differs from retirementAge', () => {
    render(<RetirementChart {...defaultProps} retirementAge={65} pensionStartAge={70} />)
    expect(screen.getByTestId('reference-line-70')).toBeInTheDocument()
    expect(screen.getByText('Pension')).toBeInTheDocument()
  })

  it('does not show pension reference line when pensionStartAge equals retirementAge', () => {
    render(<RetirementChart {...defaultProps} pensionStartAge={67} />)
    expect(screen.queryByText('Pension')).not.toBeInTheDocument()
  })

  it('does not show pension reference line when pensionStartAge is undefined', () => {
    render(<RetirementChart {...defaultProps} pensionStartAge={undefined} />)
    expect(screen.queryByText('Pension')).not.toBeInTheDocument()
  })
})

describe('CustomTooltip', () => {
  it('returns null when not active', () => {
    const { container } = render(<CustomTooltip active={false} payload={[]} label={35} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when payload is empty', () => {
    const { container } = render(<CustomTooltip active={true} payload={[]} label={35} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when active is undefined', () => {
    const { container } = render(<CustomTooltip payload={[{ value: 100, name: 'Balance', color: '#fff' }]} label={35} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders tooltip content when active with payload', () => {
    const payload = [
      { value: 500000, name: 'Balance', color: '#6366f1' },
      { value: 120000, name: 'Income', color: '#10b981' },
    ]
    render(<CustomTooltip active={true} payload={payload} label={45} />)
    expect(screen.getByText('Age 45')).toBeInTheDocument()
    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
  })

  it('formats numeric values with locale formatting', () => {
    const payload = [{ value: 1500000, name: 'Balance', color: '#6366f1' }]
    render(<CustomTooltip active={true} payload={payload} label={50} />)
    expect(screen.getByText('1,500,000')).toBeInTheDocument()
  })

  it('renders non-numeric values as-is', () => {
    const payload = [{ value: 'N/A' as unknown as number, name: 'Balance', color: '#fff' }]
    render(<CustomTooltip active={true} payload={payload} label={50} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('returns null when all payload entries are MC keys', () => {
    const payload = [
      { value: 100, name: 'mcBase', color: '#6366f1' },
      { value: 200, name: 'mcBand', color: '#6366f1' },
    ]
    const { container } = render(<CustomTooltip active={true} payload={payload} label={50} />)
    expect(container.firstChild).toBeNull()
  })
})
