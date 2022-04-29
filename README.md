# Time-Adjusted Market Index
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

For the purposes of this calculation, assume that each collection's Index Price begins with a Divisor 
value of ```First Secondary-Market Sale Price of any NFT in the Collection / $1,000```. When the second 
NFT in the Index Price records its first secondary market sale, the Divisor is adjusted. The same happens 
when the third NFT in the Index Price records its first secondary market sale, and the fourth, and so on.

#### Exclusions
Each NFT must have at least 2 sales in the last year, and at least one in the last 6 months, in order to
be included in the index price calculation. 

### Part 2. Calcualte the Index Ratios
Next we must calculate an "index ratio" for each NFT in the collection, calculated as follows. <br>
```Index Ratio = V / IP```

Where: <br>
- ```V```  = NFT Value on Date of Last Sale
- ```IP``` = Index Price on Date of Last Sale

### Part 3. Calculate the Time-Adjusted Market Index
Almost finally, we must determine the time-adjusted values of every non-excluded NFT in the collection, 
calculated as follows. <br>
```TAV = IR * IP```

Where: <br>
- ```IR``` = Each NFTs Index Ratio
- ```IV``` = The Index Price of the Collection

And then finally we must sum all the TAVs to calculate the Time-Adjusted Market Index: <br>
TAMI = TAV<sub>1</sub> + TAV<sub>2</sub> + TAV<sub>3</sub> + etc.


## List of Web3 Supporters in Favor of this Methodology
The aim of this project is to acheive industry-wide adoption of a standardized and transparent methodology 
for appraising the value of an NFT collection. Please create a pull request on behalf of your organization 
if you'd like to be included in the list below.
- [Mimicry Protocol](https://twitter.com/mimicryprotocol)
