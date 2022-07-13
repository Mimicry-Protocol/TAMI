import type { Transaction } from '../types';

const MINIMUM_SAMPLE_SET = 100;
const LOWER_CUTOFF_THRESHOLD = 0.05;

/**
 * Given a list of transactions, this filters out transactions that are
 * considered "extreme outliers".
 *
 * @param transactionHistory
 */
export function filterExtremeOutliers(
  transactionHistory: Transaction[]
): Transaction[] {
  const filteredTransactions = [];

  for (let i = 0; i < transactionHistory.length; i++) {
    const currentTransaction = transactionHistory[i];

    // minimum sample set threshold not reached, don't trigger filter logic
    if (i < MINIMUM_SAMPLE_SET) {
      filteredTransactions.push(currentTransaction);
    } else {
      // transaction history to date, excluding the current transaction itself
      const transactionHistoryToDate = transactionHistory.slice(0, i);

      if (keepSaleTransaction(currentTransaction, transactionHistoryToDate)) {
        filteredTransactions.push(currentTransaction);
      }
    }
  }

  return filteredTransactions;
}

/**
 * Given a single sale transaction and a history of sales to date, determine if
 * the given transaction should be kept in the list or rejected as an extreme
 * outlier.
 *
 * @param transaction
 * @param transactionHistoryToDate
 */
function keepSaleTransaction(
  transaction: Transaction,
  transactionHistoryToDate: Transaction[]
) {
  const sum = transactionHistoryToDate.reduce((acc, cur) => {
    return acc + cur.price;
  }, 0);

  const mean = (1 / transactionHistoryToDate.length) * sum;
  const cutoff = LOWER_CUTOFF_THRESHOLD * mean;

  return transaction.price > cutoff;
}
