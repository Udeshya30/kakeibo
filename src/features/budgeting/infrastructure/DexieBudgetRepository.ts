import type {
  BudgetMonthWithPlan,
  BudgetOperationResult,
  BudgetRepository,
  CreateBudgetMonthCommand,
  UpdateBudgetPlanCommand
} from '@/features/budgeting/application';
import type { PeriodKey } from '@/features/budgeting/domain';
import type { BudgetMonthRecord, BudgetPlanRecord } from '@/shared/domain/persistence';
import { kakeiboDatabase } from '@/shared/infrastructure/database';

function createIdentifier(): string {
  return crypto.randomUUID();
}

export class DexieBudgetRepository implements BudgetRepository {
  public async listMonths(): Promise<readonly BudgetMonthRecord[]> {
    return kakeiboDatabase.budgetMonths.orderBy('periodKey').reverse().toArray();
  }

  public async findMonthWithPlanByPeriod(periodKey: PeriodKey): Promise<BudgetMonthWithPlan | null> {
    return kakeiboDatabase.transaction('r', kakeiboDatabase.budgetMonths, kakeiboDatabase.budgetPlans, async () => {
      const month = await kakeiboDatabase.budgetMonths.where('periodKey').equals(periodKey).first();

      if (month === undefined) {
        return null;
      }

      const plan = await kakeiboDatabase.budgetPlans.where('monthId').equals(month.id).first();

      return plan === undefined ? null : { month, plan };
    });
  }

  public async createMonthWithPlan(command: CreateBudgetMonthCommand): Promise<BudgetOperationResult<BudgetMonthWithPlan>> {
    try {
      return await kakeiboDatabase.transaction('rw', kakeiboDatabase.budgetMonths, kakeiboDatabase.budgetPlans, async () => {
        const existingMonth = await kakeiboDatabase.budgetMonths.where('periodKey').equals(command.periodKey).first();

        if (existingMonth !== undefined) {
          return { success: false, reason: 'month-already-exists' };
        }

        const timestamp = new Date().toISOString();
        const month: BudgetMonthRecord = {
          id: createIdentifier(),
          periodKey: command.periodKey,
          status: 'active',
          createdAt: timestamp,
          updatedAt: timestamp
        };
        const plan: BudgetPlanRecord = {
          id: createIdentifier(),
          monthId: month.id,
          plannedIncomeMinor: command.plan.plannedIncomeMinor,
          fixedCommitmentsMinor: command.plan.fixedCommitmentsMinor,
          savingsTargetMinor: command.plan.savingsTargetMinor,
          categoryLimitsMinor: command.plan.categoryLimitsMinor,
          currency: command.currency,
          createdAt: timestamp,
          updatedAt: timestamp
        };

        await kakeiboDatabase.budgetMonths.add(month);
        await kakeiboDatabase.budgetPlans.add(plan);

        return { success: true, data: { month, plan } };
      });
    } catch {
      return { success: false, reason: 'storage-failure' };
    }
  }

  public async updatePlan(command: UpdateBudgetPlanCommand): Promise<BudgetOperationResult<BudgetPlanRecord>> {
    try {
      return await kakeiboDatabase.transaction('rw', kakeiboDatabase.budgetMonths, kakeiboDatabase.budgetPlans, async () => {
        const month = await kakeiboDatabase.budgetMonths.get(command.monthId);
        const plan = await kakeiboDatabase.budgetPlans.get(command.planId);

        if (month === undefined || plan === undefined || plan.monthId !== command.monthId) {
          return { success: false, reason: 'month-not-found' };
        }

        if (month.status === 'archived') {
          return { success: false, reason: 'month-archived' };
        }

        if (plan.updatedAt !== command.expectedUpdatedAt) {
          return { success: false, reason: 'stale-plan' };
        }

        const updatedPlan: BudgetPlanRecord = {
          ...plan,
          ...command.values,
          updatedAt: new Date().toISOString()
        };

        await kakeiboDatabase.budgetPlans.put(updatedPlan);

        return { success: true, data: updatedPlan };
      });
    } catch {
      return { success: false, reason: 'storage-failure' };
    }
  }

  public archiveMonth(monthId: string): Promise<BudgetOperationResult<BudgetMonthRecord>> {
    return this.updateMonthStatus(monthId, 'archived');
  }

  public reopenMonth(monthId: string): Promise<BudgetOperationResult<BudgetMonthRecord>> {
    return this.updateMonthStatus(monthId, 'active');
  }

  private async updateMonthStatus(
    monthId: string,
    status: BudgetMonthRecord['status']
  ): Promise<BudgetOperationResult<BudgetMonthRecord>> {
    try {
      const month = await kakeiboDatabase.budgetMonths.get(monthId);

      if (month === undefined) {
        return { success: false, reason: 'month-not-found' };
      }

      const timestamp = new Date().toISOString();
      const updatedMonth: BudgetMonthRecord = {
        ...month,
        status,
        updatedAt: timestamp,
        archivedAt: status === 'archived' ? timestamp : undefined
      };

      await kakeiboDatabase.budgetMonths.put(updatedMonth);

      return { success: true, data: updatedMonth };
    } catch {
      return { success: false, reason: 'storage-failure' };
    }
  }
}
