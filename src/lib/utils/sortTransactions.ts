import type { Transaction } from '../types';

/**
 * Given a list of transactions, this returns those transactions sorted in chronological order.
 */
export function sortTransactions(
  transactionHistory: Transaction[]
): Transaction[] {
  return transactionHistory.slice().sort((a, b) => {
    return a.timestamp.valueOf() - b.timestamp.valueOf();
  });
}
