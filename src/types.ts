export interface FinancialProfile {
  currentAge: number
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
}

export interface RetirementAssumptions {
  retirementAge: number
  pensionStartAge?: number
  lifeExpectancy: number
  inflationRate: number
  investmentReturnRate: number
  monthlyPension: number
  returnStdDev: number
  inflationStdDev: number
  monteCarloEnabled: boolean
}

export interface MonteCarloPoint {
  age: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
}

export interface SpendingWindow {
  id: string
  name: string
  monthlyAmount: number
  startAge: number
  endAge: number
}

export interface YearlySnapshot {
  year: number
  age: number
  balance: number
  annualIncome: number
  investmentReturn: number
  annualExpenses: number
  annualSavings: number
  isRetired: boolean
}

export interface SimulationResult {
  snapshots: YearlySnapshot[]
  retirementBalance: number
  fundsDepletedAge: number | null
  isViable: boolean
  yearsOfRetirement: number
  monteCarlo: { successRate: number; points: MonteCarloPoint[] } | null
}

export interface AppState {
  profile: FinancialProfile
  assumptions: RetirementAssumptions
  spendingWindows: SpendingWindow[]
}
