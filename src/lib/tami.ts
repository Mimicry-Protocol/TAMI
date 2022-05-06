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
 * @see {@link https://drive.google.com/file/d/1rOY3tagsT7axRRxZWECh-0zWoMbaYbNp/view}
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

    const cardCount = Object.keys(transactionMap).length;

    const allLastSoldValue = Object.values(transactionMap).reduce(
      (acc, { price }) => {
        return acc + price;
      },
      0
    );

    const indexValue = allLastSoldValue / (cardCount * lastDivisor);

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

    const weightedIndexValue = allLastSoldValue / (cardCount * nextDivisor);

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

export function getIndexValue(indexValueHistory: IndexValueHistoryItem[]) {
  return indexValueHistory[indexValueHistory.length - 1].indexValue;
}

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
