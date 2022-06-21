export type Transaction = {
  price: number;
  itemId: number | string;
  timestamp: Date;
};

export type TransactionMap = Record<Transaction['itemId'], Transaction>;

export type IndexValueHistoryItem = {
  itemId: string | number;
  price: number;
  indexValue: number;
  transaction: Transaction;
};
