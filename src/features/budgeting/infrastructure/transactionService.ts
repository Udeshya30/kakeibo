import { TransactionService } from '@/features/budgeting/application';
import { DexieTransactionRepository } from '@/features/budgeting/infrastructure/DexieTransactionRepository';

export const transactionService = new TransactionService(new DexieTransactionRepository());
