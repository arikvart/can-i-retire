import { describe, it, expect } from 'vitest'
import { runSimulation, formatCurrency, formatCurrencyCompact, getMonthlySavings, randomNormal, getPercentile } from './simulator'
import type { FinancialProfile, RetirementAssumptions, SpendingWindow } from '../types'

const baseProfile: FinancialProfile = {
  currentAge: 35,
  monthlyIncome: 20000,
  monthlyExpenses: 12000,
  currentSavings: 500000,
}

const baseAssumptions: RetirementAssumptions = {
  retirementAge: 67,
  lifeExpectancy: 90,
  inflationRate: 3,
  investmentReturnRate: 7,
  monthlyPension: 5000,
}

describe('runSimulation', () => {
  it('produces a snapshot for each year from currentAge to lifeExpectancy', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const expectedYears = baseAssumptions.lifeExpectancy - baseProfile.currentAge + 1
    expect(result.snapshots).toHaveLength(expectedYears)
  })

  it('first snapshot has age equal to currentAge', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    expect(result.snapshots[0].age).toBe(35)
  })

  it('last snapshot has age equal to lifeExpectancy', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const last = result.snapshots[result.snapshots.length - 1]
    expect(last.age).toBe(90)
  })

  it('marks snapshots as retired when age >= retirementAge', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const preRetirement = result.snapshots.filter((s) => s.age < 67)
    const postRetirement = result.snapshots.filter((s) => s.age >= 67)
    expect(preRetirement.every((s) => !s.isRetired)).toBe(true)
    expect(postRetirement.every((s) => s.isRetired)).toBe(true)
  })

  it('uses pension income after retirement', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const retiredSnapshot = result.snapshots.find((s) => s.age === 67)!
    const inflationMultiplier = Math.pow(1.03, 67 - 35)
    expect(retiredSnapshot.annualIncome).toBeCloseTo(5000 * 12 * inflationMultiplier, 0)
  })

  it('uses regular income before retirement', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const workingSnapshot = result.snapshots.find((s) => s.age === 35)!
    expect(workingSnapshot.annualIncome).toBeCloseTo(20000 * 12, 0)
  })

  it('balance never goes below zero in snapshot', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    expect(result.snapshots.every((s) => s.balance >= 0)).toBe(true)
  })

  it('reports isViable true when funds last through life expectancy', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    expect(result.isViable).toBe(true)
    expect(result.fundsDepletedAge).toBeNull()
  })

  it('reports isViable false when funds run out early', () => {
    const poorProfile: FinancialProfile = {
      ...baseProfile,
      currentSavings: 0,
      monthlyIncome: 5000,
    }
    const pessimisticAssumptions: RetirementAssumptions = {
      ...baseAssumptions,
      monthlyPension: 0,
      investmentReturnRate: 0,
    }
    const result = runSimulation(poorProfile, pessimisticAssumptions, [])
    expect(result.isViable).toBe(false)
    expect(result.fundsDepletedAge).not.toBeNull()
  })

  it('includes spending windows in expenses during active period', () => {
    const window: SpendingWindow = {
      id: '1',
      name: 'Kindergarten',
      monthlyAmount: 3000,
      startAge: 35,
      endAge: 40,
    }
    const result = runSimulation(baseProfile, baseAssumptions, [window])
    const snapshot35 = result.snapshots.find((s) => s.age === 35)!
    const snapshotNoWindow = result.snapshots.find((s) => s.age === 40)!
    const expectedWindowExpense = 3000 * 12
    expect(snapshot35.annualExpenses).toBeCloseTo(
      baseProfile.monthlyExpenses * 12 + expectedWindowExpense,
      -2
    )
    const expectedNoWindowExpense = baseProfile.monthlyExpenses * 12 * Math.pow(1.03, 5)
    expect(snapshotNoWindow.annualExpenses).toBeCloseTo(expectedNoWindowExpense, -2)
  })

  it('spending window is NOT active outside its age range', () => {
    const window: SpendingWindow = {
      id: '1',
      name: 'University',
      monthlyAmount: 5000,
      startAge: 50,
      endAge: 55,
    }
    const result = runSimulation(baseProfile, baseAssumptions, [window])
    const snapshot40 = result.snapshots.find((s) => s.age === 40)!
    const snapshot55 = result.snapshots.find((s) => s.age === 55)!
    const expectedAt40 = baseProfile.monthlyExpenses * 12 * Math.pow(1.03, 5)
    const expectedAt55 = baseProfile.monthlyExpenses * 12 * Math.pow(1.03, 20)
    expect(snapshot40.annualExpenses).toBeCloseTo(expectedAt40, -2)
    expect(snapshot55.annualExpenses).toBeCloseTo(expectedAt55, -2)
  })

  it('retirementBalance is set to balance at retirement age', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const retirementSnapshot = result.snapshots.find((s) => s.age === 67)!
    expect(result.retirementBalance).toBe(retirementSnapshot.balance)
  })

  it('zero investment return grows balance only by savings', () => {
    const profile: FinancialProfile = {
      currentAge: 60,
      monthlyIncome: 10000,
      monthlyExpenses: 5000,
      currentSavings: 100000,
    }
    const assumptions: RetirementAssumptions = {
      retirementAge: 67,
      lifeExpectancy: 70,
      inflationRate: 0,
      investmentReturnRate: 0,
      monthlyPension: 3000,
    }
    const result = runSimulation(profile, assumptions, [])
    const snapshot60 = result.snapshots.find((s) => s.age === 60)!
    expect(snapshot60.balance).toBeCloseTo(160000, -1)
    const snapshot61 = result.snapshots.find((s) => s.age === 61)!
    expect(snapshot61.balance).toBeCloseTo(220000, -1)
  })

  it('handles multiple concurrent spending windows', () => {
    const windows: SpendingWindow[] = [
      { id: '1', name: 'School A', monthlyAmount: 1000, startAge: 35, endAge: 40 },
      { id: '2', name: 'School B', monthlyAmount: 2000, startAge: 35, endAge: 42 },
    ]
    const result = runSimulation(baseProfile, baseAssumptions, windows)
    const snapshot35 = result.snapshots.find((s) => s.age === 35)!
    const extraExpenses = (1000 + 2000) * 12
    expect(snapshot35.annualExpenses).toBeCloseTo(
      baseProfile.monthlyExpenses * 12 + extraExpenses,
      -2
    )
  })

  it('year in snapshot starts from current year', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const currentYear = new Date().getFullYear()
    expect(result.snapshots[0].year).toBe(currentYear)
    expect(result.snapshots[1].year).toBe(currentYear + 1)
  })

  it('investmentReturn is zero when investmentReturnRate is zero', () => {
    const result = runSimulation(baseProfile, { ...baseAssumptions, investmentReturnRate: 0 }, [])
    expect(result.snapshots[0].investmentReturn).toBeCloseTo(0, 0)
  })

  it('investmentReturn is positive when balance is positive', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    const snap = result.snapshots.find((s) => s.age === 50)!
    expect(snap.investmentReturn).toBeGreaterThan(0)
  })

  it('investmentReturn approximates balance times return rate', () => {
    const profile = { ...baseProfile, currentSavings: 100000 }
    const assumptions = { ...baseAssumptions, inflationRate: 0, investmentReturnRate: 10, monthlyPension: 0 }
    const result = runSimulation(profile, assumptions, [])
    expect(result.snapshots[0].investmentReturn).toBeCloseTo(10000, 0)
  })

  it('pension income starts at pensionStartAge when later than retirementAge', () => {
    const profile: FinancialProfile = { ...baseProfile, currentAge: 60 }
    const assumptions: RetirementAssumptions = {
      ...baseAssumptions,
      retirementAge: 65,
      pensionStartAge: 70,
      lifeExpectancy: 75,
      monthlyPension: 5000,
      inflationRate: 0,
      investmentReturnRate: 0,
    }
    const result = runSimulation(profile, assumptions, [])
    const snap65 = result.snapshots.find((s) => s.age === 65)!
    expect(snap65.annualIncome).toBe(0)
    const snap70 = result.snapshots.find((s) => s.age === 70)!
    expect(snap70.annualIncome).toBeCloseTo(5000 * 12, 0)
  })

  it('pension income supplements salary when pensionStartAge is before retirementAge', () => {
    const assumptions: RetirementAssumptions = {
      ...baseAssumptions,
      retirementAge: 67,
      pensionStartAge: 62,
      monthlyPension: 3000,
      inflationRate: 0,
    }
    const result = runSimulation(baseProfile, assumptions, [])
    const snap62 = result.snapshots.find((s) => s.age === 62)!
    expect(snap62.annualIncome).toBeCloseTo(baseProfile.monthlyIncome * 12 + 3000 * 12, 0)
    const snap67 = result.snapshots.find((s) => s.age === 67)!
    expect(snap67.annualIncome).toBeCloseTo(3000 * 12, 0)
  })

  it('monteCarlo is null when both stdDevs are zero', () => {
    const result = runSimulation(baseProfile, { ...baseAssumptions, returnStdDev: 0, inflationStdDev: 0, monteCarloEnabled: true }, [])
    expect(result.monteCarlo).toBeNull()
  })

  it('monteCarlo is null when monteCarloEnabled is false', () => {
    const result = runSimulation(baseProfile, { ...baseAssumptions, returnStdDev: 5, inflationStdDev: 0, monteCarloEnabled: false }, [])
    expect(result.monteCarlo).toBeNull()
  })

  it('monteCarlo is null when baseAssumptions has no stdDev fields', () => {
    const result = runSimulation(baseProfile, baseAssumptions, [])
    expect(result.monteCarlo).toBeNull()
  })

  it('monteCarlo treats missing stdDev fields as 0 when enabled (legacy data)', () => {
    const legacyAssumptions = { ...baseAssumptions, monteCarloEnabled: true } as any
    delete legacyAssumptions.returnStdDev
    delete legacyAssumptions.inflationStdDev
    const result = runSimulation(baseProfile, legacyAssumptions, [])
    expect(result.monteCarlo).toBeNull()
  })

  it('monteCarlo returns result when returnStdDev > 0', () => {
    const result = runSimulation(baseProfile, { ...baseAssumptions, returnStdDev: 5, inflationStdDev: 0, monteCarloEnabled: true }, [])
    expect(result.monteCarlo).not.toBeNull()
    expect(result.monteCarlo!.successRate).toBeGreaterThanOrEqual(0)
    expect(result.monteCarlo!.successRate).toBeLessThanOrEqual(100)
  })

  it('monteCarlo returns result when inflationStdDev > 0', () => {
    const result = runSimulation(baseProfile, { ...baseAssumptions, returnStdDev: 0, inflationStdDev: 2, monteCarloEnabled: true }, [])
    expect(result.monteCarlo).not.toBeNull()
  })

  it('monteCarlo points cover all snapshot ages', () => {
    const result = runSimulation(baseProfile, { ...baseAssumptions, returnStdDev: 5, inflationStdDev: 0, monteCarloEnabled: true }, [])
    expect(result.monteCarlo!.points).toHaveLength(result.snapshots.length)
    expect(result.monteCarlo!.points[0].age).toBe(result.snapshots[0].age)
  })

  it('monteCarlo percentiles are ordered p10 <= p25 <= p50 <= p75 <= p90', () => {
    const result = runSimulation(baseProfile, { ...baseAssumptions, returnStdDev: 5, inflationStdDev: 0, monteCarloEnabled: true }, [])
    const point = result.monteCarlo!.points[20]
    expect(point.p10).toBeLessThanOrEqual(point.p25)
    expect(point.p25).toBeLessThanOrEqual(point.p50)
    expect(point.p50).toBeLessThanOrEqual(point.p75)
    expect(point.p75).toBeLessThanOrEqual(point.p90)
  })

  it('monteCarlo success rate is high for very favorable conditions', () => {
    const richProfile = { ...baseProfile, currentSavings: 10_000_000 }
    const result = runSimulation(richProfile, { ...baseAssumptions, returnStdDev: 2, inflationStdDev: 0, monteCarloEnabled: true }, [])
    expect(result.monteCarlo!.successRate).toBeGreaterThan(80)
  })

  it('monteCarlo success rate is low for unfavorable conditions', () => {
    const poorProfile = { ...baseProfile, currentSavings: 0, monthlyIncome: 3000 }
    const result = runSimulation(poorProfile, {
      ...baseAssumptions, monthlyPension: 0, investmentReturnRate: 0, returnStdDev: 3, inflationStdDev: 0, monteCarloEnabled: true,
    }, [])
    expect(result.monteCarlo!.successRate).toBeLessThan(50)
  })

  it('monteCarlo accounts for spending windows in simulations', () => {
    const window: SpendingWindow = {
      id: '1',
      name: 'School',
      monthlyAmount: 2000,
      startAge: 35,
      endAge: 40,
    }
    const result = runSimulation(baseProfile, { ...baseAssumptions, returnStdDev: 5, inflationStdDev: 0, monteCarloEnabled: true }, [window])
    expect(result.monteCarlo).not.toBeNull()
    expect(result.monteCarlo!.points).toHaveLength(result.snapshots.length)
  })
})

describe('formatCurrency', () => {
  it('formats with shekel sign and commas', () => {
    expect(formatCurrency(1000)).toBe('₪1,000')
  })

  it('formats millions with commas', () => {
    expect(formatCurrency(1_500_000)).toBe('₪1,500,000')
  })

  it('formats small amounts without commas', () => {
    expect(formatCurrency(500)).toBe('₪500')
  })

  it('formats negative amounts with sign', () => {
    expect(formatCurrency(-50000)).toBe('-₪50,000')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('₪0')
  })
})

describe('formatCurrencyCompact', () => {
  it('formats thousands with K suffix', () => {
    expect(formatCurrencyCompact(1000)).toBe('₪1K')
  })

  it('formats millions with M suffix', () => {
    expect(formatCurrencyCompact(1_500_000)).toBe('₪1.5M')
  })

  it('formats small amounts without suffix', () => {
    expect(formatCurrencyCompact(500)).toBe('₪500')
  })

  it('formats negative amounts with sign', () => {
    expect(formatCurrencyCompact(-50000)).toBe('-₪50K')
  })

  it('formats zero correctly', () => {
    expect(formatCurrencyCompact(0)).toBe('₪0')
  })
})

describe('randomNormal', () => {
  it('returns mean exactly when stdDev is 0', () => {
    expect(randomNormal(5, 0)).toBe(5)
    expect(randomNormal(-3, 0)).toBe(-3)
  })

  it('returns a number when stdDev > 0', () => {
    expect(typeof randomNormal(7, 2)).toBe('number')
  })

  it('result is finite', () => {
    for (let i = 0; i < 10; i++) {
      expect(isFinite(randomNormal(0, 1))).toBe(true)
    }
  })
})

describe('getPercentile', () => {
  it('returns 0 for empty array', () => {
    expect(getPercentile([], 50)).toBe(0)
  })

  it('returns the single element when lower equals upper', () => {
    expect(getPercentile([42], 50)).toBe(42)
  })

  it('interpolates between two values', () => {
    expect(getPercentile([0, 100], 50)).toBe(50)
  })
})

describe('getMonthlySavings', () => {
  it('returns income minus expenses', () => {
    expect(getMonthlySavings(baseProfile)).toBe(8000)
  })

  it('returns negative when spending exceeds income', () => {
    const profile = { ...baseProfile, monthlyExpenses: 25000 }
    expect(getMonthlySavings(profile)).toBe(-5000)
  })

  it('returns zero when income equals expenses', () => {
    const profile = { ...baseProfile, monthlyIncome: 12000 }
    expect(getMonthlySavings(profile)).toBe(0)
  })
})
