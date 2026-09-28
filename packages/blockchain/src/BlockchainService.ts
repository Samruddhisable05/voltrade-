export interface CreateTransactionParams {
  tradeId: string;
  buyerId: string;
  sellerId: string;
  energyAmount: number; // kWh
  amount: number;       // ₹ total
}

export interface BlockchainTxRecord {
  txHash: string;
  tradeId: string;
  buyerId: string;
  sellerId: string;
  energyAmount: number;
  amount: number;
  timestamp: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  blockNumber: number;
  gasUsed?: number;
}

export interface BlockchainService {
  createTransaction(params: CreateTransactionParams): Promise<BlockchainTxRecord>;
  getTransaction(txHash: string): Promise<BlockchainTxRecord | null>;
  getTransactionByTradeId(tradeId: string): Promise<BlockchainTxRecord | null>;
  verifyTransaction(txHash: string): Promise<boolean>;
  getAllTransactions(): Promise<BlockchainTxRecord[]>;
}
