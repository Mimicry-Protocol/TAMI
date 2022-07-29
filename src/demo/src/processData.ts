// @ts-nocheck
import * as d3 from 'd3';

export async function processData() {
  const rawDataSet = await d3.json('./data/crypto-coven-sales-data.json');

  return rawDataSet
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => ({
      itemId: item.id,
      timestamp: new Date(item.timestamp * 1000),
      price: item.price,
    }));
}

(async () => {
  const cleanData = await processData();
  console.log(cleanData);
})();
