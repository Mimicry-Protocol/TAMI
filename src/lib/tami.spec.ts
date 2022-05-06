import test from 'ava';

import {
  createIndexValueHistory,
  getIndexRatios,
  getIndexValue,
  tami,
} from './tami';

const mockTransactionHistory = [
  {
    price: 455,
    itemId: 1,
  },
  {
    price: 126,
    itemId: 2,
  },
  {
    price: 177.5,
    itemId: 2,
  },
];

const expectedValues = {
  indexValueHistory: [
    {
      itemId: 1,
      price: 455,
      indexValue: 455,
      transaction: {
        price: 455,
        itemId: 1,
      },
    },
    {
      itemId: 2,
      price: 126,
      indexValue: 455.00000000000006,
      transaction: {
        price: 126,
        itemId: 2,
      },
    },
    {
      itemId: 2,
      price: 177.5,
      indexValue: 495.33132530120486,
      transaction: {
        price: 177.5,
        itemId: 2,
      },
    },
  ],
  indexValue: 495.33132530120486,
  indexRatios: [
    {
      itemId: 1,
      price: 455,
      indexValue: 455,
      transaction: {
        price: 455,
        itemId: 1,
      },
      indexRatio: 1,
    },
    {
      itemId: 2,
      price: 177.5,
      indexValue: 495.33132530120486,
      transaction: {
        price: 177.5,
        itemId: 2,
      },
      indexRatio: 0.3583460018242627,
    },
  ],
  timeAdjustedValues: [495.33132530120486, 177.5],
  timeAdjustedMarketIndex: 672.8313253012049,
};

test('createIndexValueHistory', (t) => {
  const indexValueHistory = createIndexValueHistory(mockTransactionHistory);
  t.deepEqual(indexValueHistory, expectedValues.indexValueHistory);
});

test('getIndexRatios', (t) => {
  const indexValueHistory = createIndexValueHistory(mockTransactionHistory);
  const indexRatios = getIndexRatios(indexValueHistory);
  t.deepEqual(indexRatios, expectedValues.indexRatios);
});

test('getIndexValue', (t) => {
  const indexValueHistory = createIndexValueHistory(mockTransactionHistory);
  const indexValue = getIndexValue(indexValueHistory);
  t.is(indexValue, expectedValues.indexValue);
});

test('tami', (t) => {
  const value = tami(mockTransactionHistory);
  t.is(value, expectedValues.timeAdjustedMarketIndex);
});
