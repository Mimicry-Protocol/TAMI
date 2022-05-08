type Transaction = {
  price: number;
  itemId: number | string;
};

type TransactionMap = Record<Transaction['itemId'], Transaction>;

type IndexValueHistoryItem = {
  itemId: string | number;
  price: number;
  indexValue: number;
  transaction: Transaction;
};

/**
 * Given a list of transactions sorted in chronological order, this crates a list that contains
 * the index value at the time of each transaction, and includes the transaction as well.
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
 * Given a list of transactions for a given collection, sorted in chronological order,
 * this calculates the Time Adjusted Market Index for that collection.
 */
export function tami(transactionHistory: Transaction[]) {
  const indexValueHistory = createIndexValueHistory(transactionHistory);
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
