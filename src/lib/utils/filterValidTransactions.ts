import { isAfter, sub } from 'date-fns';

import type { Transaction } from '../types';

/**
 * Given a list of transactions, this returns only transactions that have at least
 * 2 sales in the last year, and at least one sale in the last 6 months.
 */
export function filterValidTransactions(
  transactionHistory: Transaction[]
): Transaction[] {
  const now = new Date();
  const oneYearAgo = sub(now, {
    years: 1,
  });
  const sixMonthsAgo = sub(now, {
    months: 6,
  });

  const inclusionMap: Record<
    Transaction['itemId'],
    {
      pastYearSaleCount: number;
      hasSaleInLastSixMonths: boolean;
      isValid: boolean;
    }
  > = {};

  for (const transaction of transactionHistory) {
    const { itemId, timestamp } = transaction;

    if (!inclusionMap[itemId]) {
      inclusionMap[itemId] = {
        pastYearSaleCount: 0,
        hasSaleInLastSixMonths: false,
        isValid: false,
      };
    }

    const currentMapItem = inclusionMap[itemId];

    if (currentMapItem.isValid) {
      continue;
    }

    // If the transaction did not occur within the last year, it does not affect
    // whether the item is valid or not, so we skip it
    if (!isAfter(timestamp, oneYearAgo)) {
      continue;
    }

    const pastYearSaleCount = currentMapItem.pastYearSaleCount ?? 0;
    currentMapItem.pastYearSaleCount = pastYearSaleCount + 1;

    // If the transaction did not occur within the last six months, since we already
    // incremented the `pastYearSaleCount`, we keep going
    if (!isAfter(timestamp, sixMonthsAgo)) {
      continue;
    }

    currentMapItem.hasSaleInLastSixMonths = true;

    // If the item has 2 or more sales in the last year, it's valid :-)
    if (currentMapItem.pastYearSaleCount >= 2) {
      currentMapItem.isValid = true;
    }
  }

  return transactionHistory.filter((transaction) => {
    return inclusionMap[transaction.itemId].isValid;
  });
}
