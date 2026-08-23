import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SpendingWindowsForm } from './SpendingWindowsForm'
import type { SpendingWindow } from '../types'

const defaultProps = {
  windows: [] as SpendingWindow[],
  currentAge: 35,
  lifeExpectancy: 90,
  onChange: vi.fn(),
}

describe('SpendingWindowsForm', () => {
  it('renders the section heading', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    expect(screen.getByText('Custom Spending Periods')).toBeInTheDocument()
  })

  it('shows empty state message when no windows', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    expect(screen.getByText(/No custom spending periods yet/)).toBeInTheDocument()
  })

  it('renders existing windows', () => {
    const windows: SpendingWindow[] = [
      { id: '1', name: 'Kindergarten', monthlyAmount: 3000, startAge: 35, endAge: 40 },
    ]
    render(<SpendingWindowsForm {...defaultProps} windows={windows} />)
    expect(screen.getByText('Kindergarten')).toBeInTheDocument()
    expect(screen.getByText(/3,000\/mo · Age 35–40/)).toBeInTheDocument()
  })

  it('renders multiple windows', () => {
    const windows: SpendingWindow[] = [
      { id: '1', name: 'Kindergarten', monthlyAmount: 3000, startAge: 35, endAge: 40 },
      { id: '2', name: 'University', monthlyAmount: 5000, startAge: 50, endAge: 55 },
    ]
    render(<SpendingWindowsForm {...defaultProps} windows={windows} />)
    expect(screen.getByText('Kindergarten')).toBeInTheDocument()
    expect(screen.getByText('University')).toBeInTheDocument()
  })

  it('adds a spending window when form is filled and submitted', () => {
    const onChange = vi.fn()
    render(<SpendingWindowsForm {...defaultProps} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Spending period name'), {
      target: { value: 'School' },
    })
    fireEvent.change(screen.getByLabelText('Monthly amount'), {
      target: { value: '2000' },
    })

    fireEvent.click(screen.getByLabelText('Add spending period'))
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'School', monthlyAmount: 2000 }),
      ])
    )
  })

  it('does not add window with empty name', () => {
    const onChange = vi.fn()
    render(<SpendingWindowsForm {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Monthly amount'), { target: { value: '2000' } })
    fireEvent.click(screen.getByLabelText('Add spending period'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not add window with zero amount', () => {
    const onChange = vi.fn()
    render(<SpendingWindowsForm {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Spending period name'), {
      target: { value: 'School' },
    })
    fireEvent.click(screen.getByLabelText('Add spending period'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('removes a window when X is clicked', () => {
    const onChange = vi.fn()
    const windows: SpendingWindow[] = [
      { id: 'abc', name: 'School', monthlyAmount: 2000, startAge: 35, endAge: 40 },
    ]
    render(<SpendingWindowsForm {...defaultProps} windows={windows} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Remove School'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('shows shekel prefix in window display', () => {
    const windows: SpendingWindow[] = [
      { id: '1', name: 'School', monthlyAmount: 1000, startAge: 35, endAge: 40 },
    ]
    render(<SpendingWindowsForm {...defaultProps} windows={windows} />)
    expect(screen.getByText(/₪1,000\/mo/)).toBeInTheDocument()
  })

  it('add button is disabled when name is empty', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    const addBtn = screen.getByLabelText('Add spending period')
    expect(addBtn).toBeDisabled()
  })

  it('add button is enabled when name and amount are filled', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Spending period name'), {
      target: { value: 'School' },
    })
    fireEvent.change(screen.getByLabelText('Monthly amount'), { target: { value: '1000' } })
    const addBtn = screen.getByLabelText('Add spending period')
    expect(addBtn).not.toBeDisabled()
  })

  it('add button is disabled when startAge >= endAge', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Spending period name'), {
      target: { value: 'School' },
    })
    fireEvent.change(screen.getByLabelText('Monthly amount'), { target: { value: '1000' } })
    fireEvent.change(screen.getByLabelText('Start age'), { target: { value: '45' } })
    fireEvent.change(screen.getByLabelText('End age'), { target: { value: '45' } })
    const addBtn = screen.getByLabelText('Add spending period')
    expect(addBtn).toBeDisabled()
  })

  it('clears amount input when cleared (handles NaN input)', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    const amountInput = screen.getByLabelText('Monthly amount')
    fireEvent.change(amountInput, { target: { value: '500' } })
    fireEvent.change(amountInput, { target: { value: '' } })
    expect((amountInput as HTMLInputElement).value).toBe('')
  })

  it('resets form fields after successful add', () => {
    const onChange = vi.fn()
    render(<SpendingWindowsForm {...defaultProps} onChange={onChange} />)
    const nameInput = screen.getByLabelText('Spending period name')
    const amountInput = screen.getByLabelText('Monthly amount')
    fireEvent.change(nameInput, { target: { value: 'Gym' } })
    fireEvent.change(amountInput, { target: { value: '500' } })
    fireEvent.click(screen.getByLabelText('Add spending period'))
    expect(onChange).toHaveBeenCalled()
    expect((nameInput as HTMLInputElement).value).toBe('')
  })

  it('updates start age when input changes', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    const startInput = screen.getByLabelText('Start age')
    fireEvent.change(startInput, { target: { value: '42' } })
    expect((startInput as HTMLInputElement).value).toBe('42')
  })

  it('updates end age when input changes', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    const endInput = screen.getByLabelText('End age')
    fireEvent.change(endInput, { target: { value: '50' } })
    expect((endInput as HTMLInputElement).value).toBe('50')
  })

  it('handles invalid start age input by falling back to currentAge', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    const startInput = screen.getByLabelText('Start age')
    fireEvent.change(startInput, { target: { value: '' } })
    expect((startInput as HTMLInputElement).value).toBe('35')
  })

  it('handles invalid end age input by falling back', () => {
    render(<SpendingWindowsForm {...defaultProps} />)
    const endInput = screen.getByLabelText('End age')
    fireEvent.change(endInput, { target: { value: '' } })
    expect((endInput as HTMLInputElement).value).toBe('40')
  })
})
