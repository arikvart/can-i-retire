import type {
  FinancialProfile,
  RetirementAssumptions,
  SpendingWindow,
  SimulationResult,
  YearlySnapshot,
  MonteCarloPoint,
} from '../types'

export function randomNormal(mean: number, stdDev: number): number {
  if (stdDev === 0) return mean
  const u1 = Math.max(Math.random(), 1e-15)
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + stdDev * z
}

export function getPercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
}

function runMonteCarlo(
  profile: FinancialProfile,
  assumptions: RetirementAssumptions,
  spendingWindows: SpendingWindow[],
  n = 1000
): SimulationResult['monteCarlo'] {
  if (!(assumptions.monteCarloEnabled ?? false)) return null
  const returnStdDev = assumptions.returnStdDev ?? 0
  const inflationStdDev = assumptions.inflationStdDev ?? 0
  if (returnStdDev === 0 && inflationStdDev === 0) return null

  const totalYears = assumptions.lifeExpectancy - profile.currentAge
  const balancesByAge: number[][] = Array.from({ length: totalYears + 1 }, () => [])
  let successCount = 0

  for (let sim = 0; sim < n; sim++) {
    let balance = profile.currentSavings
    let depleted = false
    let cumulativeInflation = 1

    for (let yearOffset = 0; yearOffset <= totalYears; yearOffset++) {
      const age = profile.currentAge + yearOffset
      const isRetired = age >= assumptions.retirementAge
      const pensionStartAge = assumptions.pensionStartAge ?? assumptions.retirementAge
      const hasPension = age >= pensionStartAge

      const sampledReturn = randomNormal(assumptions.investmentReturnRate / 100, returnStdDev / 100)
      const returnFactor = 1 + Math.max(-0.5, sampledReturn)

      const salary = isRetired ? 0 : profile.monthlyIncome * 12 * cumulativeInflation
      const pension = hasPension ? assumptions.monthlyPension * 12 * cumulativeInflation : 0
      const annualIncome = salary + pension

      const baseExpenses = profile.monthlyExpenses * 12 * cumulativeInflation
      const windowExpenses = spendingWindows.reduce((sum, w) => {
        if (age >= w.startAge && age < w.endAge) {
          return sum + w.monthlyAmount * 12 * cumulativeInflation
        }
        return sum
      }, 0)

      const annualSavings = annualIncome - baseExpenses - windowExpenses
      balance = balance * returnFactor + annualSavings

      if (balance < 0 && !depleted) depleted = true
      balancesByAge[yearOffset].push(Math.max(0, balance))

      const sampledInflation = randomNormal(assumptions.inflationRate / 100, inflationStdDev / 100)
      cumulativeInflation *= 1 + Math.max(0, sampledInflation)
    }

    if (!depleted) successCount++
  }

  const points: MonteCarloPoint[] = balancesByAge.map((balances, i) => {
    const sorted = [...balances].sort((a, b) => a - b)
    return {
      age: profile.currentAge + i,
      p10: getPercentile(sorted, 10),
      p25: getPercentile(sorted, 25),
      p50: getPercentile(sorted, 50),
      p75: getPercentile(sorted, 75),
      p90: getPercentile(sorted, 90),
    }
  })

  return { successRate: (successCount / n) * 100, points }
}

export function runSimulation(
  profile: FinancialProfile,
  assumptions: RetirementAssumptions,
  spendingWindows: SpendingWindow[]
): SimulationResult {
  const snapshots: YearlySnapshot[] = []
  let balance = profile.currentSavings
  let fundsDepletedAge: number | null = null
  let retirementBalance = 0

  const inflationFactor = 1 + assumptions.inflationRate / 100
  const returnFactor = 1 + assumptions.investmentReturnRate / 100
  const totalYears = assumptions.lifeExpectancy - profile.currentAge
  const pensionStartAge = assumptions.pensionStartAge ?? assumptions.retirementAge

  for (let yearOffset = 0; yearOffset <= totalYears; yearOffset++) {
    const age = profile.currentAge + yearOffset
    const isRetired = age >= assumptions.retirementAge
    const hasPension = age >= pensionStartAge
    const inflationMultiplier = Math.pow(inflationFactor, yearOffset)

    const salary = isRetired ? 0 : profile.monthlyIncome * 12 * inflationMultiplier
    const pension = hasPension ? assumptions.monthlyPension * 12 * inflationMultiplier : 0
    const annualIncome = salary + pension

    const baseExpenses = profile.monthlyExpenses * 12 * inflationMultiplier
    const windowExpenses = spendingWindows.reduce((sum, w) => {
      if (age >= w.startAge && age < w.endAge) {
        return sum + w.monthlyAmount * 12 * inflationMultiplier
      }
      return sum
    }, 0)

    const annualExpenses = baseExpenses + windowExpenses
    const annualSavings = annualIncome - annualExpenses
    const investmentReturn = balance * (returnFactor - 1)

    balance = balance * returnFactor + annualSavings

    if (balance < 0 && fundsDepletedAge === null) {
      fundsDepletedAge = age
    }

    if (age === assumptions.retirementAge) {
      retirementBalance = Math.max(balance, 0)
    }

    snapshots.push({
      year: new Date().getFullYear() + yearOffset,
      age,
      balance: Math.max(balance, 0),
      annualIncome,
      investmentReturn,
      annualExpenses,
      annualSavings,
      isRetired,
    })
  }

  const retiredSnapshots = snapshots.filter((s) => s.isRetired)
  const yearsOfRetirement =
    fundsDepletedAge !== null
      ? fundsDepletedAge - assumptions.retirementAge
      : retiredSnapshots.length

  const monteCarlo = runMonteCarlo(profile, assumptions, spendingWindows)

  return {
    snapshots,
    retirementBalance,
    fundsDepletedAge,
    isViable: fundsDepletedAge === null,
    yearsOfRetirement,
    monteCarlo,
  }
}

export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  return `${sign}₪${Math.round(absAmount).toLocaleString('en-US')}`
}

export function formatCurrencyCompact(amount: number): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  return `${sign}₪${formatNumberCompact(absAmount)}`
}

function formatNumberCompact(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}K`
  }
  return n.toFixed(0)
}

export function getMonthlySavings(profile: FinancialProfile): number {
  return profile.monthlyIncome - profile.monthlyExpenses
}
