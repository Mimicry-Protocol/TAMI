import { isAfter, sub } from 'date-fns';

type Transaction = {
  price: number;
  itemId: number | string;
  timestamp: Date;
};

type TransactionMap = Record<Transaction['itemId'], Transaction>;

type IndexValueHistoryItem = {
  itemId: string | number;
  price: number;
  indexValue: number;
  transaction: Transaction;
};

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

/**
 * Given a list of transactions, this crates a list that contains the index value at the
 * time of each transaction, and includes the transaction as well.
 * @see {@link https://github.com/Mimicry-Protocol/TAMI/blob/main/reference/card-ladder-white-paper.pdf}
 */
export function createIndexValueHistory(
  transactionHistory: Transaction[]
): IndexValueHistoryItem[] {
  const transactionMap: TransactionMap = {};

  let lastIndexValue = 0;
  let lastDivisor = 1;

  const result = [];

  for (let i = 0; i < transactionHistory.length; i += 1) {
    const transaction = transactionHistory[i];

    const isFirstSale = !transactionMap[transaction.itemId];

    transactionMap[transaction.itemId] = transaction;

    const itemCount = Object.keys(transactionMap).length;

    const allLastSoldValue = Object.values(transactionMap).reduce(
      (acc, { price }) => {
        return acc + price;
      },
      0
    );

    const indexValue = allLastSoldValue / (itemCount * lastDivisor);

    if (i === 0) {
      lastIndexValue = indexValue;

      result.push({
        itemId: transaction.itemId,
        price: transaction.price,
        indexValue,
        transaction,
      });

      continue;
    }

    const nextDivisor = isFirstSale
      ? lastDivisor * (indexValue / lastIndexValue)
      : lastDivisor;

    const weightedIndexValue = allLastSoldValue / (itemCount * nextDivisor);

    lastIndexValue = weightedIndexValue;
    lastDivisor = nextDivisor;

    result.push({
      itemId: transaction.itemId,
      price: transaction.price,
      indexValue: weightedIndexValue,
      transaction,
    });
  }

  return result;
}

/**
 * Given a list of IndexValueHistoryItem, returns the index value of the last item.
 */
export function getIndexValue(indexValueHistory: IndexValueHistoryItem[]) {
  return indexValueHistory[indexValueHistory.length - 1].indexValue;
}

/**
 * Given a list of IndexValueHistoryItem, calculates the index ratio for the last transaction
 * of each item in the collection. Returns a list of objects where each object is the IndexValueHistoryItem
 * with an additional `indexRatio` property added.
 */
export function getIndexRatios(indexValueHistory: IndexValueHistoryItem[]) {
  const lastSaleMap = indexValueHistory.reduce<
    Record<Transaction['itemId'], IndexValueHistoryItem>
  >((acc, historyItem) => {
    acc[historyItem.itemId] = historyItem;
    return acc;
  }, {});

  return Object.values(lastSaleMap).map((item) => {
    const indexRatio = item.price / item.indexValue;
    return {
      ...item,
      indexRatio,
    };
  });
}

/**
 * Given a list of transactions for a given collection, this calculates the
 * Time Adjusted Market Index for that collection.
 */
export function tami(transactionHistory: Transaction[]) {
  const sortedTransactions = sortTransactions(transactionHistory);
  const validTransactions = filterValidTransactions(sortedTransactions);
  const indexValueHistory = createIndexValueHistory(validTransactions);
  const indexValue = getIndexValue(indexValueHistory);
  const indexRatios = getIndexRatios(indexValueHistory);
  const timeAdjustedValues = indexRatios.map((item) => {
    return indexValue * item.indexRatio;
  });
  const timeAdjustedMarketIndex = timeAdjustedValues.reduce(
    (acc, value) => acc + value,
    0
  );
  return timeAdjustedMarketIndex;
}
