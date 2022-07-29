// @ts-nocheck
import * as d3 from 'd3';

import { filterExtremeOutliers } from '../../lib/utils/filterExtremeOutliers';
import { filterProbableOutliers } from '../../lib/utils/filterProbableOutliers';

import './style.css';

const SCALE_BASED_ON_UNFILTERED_DATA = true;
// const SCALE_BASED_ON_UNFILTERED_DATA = false;

const filterData = (dataSet) => {
  // -- slice
  const dataSetSubset = dataSet;
  // const dataSetSubset = dataSet.slice(0, 1000);

  // -- filter
  // return dataSetSubset; // no filters
  // return filterExtremeOutliers(dataSetSubset); // filter only extremes
  return filterProbableOutliers(filterExtremeOutliers(dataSetSubset)); // filter both extremes and probable
};

async function drawSalesData() {
  const rawDataSet = await d3.json('./data/crypto-coven-sales-data.json');
  // const rawDataSet = await d3.json("./data/meebits-sales-data.json");
  // const rawDataSet = await d3.json("./data/fake-sales-data.json");

  const dataSet = rawDataSet;
  // const dataSet = rawDataSet.slice(0, 1000);

  console.time('filter');
  const filteredDataSet = filterData(dataSet);
  console.timeEnd('filter');

  const scaleDataSet = SCALE_BASED_ON_UNFILTERED_DATA
    ? rawDataSet
    : filteredDataSet;

  const xAccessor = (d) => new Date(d.timestamp).getTime();
  const yAccessor = (d) => d.price;

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 200,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw canvas

  const wrapper = d3
    .select('#app')
    .append('svg')
    .attr('class', 'chart-wrapper')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .attr('class', 'bounds')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // 4. Create scales

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(scaleDataSet, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(scaleDataSet, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  // 5. Draw data

  const dots = bounds
    .selectAll('circle')
    .data(filteredDataSet)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(xAccessor(d)))
    .attr('cy', (d) => yScale(yAccessor(d)))
    .attr('fill', '#333')
    .attr('r', 1.5);
}

(async () => {
  await drawSalesData();
})();
