import type { Transaction } from '../types';

/**
 * Given a list of transactions, this filters out transactions that are
 * considered "extreme outliers".
 */
export function filterExtremeOutliers(
  transactionHistory: Transaction[]
): Transaction[] {
  const n = transactionHistory.length;
  // not enough samples to filter outliers, return as is
  if (n < 100) {
    return transactionHistory;
  }

  const sum = transactionHistory.reduce((acc, cur) => {
    return acc + cur.price;
  }, 0);

  const mean = (1 / (n - 1)) * sum;
  const cutoff = 0.05 * mean;

  return transactionHistory.filter(
    (item) =>
      // keep in list, if price is above cutoff threshold
      item.price > cutoff
  );
}
