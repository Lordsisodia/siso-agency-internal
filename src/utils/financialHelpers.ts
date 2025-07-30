
// This file is deprecated and serves as a re-export only
// This re-export ensures backward compatibility while we transition to the new structure
export * from './financial';

// Re-export specific functions for components that still depend on the old import path
import { addMultipleTransactions } from './financial/transactionModifications';

export const addTransaction = (data: any) => {
  // For single transaction, we'll use the same bulk function with a single item
  return addMultipleTransactions([{
    ...data,
    type: 'expense' // Default to expense for backward compatibility
  }]);
};
