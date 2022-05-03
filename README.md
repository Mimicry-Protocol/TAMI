# Time-Adjusted Market Index (TAMI)
A universal mechanism for calculating the estimated value of a collection of assets. This project is based 
on the [Card Ladder Value](https://drive.google.com/file/d/1rOY3tagsT7axRRxZWECh-0zWoMbaYbNp/view) algorithm
and the [Index Mathmatics Methodology](https://www.spglobal.com/spdji/en/documents/methodologies/methodology-index-math.pdf) 
published by S&P Dow Jones Indices, a division of S&P Global.

## Motivation
Prior to the development of this tool, there was no standardized way to transparently value 
a collection of NFTs. Various data providers such as [ArtCentral](https://artcentral.io), 
[UpShot](https://upshot.xyz/), [bitsCrunch](https://bitscrunch.com/), [NFTGo](https://nftgo.io/), 
[Gallop](https://www.higallop.com/), [Banksea](https://banksea.finance/), and others have developed 
their own proprietary market cap methodology. This fragmentation serves some users, like traders 
seeking alpha, but it does not serve the best interests of all users. For example, opaque AI solutions
are not sufficient for users that wish to rely upon a trustless reference price for NFTfi lending and 
derivative instruments. Moreover, market caps calculated using the floor price of a collection are too
easily manipulated. This is especially dangerous when considered in conjunction with derivative 
protocols for NFT collections.

**Speical Note:** _While this tool was created with NFT collections in mind, it will work for any 
generic basket of non-fungible assets such as trading cards, houses, music licenses, etc._

## How it Works
### Part 1. Calculate the Index Price
#### Methodology
We first calculate an "index price" for an NFT collection, calculated as follows. <br>
```Index Price = S / (N * D)```

Where: <br> 
- ```S``` = Sum of the Last Sold Value of Every Non-Excluded NFT in Collection X
- ```N``` = Number of Non-Excluded NFTs in Collection X with a Secondary Market Sale
- ```D``` = Divisor<sub>old</sub> * (Index Price<sub>new</sub> / Index Price<sub>old</sub>)

For the purposes of normalization, assume that each collection's Index Price begins with a Divisor 
value of ```First Secondary-Market Sale Price of any NFT in the Collection / $1,000```. When the second 
NFT in the Index Price records its first secondary market sale, the Divisor is adjusted. The same happens 
when the third NFT in the Index Price records its first secondary market sale, and the fourth, and so on.

#### Exclusions
Each NFT must have at least 2 sales in the last year, and at least one in the last 6 months, in order to
be included in the index price calculation. 

#### Example
- NFT 1
> Suppose that the first BYAC to record a public online sale is the #1 Ape. Its first sale is $500. <br>
> **Divisor:** ```$500 / 1000 == $0.50```<br>
> **Index Price:** ```$500 / (1 * $0.50) == $1,000```

- NFT 2
> Suppose that the second BYAC to record a public online sale is the #2 Ape. Its first sale is $300. <br>
> **Index Price<sub>old</sub> =** ```$500 / (1 * $0.50) == $1000```<br>
> **Index Price<sub>new</sub> =** ```($500 + $300) / (2 * $0.50) == $800```<br>
> **Divisor<sub>new</sub> =** ```$0.50 * ($800 / $1000) == $0.40```<br>
> **Adjusted Index Price:** ```($500 + $300) / (2 * $0.40) == $1000```<br>

- NFT 2 (2nd Resale)
> Suppose that the second BYAC to record a public online resells at a later date for $750. <br>
> **Index Price:** ```($500 + $750) / (2 * $0.40) == $1562.50```<br>


### Part 2. Calcualte the Index Ratios
Next we must calculate an "index ratio" for each NFT in the collection, calculated as follows. <br>
```Index Ratio = V / IP```

Where: <br>
- ```V```  = NFT Value on Date of Last Sale
- ```IP``` = Index Price on Date of Last Sale

### Part 3. Calculate the Time-Adjusted Market Index
The second to last step is to determine the time-adjusted values of every non-excluded NFT in the collection, 
calculated as follows. <br>
```TAV = IR * IP```

Where: <br>
- ```IR``` = Each NFT's Index Ratio
- ```IV``` = The Index Price of the Collection

And then finally we must sum all the TAVs to calculate the Time-Adjusted Market Index: <br><br>
**TAMI** = TAV<sub>1</sub> + TAV<sub>2</sub> + TAV<sub>3</sub> + etc.

## Advantages to this Methodology
Time-Adjusted Market Indexes offer an analytical lens through which to appraise NFT collections. Unlike an 
opaque and closed-source AI model, this open-source methodology is fully transparent and reproducible by any 
market participant. This methodology is also quite resistant to price manipulation, unlike a calculation that 
is based on floor prices. 


## Pitfalls and Shortcomings
The limitations of this approach are worth noting.

From a practical point of view, TAMIs are limited in scope by the number of NFTs that
comprise them. Some indexes may have thousands of NFTs while others will have a few dozen.

Second, by their nature, TAMIs create generalizations about a market that run the risk of
overlooking unique trends that might be happening in different segments of that market. For example,
this approach does not consider individual NFT attributes such as which hat a Bored Ape may be wearing.

Third, TAMIs are calculated based on the "last sold" value of every NFT in the index,
subject to the above-mentioned limitations that if an NFT has not sold at least twice in the last
year, as well as at least once in the last 6 months, then it is temporarily excluded until it meets
those criteria. It is conceivable that a NFT collections’s market cap can shift during a period in 
which their NFTs are not transacted frequently, which means the index may not track the true market trend.

These three plausible shortcomings of TAMIs are not exhaustive; it is wise to contemplate all conceivable 
shortcomings when utilizing a TAMI to perform analysis.



## List of Web3 Supporters in Favor of this Methodology
The aim of this project is to acheive industry-wide adoption of a standardized and transparent methodology 
for appraising the value of an NFT collection. Please create a pull request on behalf of your organization 
if you'd like to be included in the list below.
- [Mimicry Protocol](https://twitter.com/mimicryprotocol)
