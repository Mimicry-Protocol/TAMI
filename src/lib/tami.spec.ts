import test from 'ava';
import { sub } from 'date-fns';

import {
  createIndexValueHistory,
  getIndexRatios,
  getIndexValue,
  tami,
} from './tami';

const now = new Date();
const yesterday = sub(now, {
  days: 1,
});
const twoYearsAgo = sub(now, {
  years: 2,
});

const mockTransactionHistory = [
  // Lavender should be excluded since she did not have two transactions in the past year
  { itemId: 'Lavender', price: 500, timestamp: yesterday },
  { itemId: 'Hyacinth', price: 700, timestamp: yesterday },
  { itemId: 'Hyacinth', price: 400, timestamp: yesterday },
  { itemId: 'Mars', price: 612, timestamp: yesterday },
  { itemId: 'Mars', price: 1200, timestamp: yesterday },
  // Nyx should be excluded since she did not have two transactions in the past year
  { itemId: 'Nyx', price: 612, timestamp: twoYearsAgo },
  { itemId: 'Nyx', price: 1200, timestamp: yesterday },
];

const expectedValues = {
  indexValueHistory: [
    {
      itemId: 'Hyacinth',
      price: 700,
      indexValue: 1.4,
      transaction: {
        itemId: 'Hyacinth',
        price: 700,
        timestamp: yesterday,
      },
    },
    {
      itemId: 'Hyacinth',
      price: 400,
      indexValue: 0.8,
      transaction: {
        itemId: 'Hyacinth',
        price: 400,
        timestamp: yesterday,
      },
    },
    {
      itemId: 'Mars',
      price: 612,
      indexValue: 0.8,
      transaction: {
        itemId: 'Mars',
        price: 612,
        timestamp: yesterday,
      },
    },
    {
      itemId: 'Mars',
      price: 1200,
      indexValue: 1.2648221343873518,
      transaction: {
        itemId: 'Mars',
        price: 1200,
        timestamp: yesterday,
      },
    },
  ],
  indexValue: 1.2648221343873518,
  indexRatios: [
    {
      itemId: 'Hyacinth',
      price: 400,
      indexValue: 0.8,
      transaction: {
        itemId: 'Hyacinth',
        price: 400,
        timestamp: yesterday,
      },
      indexRatio: 500,
    },
    {
      itemId: 'Mars',
      price: 1200,
      indexValue: 1.2648221343873518,
      transaction: {
        itemId: 'Mars',
        price: 1200,
        timestamp: yesterday,
      },
      indexRatio: 948.75,
    },
  ],
  timeAdjustedValues: [632.4110671936759, 1200],
  timeAdjustedMarketIndex: 1832.411067193676,
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
