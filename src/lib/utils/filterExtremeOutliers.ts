import type { Transaction } from '../types';

const MINIMUM_SAMPLE_SET = 100;
const LOWER_CUTOFF_THRESHOLD = 0.05;

/**
 * Given a list of transactions, this function will filter out transactions that are considered "extreme outliers".
 *
 * Extreme outliers are: all sales below 5% of the current average price to date.
 *
 * @param transactionHistory
 */
export function filterExtremeOutliers(
  transactionHistory: Transaction[]
): Transaction[] {
  // don't filter if minimum sample set requirement is not reached
  if (transactionHistory.length <= MINIMUM_SAMPLE_SET) {
    return transactionHistory;
  }

  const avg = calculateAveragePrice(transactionHistory);
  return transactionHistory.filter(
    // keep sales whose price is above the cutoff threshold
    (item) => item.price > avg * LOWER_CUTOFF_THRESHOLD
  );
}

function calculateAveragePrice(
  transactionHistoryToDate: Transaction[]
): number {
  if (transactionHistoryToDate.length === 0) {
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < transactionHistoryToDate.length; i++) {
    sum += transactionHistoryToDate[i].price;
  }

  return sum / transactionHistoryToDate.length;
}
