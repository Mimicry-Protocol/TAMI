type Transaction = {
  price: number;
  itemId: number | string;
  timestamp: Date;
};

/**
 * Given a list of **sorted**, **non-excluded** transactions for a given collection, this calculates the
 * Time Adjusted Market Index for that collection.
 *
 * This is a dynamic version of `tami.ts` which is optimized to calculate TAMI in O(n) time, and in a single
 * pass of collection data.
 *
 * **NOTE:** This function assumes transactions have already been sorted in chronological order, and that
 * all items in the collection meet the criteria to be included in the TAMI calculation.
 *
 * For reference, the exclusion rules state:
 *
 * Each NFT must have _at least 2 sales in the last year_, and _at least one in the last 6 months_.
 *
 * @returns TAMI for list of transaction data
 */
export function dynamicTami(transactionData: Transaction[]) {
  const indexRatiosByCollection: Record<
    number | string,
    {
      price: number;
      indexPrice: number;
      indexRatio: number;
    }
  > = {};

  let itemCount = 0;
  let sumOfLastSoldValues = 0;
  let cumulativeIndexRatios = 0;

  let divisor = 1;
  let lastIndexPrice = 0;

  for (let i = 0; i < transactionData.length; i++) {
    const { itemId, price } = transactionData[i];

    let indexPrice: number;

    const isFirstCollectionSale = i === 0;
    const isFirstItemSale = indexRatiosByCollection[itemId] === undefined;

    if (isFirstCollectionSale) {
      itemCount = 1;
      sumOfLastSoldValues = price;
      indexPrice = price;
    } else if (!isFirstItemSale) {
      // If it's not the first sale of this particular NFT, we just
      // we only have to calculate the new index price
      const priceDifference = price - indexRatiosByCollection[itemId].price;
      sumOfLastSoldValues += priceDifference;
      indexPrice = sumOfLastSoldValues / (itemCount * divisor);
    } else {
      // Otherwise, we bump the item count
      itemCount += 1;
      sumOfLastSoldValues += price;
      // Calculate the temporary index price
      const newIndexPrice = sumOfLastSoldValues / (itemCount * divisor);
      // Calculate the new divisor
      divisor = divisor * (newIndexPrice / lastIndexPrice);
      // And use it to calculcate the divisor-adjusted index price
      indexPrice = sumOfLastSoldValues / (itemCount * divisor);
    }

    lastIndexPrice = indexPrice;

    const indexRatio = price / indexPrice;

    const itemValues = {
      price,
      indexPrice,
      indexRatio,
    };

    const prevIndexRatio = indexRatiosByCollection[itemId]?.indexRatio ?? 0;

    cumulativeIndexRatios -= prevIndexRatio;

    cumulativeIndexRatios += indexRatio;

    indexRatiosByCollection[itemId] = itemValues;
  }

  return lastIndexPrice * cumulativeIndexRatios;
}
