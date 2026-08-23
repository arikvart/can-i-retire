import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
  const MockAreaChart = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  const MockArea = ({ dataKey }: { dataKey: string }) => <span data-key={dataKey} />
  const MockXAxis = () => null
  const MockYAxis = () => null
  const MockCartesianGrid = () => null
  const MockTooltip = () => null
  const MockReferenceLine = () => null

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

// localStorage is replaced globally in src/test/setup.ts with an in-memory mock
const ls = window.localStorage

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Can I Retire?')).toBeInTheDocument()
  })

  it('renders all three input sections', () => {
    render(<App />)
    expect(screen.getByText('Your Profile')).toBeInTheDocument()
    expect(screen.getByText('Retirement Assumptions')).toBeInTheDocument()
    expect(screen.getByText('Custom Spending Periods')).toBeInTheDocument()
  })

  it('renders the wealth projection chart', () => {
    render(<App />)
    expect(screen.getByText('Wealth Projection')).toBeInTheDocument()
  })

  it('renders the summary section', () => {
    render(<App />)
    expect(screen.getByText('Projection Summary')).toBeInTheDocument()
  })

  it('shows subtitle text', () => {
    render(<App />)
    expect(screen.getByText(/personal retirement simulator/i)).toBeInTheDocument()
  })

  it('persists changes to localStorage', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }))
    expect(ls.setItem).toHaveBeenCalled()
  })

  it('renders the yearly breakdown table', () => {
    render(<App />)
    expect(screen.getByText(/Year-by-Year Breakdown/i)).toBeInTheDocument()
  })

  it('renders the reset button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument()
  })

  it('resets to defaults when reset is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }))
    expect(screen.getByText('Projection Summary')).toBeInTheDocument()
  })

  it('renders dark mode toggle button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  it('toggles dark mode when button is clicked', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /switch to dark mode/i })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })

  it('dark mode toggle starts with aria-pressed false', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('dark mode toggle sets aria-pressed true when activated', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /switch to dark mode/i })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('handles legacy stored assumptions without pensionStartAge', () => {
    ls.setItem('cir-assumptions', JSON.stringify({
      retirementAge: 67,
      lifeExpectancy: 90,
      inflationRate: 3,
      investmentReturnRate: 7,
      monthlyPension: 5000,
      returnStdDev: 0,
      inflationStdDev: 0,
      monteCarloEnabled: false,
    }))
    render(<App />)
    expect(screen.getByText('Projection Summary')).toBeInTheDocument()
  })
})
