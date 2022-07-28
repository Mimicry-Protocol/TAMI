import type { Transaction } from '../types';

const WINDOW_SIZE = 50;
const LOWER_CUTOFF_THRESHOLD = 0.65;
const UPPER_CUTOFF_THRESHOLD = 1.75;

/**
 * Given a list of transactions, this function will filter out transactions that are considered "probable outliers".
 *
 * Probable outliers are: ---
 *
 * Secondly, we calculate a running average of the last 50 prices over all sales. A truncated mean with the
 * top three and bottom three sales removed is used to calculate the robust average. All sales that are
 * below 65% of the running average and above 175% of this value are removed.
 *
 * @param transactionHistory
 */
export function filterProbableOutliers(
  transactionHistory: Transaction[]
): Transaction[] {
  const SMA = calculateRunningAverage(transactionHistory, WINDOW_SIZE);
  // TODO: calculate robust average

  const filteredData: Transaction[] = [];
  const startFrom = transactionHistory.length - SMA.length;

  for (let i = startFrom, j = 0; i < transactionHistory.length; i++, j++) {
    if (
      transactionHistory[i].price < SMA[j].price * UPPER_CUTOFF_THRESHOLD &&
      transactionHistory[i].price > SMA[j].price * LOWER_CUTOFF_THRESHOLD
    ) {
      filteredData.push(transactionHistory[i]);
    }
  }

  return filteredData;
}

export function calculateRunningAverage(prices, window) {
  if (!prices || prices.length < window) {
    return [];
  }

  let index = window - 1;
  const length = prices.length + 1;

  const SMA = [];

  while (++index < length) {
    const windowSlice = prices.slice(index - window, index);
    const sum = windowSlice.reduce((prev, curr) => prev + curr.price, 0);
    SMA.push({ timestamp: prices.timestamp, price: sum / window });
  }

  return SMA;
}
