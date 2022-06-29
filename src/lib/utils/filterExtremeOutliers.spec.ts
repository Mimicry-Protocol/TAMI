import test from 'ava';

import salesDataSet_Large from './__mocks__/sales_large_set.json';
import expectedSalesDataSet_Large from './__mocks__/sales_large_set_filtered.json';
import salesDataSet_Small from './__mocks__/sales_small_set.json';
import { filterExtremeOutliers } from './filterExtremeOutliers';

type mockDataObject = {
  itemId: number | string;
  timestamp: number;
  price: number;
};

const cleanTimeStamps = (item: mockDataObject) => ({
  itemId: item.itemId,
  timestamp: new Date(item.timestamp),
  price: item.price,
});

const cleanSalesDataLarge = salesDataSet_Large.map(cleanTimeStamps);
const cleanSalesExpectedDataLarge =
  expectedSalesDataSet_Large.map(cleanTimeStamps);
const clean_salesDataSet_Small = salesDataSet_Small.map(cleanTimeStamps);

test('filter for extreme outliers if n >= 100', (t) => {
  const value = filterExtremeOutliers(cleanSalesDataLarge);
  t.deepEqual(value, cleanSalesExpectedDataLarge);
});

test('skip filtering for extreme outliers if n < 100', (t) => {
  const value = filterExtremeOutliers(clean_salesDataSet_Small);
  t.deepEqual(value, clean_salesDataSet_Small);
});
