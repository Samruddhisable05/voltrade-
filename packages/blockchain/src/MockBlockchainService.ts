import crypto from 'crypto';
import { BlockchainService, BlockchainTxRecord, CreateTransactionParams } from './BlockchainService';

export class MockBlockchainService implements BlockchainService {
  private transactions: Map<string, BlockchainTxRecord> = new Map();
  private tradeToTxMap: Map<string, string> = new Map();
  private currentBlockNumber: number = 18452100;

  constructor(initialRecords: BlockchainTxRecord[] = []) {
    for (const record of initialRecords) {
      this.transactions.set(record.txHash.toLowerCase(), record);
      this.tradeToTxMap.set(record.tradeId, record.txHash.toLowerCase());
      if (record.blockNumber > this.currentBlockNumber) {
        this.currentBlockNumber = record.blockNumber;
      }
    }
  }

  /**
   * Generates a realistic EVM hex hash: 0x + 64 hex characters
   * e.g., 0x7A93C821...E21F
   */
  private generateTxHash(tradeId: string, timestamp: string): string {
    const raw = `${tradeId}-${timestamp}-${Math.random()}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
    return `0x${hash}`;
  }

  async createTransaction(params: CreateTransactionParams): Promise<BlockchainTxRecord> {
    const timestamp = new Date().toISOString();
    const txHash = this.generateTxHash(params.tradeId, timestamp);
    this.currentBlockNumber += 1;

    const record: BlockchainTxRecord = {
      txHash,
      tradeId: params.tradeId,
      buyerId: params.buyerId,
      sellerId: params.sellerId,
      energyAmount: Number(params.energyAmount.toFixed(4)),
      amount: Number(params.amount.toFixed(2)),
      timestamp,
      status: 'CONFIRMED',
      blockNumber: this.currentBlockNumber,
      gasUsed: Math.floor(21000 + Math.random() * 15000),
    };

    this.transactions.set(txHash.toLowerCase(), record);
    this.tradeToTxMap.set(params.tradeId, txHash.toLowerCase());

    return record;
  }

  async getTransaction(txHash: string): Promise<BlockchainTxRecord | null> {
    return this.transactions.get(txHash.toLowerCase()) || null;
  }

  async getTransactionByTradeId(tradeId: string): Promise<BlockchainTxRecord | null> {
    const txHash = this.tradeToTxMap.get(tradeId);
    if (!txHash) return null;
    return this.transactions.get(txHash) || null;
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    const record = this.transactions.get(txHash.toLowerCase());
    return !!record && record.status === 'CONFIRMED';
  }

  async getAllTransactions(): Promise<BlockchainTxRecord[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
