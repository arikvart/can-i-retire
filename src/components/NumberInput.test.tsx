import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('renders the label', () => {
    render(<NumberInput label="Monthly Income" value={5000} onChange={() => {}} />)
    expect(screen.getByText('Monthly Income')).toBeInTheDocument()
  })

  it('renders with currency prefix', () => {
    render(<NumberInput label="Amount" value={1000} onChange={() => {}} prefix="₪" />)
    expect(screen.getByText('₪')).toBeInTheDocument()
  })

  it('renders suffix text', () => {
    render(<NumberInput label="Age" value={35} onChange={() => {}} suffix="yrs" />)
    expect(screen.getByText('yrs')).toBeInTheDocument()
  })

  it('renders help text', () => {
    render(<NumberInput label="Age" value={35} onChange={() => {}} helpText="Your current age" />)
    expect(screen.getByText('Your current age')).toBeInTheDocument()
  })

  it('calls onChange with parsed float', () => {
    const onChange = vi.fn()
    render(<NumberInput label="Amount" value={0} onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '1500' } })
    expect(onChange).toHaveBeenCalledWith(1500)
  })

  it('calls onChange with 0 for empty/invalid input', () => {
    const onChange = vi.fn()
    render(<NumberInput label="Amount" value={0} onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('sets the current value on the input', () => {
    render(<NumberInput label="Amount" value={3000} onChange={() => {}} />)
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.value).toBe('3000')
  })

  it('has no prefix when no prefix prop provided', () => {
    render(<NumberInput label="Rate" value={5} onChange={() => {}} />)
    expect(screen.queryByText('₪')).not.toBeInTheDocument()
  })

  it('shows comma-formatted overlay when useCommas is true', () => {
    render(<NumberInput label="Amount" value={1000000} onChange={() => {}} useCommas />)
    expect(screen.getByText('1,000,000')).toBeInTheDocument()
  })

  it('does not show comma overlay when useCommas is false', () => {
    render(<NumberInput label="Amount" value={1000000} onChange={() => {}} />)
    expect(screen.queryByText('1,000,000')).not.toBeInTheDocument()
  })

  it('hides overlay when focused with useCommas', () => {
    render(<NumberInput label="Amount" value={15000} onChange={() => {}} useCommas />)
    const input = screen.getByRole('spinbutton')
    fireEvent.focus(input)
    expect(screen.queryByText('15,000')).not.toBeInTheDocument()
  })

  it('shows overlay again after blur with useCommas', () => {
    render(<NumberInput label="Amount" value={15000} onChange={() => {}} useCommas />)
    const input = screen.getByRole('spinbutton')
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(screen.getByText('15,000')).toBeInTheDocument()
  })
})
