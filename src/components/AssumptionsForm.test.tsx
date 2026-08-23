import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssumptionsForm } from './AssumptionsForm'
import type { FinancialProfile, RetirementAssumptions } from '../types'

const profile: FinancialProfile = {
  currentAge: 35,
  monthlyIncome: 20000,
  monthlyExpenses: 12000,
  currentSavings: 500000,
}

const assumptions: RetirementAssumptions = {
  retirementAge: 67,
  pensionStartAge: 67,
  lifeExpectancy: 90,
  inflationRate: 3,
  investmentReturnRate: 7,
  monthlyPension: 5000,
  returnStdDev: 0,
  inflationStdDev: 0,
  monteCarloEnabled: false,
}

const enabledAssumptions: RetirementAssumptions = {
  ...assumptions,
  monteCarloEnabled: true,
}

describe('AssumptionsForm', () => {
  it('renders the section heading', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    expect(screen.getByText('Retirement Assumptions')).toBeInTheDocument()
  })

  it('renders all assumption fields', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    expect(screen.getByText('Retirement Age')).toBeInTheDocument()
    expect(screen.getByText('Pension Start')).toBeInTheDocument()
    expect(screen.getByText('Life Expectancy')).toBeInTheDocument()
    expect(screen.getByText('Monthly Pension')).toBeInTheDocument()
    expect(screen.getByText('Inflation Rate')).toBeInTheDocument()
    expect(screen.getByText('Investment Return')).toBeInTheDocument()
  })

  it('shows percentage suffix on rate fields', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    const percents = screen.getAllByText('%')
    expect(percents.length).toBeGreaterThanOrEqual(2)
  })

  it('calls onChange when retirement age changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '65' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ retirementAge: 65 }))
  })

  it('calls onChange when pension start age changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[1], { target: { value: '70' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pensionStartAge: 70 }))
  })

  it('calls onChange when inflation rate changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[5], { target: { value: '4' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ inflationRate: 4 }))
  })

  it('calls onChange when life expectancy changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[2], { target: { value: '95' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ lifeExpectancy: 95 }))
  })

  it('calls onChange when monthly pension changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[3], { target: { value: '8000' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monthlyPension: 8000 }))
  })

  it('calls onChange when investment return changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[4], { target: { value: '8' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ investmentReturnRate: 8 }))
  })

  it('uses retirementAge as fallback value when pensionStartAge is undefined', () => {
    render(<AssumptionsForm assumptions={{ ...assumptions, pensionStartAge: undefined }} profile={profile} onChange={() => {}} />)
    const inputs = screen.getAllByRole('spinbutton')
    expect((inputs[1] as HTMLInputElement).value).toBe('67')
  })

  it('does not show exchange rate field', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    expect(screen.queryByText('USD/NIS Exchange Rate')).not.toBeInTheDocument()
  })

  it('shows Monte Carlo section heading', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    expect(screen.getByText('Monte Carlo')).toBeInTheDocument()
  })

  it('shows Monte Carlo toggle switch', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    expect(screen.getByRole('switch', { name: /enable monte carlo/i })).toBeInTheDocument()
  })

  it('toggle switch is off by default', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    expect(screen.getByRole('switch', { name: /enable monte carlo/i })).toHaveAttribute('aria-checked', 'false')
  })

  it('toggle switch is on when monteCarloEnabled is true', () => {
    render(<AssumptionsForm assumptions={enabledAssumptions} profile={profile} onChange={() => {}} />)
    expect(screen.getByRole('switch', { name: /enable monte carlo/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange with monteCarloEnabled true when toggle is clicked', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch', { name: /enable monte carlo/i }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monteCarloEnabled: true }))
  })

  it('calls onChange with monteCarloEnabled false when toggle is clicked while enabled', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={enabledAssumptions} profile={profile} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch', { name: /enable monte carlo/i }))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monteCarloEnabled: false }))
  })

  it('hides std dev fields when Monte Carlo is disabled', () => {
    render(<AssumptionsForm assumptions={assumptions} profile={profile} onChange={() => {}} />)
    expect(screen.queryByText('Return Std Dev')).not.toBeInTheDocument()
    expect(screen.queryByText('Inflation Std Dev')).not.toBeInTheDocument()
  })

  it('renders Return Std Dev and Inflation Std Dev fields when MC enabled', () => {
    render(<AssumptionsForm assumptions={enabledAssumptions} profile={profile} onChange={() => {}} />)
    expect(screen.getByText('Return Std Dev')).toBeInTheDocument()
    expect(screen.getByText('Inflation Std Dev')).toBeInTheDocument()
  })

  it('calls onChange when return std dev changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={enabledAssumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[6], { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ returnStdDev: 5 }))
  })

  it('calls onChange when inflation std dev changes', () => {
    const onChange = vi.fn()
    render(<AssumptionsForm assumptions={enabledAssumptions} profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[7], { target: { value: '1.5' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ inflationStdDev: 1.5 }))
  })
})
