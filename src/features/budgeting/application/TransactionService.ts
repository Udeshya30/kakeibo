import type { TransactionRecord } from '@/shared/domain/persistence';
import type {
  CreateTransactionCommand,
  DeleteTransactionCommand,
  TransactionOperationResult,
  TransactionRepository,
  UpdateTransactionCommand
} from '@/features/budgeting/application/contracts';

export class TransactionService {
  public constructor(private readonly repository: TransactionRepository) {}

  public listRecent(monthId: string, limit = 8): Promise<readonly TransactionRecord[]> {
    return this.repository.listRecentByMonth(monthId, limit);
  }

  public create(command: CreateTransactionCommand): Promise<TransactionOperationResult<TransactionRecord>> {
    return this.repository.create(command);
  }

  public update(command: UpdateTransactionCommand): Promise<TransactionOperationResult<TransactionRecord>> {
    return this.repository.update(command);
  }

  public delete(command: DeleteTransactionCommand): Promise<TransactionOperationResult<string>> {
    return this.repository.delete(command);
  }
}
