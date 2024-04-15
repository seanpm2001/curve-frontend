import type { StepStatus } from '@/ui/Stepper/types'

export function getStepStatus(isComplete: boolean, isInProgress: boolean, isValid: boolean): StepStatus {
  return isComplete ? 'succeeded' : isInProgress ? 'in-progress' : isValid ? 'current' : 'pending'
}

export function getTokenName(llamma: Llamma | null) {
  const [stablecoin, collateral] = llamma?.coins ?? ['', '']
  return { stablecoin, collateral }
}
