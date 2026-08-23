import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileForm } from './ProfileForm'
import type { FinancialProfile } from '../types'

const profile: FinancialProfile = {
  currentAge: 35,
  monthlyIncome: 20000,
  monthlyExpenses: 12000,
  currentSavings: 500000,
}

describe('ProfileForm', () => {
  it('renders all form fields', () => {
    render(<ProfileForm profile={profile} onChange={() => {}} />)
    expect(screen.getByText('Current Age')).toBeInTheDocument()
    expect(screen.getByText('Monthly Income')).toBeInTheDocument()
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument()
    expect(screen.getByText('Current Savings')).toBeInTheDocument()
  })

  it('displays the section heading', () => {
    render(<ProfileForm profile={profile} onChange={() => {}} />)
    expect(screen.getByText('Your Profile')).toBeInTheDocument()
  })

  it('calls onChange with updated age when age input changes', () => {
    const onChange = vi.fn()
    render(<ProfileForm profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '40' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ currentAge: 40 }))
  })

  it('calls onChange with updated income when income input changes', () => {
    const onChange = vi.fn()
    render(<ProfileForm profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[1], { target: { value: '25000' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monthlyIncome: 25000 }))
  })

  it('calls onChange with updated expenses when expenses input changes', () => {
    const onChange = vi.fn()
    render(<ProfileForm profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[2], { target: { value: '8000' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ monthlyExpenses: 8000 }))
  })

  it('calls onChange with updated savings when savings input changes', () => {
    const onChange = vi.fn()
    render(<ProfileForm profile={profile} onChange={onChange} />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[3], { target: { value: '750000' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ currentSavings: 750000 }))
  })

  it('shows shekel prefix for monetary fields', () => {
    render(<ProfileForm profile={profile} onChange={() => {}} />)
    const prefixes = screen.getAllByText('₪')
    expect(prefixes.length).toBeGreaterThan(0)
  })
})
