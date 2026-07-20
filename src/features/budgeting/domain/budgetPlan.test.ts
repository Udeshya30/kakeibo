import { describe, expect, it } from 'vitest';
import { calculatePlannedAvailable } from '@/features/budgeting/domain';

describe('calculatePlannedAvailable', () => {
  it('subtracts fixed commitments and savings target from planned income', () => {
    expect(
      calculatePlannedAvailable({
        plannedIncomeMinor: 100_000,
        fixedCommitmentsMinor: 25_000,
        savingsTargetMinor: 15_000,
        categoryLimitsMinor: {}
      })
    ).toBe(60_000);
  });

  it('preserves an overcommitted plan as a negative value', () => {
    expect(
      calculatePlannedAvailable({
        plannedIncomeMinor: 10_000,
        fixedCommitmentsMinor: 8_000,
        savingsTargetMinor: 5_000,
        categoryLimitsMinor: {}
      })
    ).toBe(-3_000);
  });
});
