# Time-Adjusted Market Index (TAMI)

A universal mechanism for calculating the estimated value of a collection of assets. This project is based on the [Card Ladder Value](https://github.com/Mimicry-Protocol/TAMI/blob/main/reference/card-ladder-white-paper.pdf) algorithm and the [Index Mathmatics Methodology](https://github.com/Mimicry-Protocol/TAMI/blob/main/reference/methodology-index-math.pdf) published by S&P Dow Jones Indices, a division of S&P Global.

## Usage

```tsx
import {tami} from '@mimicry/tami';

const transactions = [
  { itemId: 'Lavender', timestamp: 1593129600000, price: 500 },
  { itemId: 'Hyacinth', timestamp: 1600992000000, price: 700 },
  { itemId: 'Hyacinth', timestamp: 1614211200000, price: 400 },
  { itemId: 'Mars', timestamp: 1624406400000, price: 612 },
  { itemId: 'Mars', timestamp: 1639008000000, price: 1200 },
];

const timeAdjustedMarketValue = tami(transactions); // 2276.3888888888887
```

## Motivation

Prior to the development of this tool, there was no standardized way to transparently value a collection of NFTs. Various data providers such as [ArtCentral](https://artcentral.io), [UpShot](https://upshot.xyz/), [bitsCrunch](https://bitscrunch.com/), [NFTGo](https://nftgo.io/), [Gallop](https://www.higallop.com/), [Banksea](https://banksea.finance/), and others have developed their own proprietary market cap methodology. This fragmentation serves some users, like traders seeking alpha, but it does not serve the best interests of all users. For example, opaque AI solutions are not sufficient for users that wish to rely upon a trustless reference price for NFTfi lending and derivative instruments. Moreover, market caps calculated using the floor price of a collection are too easily manipulated. This is especially dangerous when considered in conjunction with derivative protocols for NFT collections.

**Speical Note:** _While this tool was created with NFT collections in mind, it will work for any generic basket of non-fungible assets such as trading cards, houses, music licenses, etc._

## How it Works

### Part 1. Calculate the Index Price

#### Methodology

We first calculate an **Index Price** for an NFT collection, calculated as follows:

`Index Price = S / (N * D)`

Where:

- `S` = Sum of the Last Sold Value of Every Non-Excluded NFT in Collection X
- `N` = Number of Non-Excluded NFTs in Collection X with a Secondary Market Sale
- `D` = Divisor<sub>old</sub> * (Index Price<sub>new</sub> / Index Price<sub>old</sub>)

When the Index Price is first calculated, we begin with a Divisor value of 1. When the second NFT in the collection records its first secondary market sale, the Divisor is adjusted. The same happens when the third NFT in the Index Price records its first secondary market sale, and the fourth, and so on.

#### Exclusions

Each NFT must have at least 2 sales in the last year, and at least one in the last 6 months, in order to be included in the Index Price calculation. 

#### Example

Pretend we want to calculate the value of the [Crypto Coven](https://www.cryptocoven.xyz/) NFT project. For simplicity's sake, we'll say the collection only has three NFTs:

* Lavender
* Hyacinth
* Mars

We'll also ignore the exclusion rules to focus on the calculation itself. Assume the entire secondary market purchase history of the Crypto Coven project looks like this:

| # | name | price |
|-|-|-|
| 1 | Lavender | $500 |
| 2 | Hyacinth | $700 |
| 3 | Hyacinth | $400 |
| 4 | Mars | $612 |
| 5 | Mars | $1200 |

Given this information, let's see how each sale affects the Index Value:

**Transaction 1 (excluded)**

* **Name**: Lavender
* **Price:** $500
* **Unique NFTs sold**: `1`
* **Divisor<sub>old</sub>:** `1 (initial value)`
* **Index Price<sub>old</sub>**: `n/a`
* **Index Price<sub>new</sub>**: `$500 / (1 * 1) = $500`
* **Divisor<sub>new</sub>:** `1` _(we keep 1 as the new Divisor value after the initial transaction)_

**Transaction 2**

* **Name**: Hyacinth _(we have a first secondary market sale 🧙‍♀️)_
* **Price:** $700
* **Unique NFTs sold**: `2`
* **Divisor<sub>old</sub>:** `1`
* **Index Price<sub>old</sub>**: `$500`
* **Index Price<sub>new</sub>**: `($500 + $700) / (2 * 1) = $600`
* **Divisor<sub>new</sub>:** `1 * ($600 / $500) = 1.2`
* **Divisor Adjusted Index Price:** `($500 + $700) / (2 * 1.2) = $500` 
  * _Note that a first secondary market sale does not affect the index price due to the divisor_

**Transaction 3**

* **Name**: Hyacinth
* **Price:** $400
* **Unique NFTs sold**: `2`
* **Divisor<sub>old</sub>:** `1.2`
* **Index Price<sub>old</sub>**: ~~`$500`~~
  * _Unused, since we only use this to adjust the divisor, and we only adjust the divisor when there is a first secondary market sale_
* **Index Price<sub>new</sub>**: `($500 + $400) / (2 * 1.2) = $375`
* **Divisor<sub>new</sub>:** `1.2`

**Transaction 4**

* **Name**: Mars _(first secondary market sale 🎉)_
* **Price:** $612
* **Unique NFTs sold**: `3`
* **Divisor<sub>old</sub>:** `1.2`
* **Index Price<sub>old</sub>**: `$375`
* **Index Price<sub>new</sub>**: `($500 + $400 + $612) / (3 * 1.2) = $420`
* **Divisor<sub>new</sub>:** `1.2 * ($420 / $375) = 1.344`
* **Divisor Adjusted Index Price:** `($500 + $400 + $612) / (3 * 1.344) = $375`

**Transaction 5**

* **Name**: Mars
* **Price:** $1200
* **Unique NFTs sold**: `3`
* **Divisor<sub>old</sub>:** `1.344`
* **Index Price<sub>old</sub>**: ~~`$375`~~
* **Index Price<sub>new</sub>**: `($500 + $400 + $1200) / (3 * 1.344) = $520.83`
* **Divisor<sub>new</sub>:** `1.344`

**Result:**
The Index Price of this collection is **$520.83**

The index price of the collection at each transaction looks like this:

| # | name | price | index price |
|-|-|-|-|
| 1 | Lavender | $500 | $500 |
| 2 | Hyacinth | $700 | $500 |
| 3 | Hyacinth | $400 | $375 |
| 4 | Mars | $612 | $375 |
| 5 | Mars | $1200 | $520.83 |

### Part 2. Calcualte the Index Ratios

Next we must calculate an "index ratio" for each NFT in the collection, calculated as follows:

`Index Ratio = V / IP`

Where:
- `V`  = NFT Value on Date of Last Sale
- `IP` = Index Price on Date of Last Sale

#### Example

| name | price | index price | index ratio |
|-|-|-|-|
| Lavender | $500 | $500 | 1 |
| Hyacinth | $400 | $375 | 1.066... |
| Mars | $1200 | $520.83 | 2.304 |

### Part 3. Calculate the Time-Adjusted Market Index

The second to last step is to determine the time-adjusted values of every non-excluded NFT in the collection, calculated as follows:

`TAV = IR * IP`

Where:

- `IR` = Each NFT's Index Ratio
- `IV` = The Index Price of the Collection

#### Example

**Collection Index Price:** $520.83

| name | index ratio | time-adjusted values |
|-|-|-|
| Lavender | 1 | `$520.83 * 1 = $520.83` |
| Hyacinth | 1.066... | `$520.83 * 1.066... = $555.56` |
| Mars | 2.304 | `$520.83 * 2.304 = $1199.99` |

And then finally we must sum all the TAVs to calculate the Time-Adjusted Market Index:

**TAMI** = TAV<sub>1</sub> + TAV<sub>2</sub> + TAV<sub>3</sub> + etc.

I.e. the Time Adjusted Market Index in this example is: **$2276.38**

## Advantages to this Methodology

Time-Adjusted Market Indexes offer an analytical lens through which to appraise NFT collections. Unlike an opaque and closed-source AI model, this open-source methodology is fully transparent and reproducible by any market participant. This methodology is also quite resistant to price manipulation, unlike a calculation that is based on floor prices. 


## Pitfalls and Shortcomings

The limitations of this approach are worth noting.

From a practical point of view, TAMIs are limited in scope by the number of NFTs that comprise them. Some indexes may have thousands of NFTs while others will have a few dozen.

Second, by their nature, TAMIs create generalizations about a market that run the risk of overlooking unique trends that might be happening in different segments of that market. For example, this approach does not consider individual NFT attributes such as which hat a Bored Ape may be wearing.

Third, TAMIs are calculated based on the "last sold" value of every NFT in the index, subject to the above-mentioned limitations that if an NFT has not sold at least twice in the last year, as well as at least once in the last 6 months, then it is temporarily excluded until it meets those criteria. It is conceivable that a NFT collections’s market cap can shift during a period in which their NFTs are not transacted frequently, which means the index may not track the true market trend.

These three plausible shortcomings of TAMIs are not exhaustive; it is wise to contemplate all conceivable shortcomings when utilizing a TAMI to perform analysis.

## List of Web3 Supporters in Favor of this Methodology

The aim of this project is to acheive industry-wide adoption of a standardized and transparent methodology for appraising the value of an NFT collection. Please create a pull request on behalf of your organization if you'd like to be included in the list below.

- [Mimicry Protocol](https://twitter.com/mimicryprotocol)
