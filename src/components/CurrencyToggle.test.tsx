import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { CurrencyToggle } from './CurrencyToggle'

describe('CurrencyToggle', () => {
  it('renders nothing', () => {
    render(<CurrencyToggle />)
  })
})
