import { Router, Request, Response } from 'express';
import { walletService } from '../services/wallet.service';
import { prisma } from '@volttrade/database';

const router = Router();

/**
 * GET /api/wallet
 * Returns virtual wallet balance and ledger history for current user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    let userId = req.query.userId as string | undefined;

    // Default to first consumer or producer if not provided
    if (!userId) {
      const user = await prisma.user.findFirst({
        where: { role: 'CONSUMER' },
      });
      userId = user ? user.id : 'demo-user-house-b';
    }

    const wallet = await walletService.getWallet(userId);
    const transactions = await walletService.getTransactions(userId);

    return res.json({ wallet, transactions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/wallet/topup
 * Reload virtual balance for hackathon demo
 */
router.post('/topup', async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid userId and positive amount are required' });
    }

    const updated = await walletService.topUp(userId, Number(amount));
    return res.json({ success: true, wallet: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
