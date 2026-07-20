import { BudgetService } from '@/features/budgeting/application';
import { DexieBudgetRepository } from '@/features/budgeting/infrastructure/DexieBudgetRepository';

export const budgetService = new BudgetService(new DexieBudgetRepository());
