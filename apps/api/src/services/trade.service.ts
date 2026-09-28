import { prisma } from '@volttrade/database';
import { Trade, TradeStatus } from '@volttrade/shared';
import { walletService } from './wallet.service';
import { blockchainService } from './blockchain.service';
import { deviceService } from './device.service';
import { notificationService } from './notification.service';

export interface ExecuteTradeParams {
  buyerId: string;
  sellerId: string;
  offerId?: string | null;
  energyAmount: number;
  pricePerKwh: number;
  totalAmount: number;
}

export class TradeService {
  /**
   * Executes the full end-to-end P2P trade lifecycle:
   * REQUESTED -> MATCHED -> PAYMENT_CONFIRMED -> BLOCKCHAIN_CONFIRMED -> ENERGY_DELIVERED -> COMPLETED
   */
  async executeTrade(params: ExecuteTradeParams): Promise<Trade> {
    const { buyerId, sellerId, offerId, energyAmount, pricePerKwh, totalAmount } = params;

    // 1. Check buyer balance before creating trade
    const debitResult = await walletService.debit(
      buyerId,
      totalAmount,
      undefined,
      `P2P Purchase of ${energyAmount} kWh @ ₹${pricePerKwh}/kWh`
    );

    if (!debitResult.success) {
      throw new Error(debitResult.error || 'Buyer has insufficient wallet funds.');
    }

    // 2. Create Trade record in database with initial status REQUESTED -> MATCHED
    const tradeRecord = await prisma.trade.create({
      data: {
        buyerId,
        sellerId,
        offerId,
        energyAmount,
        pricePerKwh,
        totalAmount,
        status: 'MATCHED',
      },
      include: {
        buyer: true,
        seller: true,
      },
    });

    await notificationService.notify(
      'Trade Matched',
      `${energyAmount} kWh matched between ${tradeRecord.seller.name} and ${tradeRecord.buyer.name} for ₹${totalAmount}.`,
      'INFO',
      buyerId
    );

    // 3. Process seller credit (Virtual wallet accounting)
    await walletService.credit(
      sellerId,
      totalAmount,
      tradeRecord.id,
      `P2P Sale of ${energyAmount} kWh to ${tradeRecord.buyer.name}`
    );

    await prisma.trade.update({
      where: { id: tradeRecord.id },
      data: { status: 'PAYMENT_CONFIRMED' },
    });

    // 4. Record Mock Blockchain Transaction
    const btcTx = await blockchainService.recordTradeTransaction(
      tradeRecord.id,
      buyerId,
      sellerId,
      energyAmount,
      totalAmount
    );

    await prisma.trade.update({
      where: { id: tradeRecord.id },
      data: {
        status: 'BLOCKCHAIN_CONFIRMED',
        blockchainTxHash: btcTx.txHash,
      },
    });

    await notificationService.notify(
      'Blockchain Verified',
      `Trade #${tradeRecord.id.substring(0, 8)} notarized on blockchain: ${btcTx.txHash.substring(0, 10)}...`,
      'SUCCESS',
      buyerId
    );

    // 5. Hardware Relay Trigger (Dispatch command to ESP32 Smart Meter)
    // Find seller's device or fallback to ESP32-HOUSE-A
    const sellerDevice = await prisma.device.findFirst({
      where: { userId: sellerId },
    });
    const targetDeviceId = sellerDevice?.deviceId || 'ESP32-HOUSE-A';

    try {
      await deviceService.createCommand(targetDeviceId, 'ACTIVATE_LOAD', 5000);
      
      await notificationService.notify(
        'Energy Delivery Commenced',
        `Relay command sent to ${targetDeviceId}. Consumer load LED active for 5 seconds.`,
        'SUCCESS',
        buyerId
      );

      await prisma.trade.update({
        where: { id: tradeRecord.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    } catch (err) {
      console.error('[TradeService] Hardware command notice:', err);
    }

    const completed = await this.getTradeById(tradeRecord.id);
    return completed!;
  }

  async getTradeById(id: string): Promise<Trade | null> {
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        buyer: true,
        seller: true,
      },
    });

    if (!trade) return null;

    return {
      id: trade.id,
      buyerId: trade.buyerId,
      sellerId: trade.sellerId,
      offerId: trade.offerId,
      energyAmount: trade.energyAmount,
      pricePerKwh: trade.pricePerKwh,
      totalAmount: trade.totalAmount,
      status: trade.status as TradeStatus,
      blockchainTxHash: trade.blockchainTxHash,
      buyerName: trade.buyer?.name,
      sellerName: trade.seller?.name,
      createdAt: trade.createdAt.toISOString(),
      completedAt: trade.completedAt ? trade.completedAt.toISOString() : null,
    };
  }

  async getAllTrades(userId?: string): Promise<Trade[]> {
    const whereClause: any = {};
    if (userId) {
      whereClause.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    const trades = await prisma.trade.findMany({
      where: whereClause,
      include: {
        buyer: true,
        seller: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return trades.map((trade) => ({
      id: trade.id,
      buyerId: trade.buyerId,
      sellerId: trade.sellerId,
      offerId: trade.offerId,
      energyAmount: trade.energyAmount,
      pricePerKwh: trade.pricePerKwh,
      totalAmount: trade.totalAmount,
      status: trade.status as TradeStatus,
      blockchainTxHash: trade.blockchainTxHash,
      buyerName: trade.buyer?.name,
      sellerName: trade.seller?.name,
      createdAt: trade.createdAt.toISOString(),
      completedAt: trade.completedAt ? trade.completedAt.toISOString() : null,
    }));
  }
}

export const tradeService = new TradeService();
