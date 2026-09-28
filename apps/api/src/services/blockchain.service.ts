import { prisma } from '@volttrade/database';
import { MockBlockchainService, BlockchainTxRecord } from '@volttrade/blockchain';
import { BlockchainTransaction } from '@volttrade/shared';

export class AppBlockchainService {
  private mockService: MockBlockchainService;

  constructor() {
    this.mockService = new MockBlockchainService();
    this.initializeFromDb();
  }

  private async initializeFromDb() {
    try {
      const records = await prisma.blockchainTransactionRecord.findMany({
        include: { trade: true },
      });
      for (const r of records) {
        await this.mockService.createTransaction({
          tradeId: r.tradeId,
          buyerId: r.trade?.buyerId || '',
          sellerId: r.trade?.sellerId || '',
          energyAmount: r.energyAmount,
          amount: r.amount,
        });
      }
    } catch {
      // In-memory fallback if DB not yet seeded
    }
  }

  async recordTradeTransaction(tradeId: string, buyerId: string, sellerId: string, energyAmount: number, amount: number): Promise<BlockchainTransaction> {
    const tx = await this.mockService.createTransaction({
      tradeId,
      buyerId,
      sellerId,
      energyAmount,
      amount,
    });

    // Persist to database
    try {
      await prisma.blockchainTransactionRecord.upsert({
        where: { tradeId },
        update: {
          txHash: tx.txHash,
          amount: tx.amount,
          energyAmount: tx.energyAmount,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          status: 'CONFIRMED',
        },
        create: {
          txHash: tx.txHash,
          tradeId,
          amount: tx.amount,
          energyAmount: tx.energyAmount,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          status: 'CONFIRMED',
        },
      });

      // Update trade with hash
      await prisma.trade.update({
        where: { id: tradeId },
        data: { blockchainTxHash: tx.txHash },
      }).catch(() => {});
    } catch (err) {
      console.warn('[Blockchain] DB sync notice:', err);
    }

    return {
      txHash: tx.txHash,
      tradeId: tx.tradeId,
      buyerId: tx.buyerId,
      sellerId: tx.sellerId,
      energyAmount: tx.energyAmount,
      amount: tx.amount,
      timestamp: tx.timestamp,
      status: tx.status,
      blockNumber: tx.blockNumber,
    };
  }

  async getTransaction(txHash: string): Promise<BlockchainTxRecord | null> {
    return this.mockService.getTransaction(txHash);
  }

  async getTransactionByTradeId(tradeId: string): Promise<BlockchainTxRecord | null> {
    return this.mockService.getTransactionByTradeId(tradeId);
  }

  async getAllTransactions(): Promise<BlockchainTxRecord[]> {
    return this.mockService.getAllTransactions();
  }
}

export const blockchainService = new AppBlockchainService();
