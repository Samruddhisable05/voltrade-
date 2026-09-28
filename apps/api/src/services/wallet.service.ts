import { prisma } from '@volttrade/database';
import { Wallet, WalletTransaction } from '@volttrade/shared';

export class WalletService {
  /**
   * Retrieves or initializes a virtual demo wallet for a user
   */
  async getWallet(userId: string): Promise<Wallet> {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 250.0, // Default demo seed balance ₹250
        },
      });
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: Number(wallet.balance.toFixed(2)),
      currency: 'INR',
    };
  }

  /**
   * Deducts funds from buyer's virtual wallet
   */
  async debit(userId: string, amount: number, tradeId?: string, description?: string): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < amount) {
      return {
        success: false,
        error: `Insufficient wallet balance (₹${wallet.balance.toFixed(2)} available, ₹${amount.toFixed(2)} required)`,
      };
    }

    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        transactions: {
          create: {
            type: 'DEBIT',
            amount,
            tradeId,
            description: description || `P2P Energy Purchase (-₹${amount.toFixed(2)})`,
          },
        },
      },
    });

    return {
      success: true,
      newBalance: Number(updated.balance.toFixed(2)),
    };
  }

  /**
   * Credits funds to seller's virtual wallet
   */
  async credit(userId: string, amount: number, tradeId?: string, description?: string): Promise<{ success: boolean; newBalance?: number }> {
    const wallet = await this.getWallet(userId);

    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
        transactions: {
          create: {
            type: 'CREDIT',
            amount,
            tradeId,
            description: description || `P2P Energy Sale Payout (+₹${amount.toFixed(2)})`,
          },
        },
      },
    });

    return {
      success: true,
      newBalance: Number(updated.balance.toFixed(2)),
    };
  }

  /**
   * Top up wallet for hackathon demo testing
   */
  async topUp(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWallet(userId);

    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
        transactions: {
          create: {
            type: 'TOPUP',
            amount,
            description: `Demo Wallet Reload (+₹${amount.toFixed(2)})`,
          },
        },
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      balance: Number(updated.balance.toFixed(2)),
      currency: 'INR',
    };
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const wallet = await this.getWallet(userId);

    const txs = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return txs.map((t) => ({
      id: t.id,
      walletId: t.walletId,
      tradeId: t.tradeId,
      type: t.type as any,
      amount: Number(t.amount.toFixed(2)),
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    }));
  }
}

export const walletService = new WalletService();
