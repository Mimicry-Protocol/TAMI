import test from 'ava';
import { sub } from 'date-fns';

import {
  createIndexValueHistory,
  filterValidTransactions,
  getIndexRatios,
  getIndexValue,
  sortTransactions,
  tami,
} from './tami';

const now = new Date();
const yesterday = sub(now, {
  days: 1,
});
const twoDaysAgo = sub(now, {
  days: 2,
});
const threeDaysAgo = sub(now, {
  days: 3,
});
const oneMonthAgo = sub(now, {
  months: 1,
});
const sixWeeksAgo = sub(now, {
  weeks: 6,
});
const twoYearsAgo = sub(now, {
  years: 2,
});

const mockTransactionHistory = [
  // Lavender should be excluded since she did not have two transactions in the past year
  { itemId: 'Lavender', price: 500, timestamp: threeDaysAgo },
  { itemId: 'Hyacinth', price: 700, timestamp: oneMonthAgo },
  { itemId: 'Mars', price: 1200, timestamp: twoDaysAgo },
  // Nyx should be excluded since she did not have two transactions in the past year
  { itemId: 'Nyx', price: 612, timestamp: twoYearsAgo },
  { itemId: 'Hyacinth', price: 400, timestamp: threeDaysAgo },
  { itemId: 'Nyx', price: 1200, timestamp: yesterday },
  { itemId: 'Mars', price: 612, timestamp: sixWeeksAgo },
];

const expectedValues = {
  sortedTransactions: [
    { itemId: 'Nyx', price: 612, timestamp: twoYearsAgo },
    { itemId: 'Mars', price: 612, timestamp: sixWeeksAgo },
    { itemId: 'Hyacinth', price: 700, timestamp: oneMonthAgo },
    { itemId: 'Lavender', price: 500, timestamp: threeDaysAgo },
    { itemId: 'Hyacinth', price: 400, timestamp: threeDaysAgo },
    { itemId: 'Mars', price: 1200, timestamp: twoDaysAgo },
    { itemId: 'Nyx', price: 1200, timestamp: yesterday },
  ],
  validTransactions: [
    { itemId: 'Mars', price: 612, timestamp: sixWeeksAgo },
    { itemId: 'Hyacinth', price: 700, timestamp: oneMonthAgo },
    { itemId: 'Hyacinth', price: 400, timestamp: threeDaysAgo },
    { itemId: 'Mars', price: 1200, timestamp: twoDaysAgo },
  ],
  indexValueHistory: [
    {
      itemId: 'Mars',
      price: 612,
      indexValue: 612,
      transaction: {
        itemId: 'Mars',
        price: 612,
        timestamp: sixWeeksAgo,
      },
    },
    {
      itemId: 'Hyacinth',
      price: 700,
      indexValue: 612,
      transaction: {
        itemId: 'Hyacinth',
        price: 700,
        timestamp: oneMonthAgo,
      },
    },
    {
      itemId: 'Hyacinth',
      price: 400,
      indexValue: 472.0609756097561,
      transaction: {
        itemId: 'Hyacinth',
        price: 400,
        timestamp: threeDaysAgo,
      },
    },
    {
      itemId: 'Mars',
      price: 1200,
      indexValue: 746.3414634146342,
      transaction: {
        itemId: 'Mars',
        price: 1200,
        timestamp: twoDaysAgo,
      },
    },
  ],
  indexValue: 746.3414634146342,
  indexRatios: [
    {
      itemId: 'Mars',
      price: 1200,
      indexValue: 746.3414634146342,
      transaction: {
        itemId: 'Mars',
        price: 1200,
        timestamp: twoDaysAgo,
      },
      indexRatio: 1.6078431372549018,
    },
    {
      itemId: 'Hyacinth',
      price: 400,
      indexValue: 472.0609756097561,
      transaction: {
        itemId: 'Hyacinth',
        price: 400,
        timestamp: threeDaysAgo,
      },
      indexRatio: 0.847348161926167,
    },
  ],
  timeAdjustedValues: [1200, 632.4110671936759],
  timeAdjustedMarketIndex: 1832.411067193676,
};

const sortedTransactions = sortTransactions(mockTransactionHistory);
const validTransactions = filterValidTransactions(sortedTransactions);

test('createIndexValueHistory', (t) => {
  const indexValueHistory = createIndexValueHistory(validTransactions);
  t.deepEqual(indexValueHistory, expectedValues.indexValueHistory);
});

test('getIndexRatios', (t) => {
  const indexValueHistory = createIndexValueHistory(validTransactions);
  const indexRatios = getIndexRatios(indexValueHistory);
  t.deepEqual(indexRatios, expectedValues.indexRatios);
});

test('getIndexValue', (t) => {
  const indexValueHistory = createIndexValueHistory(validTransactions);
  const indexValue = getIndexValue(indexValueHistory);
  t.is(indexValue, expectedValues.indexValue);
});

test('tami with transaction data', (t) => {
  const value = tami(validTransactions);
  t.is(value, expectedValues.timeAdjustedMarketIndex);
});

test('tami with empty transaction data', (t) => {
  const value = tami([]);
  t.is(value, null);
});
