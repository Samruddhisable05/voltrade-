import { Router, Request, Response } from 'express';
import { tradeService } from '../services/trade.service';
import { matchingEngine } from '../services/matching.service';
import { energyService } from '../services/energy.service';
import { pricingService } from '../services/pricing.service';
import { blockchainService } from '../services/blockchain.service';

const router = Router();

/**
 * GET /api/marketplace
 * Retrieve available offers augmented with AI pricing engine insights
 */
router.get('/marketplace', async (_req: Request, res: Response) => {
  try {
    const offers = await energyService.getOffers('AVAILABLE');
    const pricing = pricingService.calculateRecommendation();

    return res.json({
      offers,
      pricingRecommendation: pricing,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/trades
 * Consumer submits an energy buy request -> matching engine creates trade
 */
router.post('/trades', async (req: Request, res: Response) => {
  try {
    const { buyerId, offerId, energyAmount, requestedEnergyKwh, maxPricePerKwh } = req.body;

    if (!buyerId) {
      return res.status(400).json({ error: 'buyerId is required' });
    }

    const energyQuantity = Number(energyAmount || requestedEnergyKwh);
    if (!energyQuantity || energyQuantity <= 0) {
      return res.status(400).json({ error: 'Valid energy amount is required' });
    }

    // If specific offerId provided, verify and execute directly
    if (offerId) {
      const offers = await energyService.getOffers();
      const targetOffer = offers.find((o) => o.id === offerId);

      if (!targetOffer) {
        return res.status(404).json({ error: 'Energy offer not found or no longer available' });
      }

      if (targetOffer.userId === buyerId) {
        return res.status(400).json({ error: 'Producers cannot purchase their own energy offer' });
      }

      const tradeAmountKwh = Math.min(energyQuantity, targetOffer.remainingEnergy);
      const totalAmount = Number((tradeAmountKwh * targetOffer.pricePerKwh).toFixed(2));

      const trade = await tradeService.executeTrade({
        buyerId,
        sellerId: targetOffer.userId,
        offerId: targetOffer.id,
        energyAmount: tradeAmountKwh,
        pricePerKwh: targetOffer.pricePerKwh,
        totalAmount,
      });

      // Update offer remaining balance
      const newRemaining = Number((targetOffer.remainingEnergy - tradeAmountKwh).toFixed(4));
      await energyService.updateOffer(targetOffer.id, {
        remainingEnergy: Math.max(0, newRemaining),
        status: newRemaining <= 0.0001 ? 'SOLD' : 'PARTIALLY_SOLD',
      });

      return res.status(201).json({
        success: true,
        trade,
        message: 'Energy purchased and trade completed successfully',
      });
    }

    // Otherwise, utilize Matching Engine to select best producer automatically
    const matchResult = await matchingEngine.matchConsumerRequest({
      consumerId: buyerId,
      requestedEnergyKwh: energyQuantity,
      maxPricePerKwh: maxPricePerKwh ? Number(maxPricePerKwh) : undefined,
    });

    if (!matchResult.matched) {
      return res.status(400).json({
        success: false,
        error: matchResult.reason || 'Could not match energy request',
      });
    }

    return res.status(201).json({
      success: true,
      trade: matchResult.trade,
      matchedOffer: matchResult.selectedOffer,
      message: 'Matched with producer and trade executed successfully',
    });
  } catch (error: any) {
    console.error('[TradeRoutes] Error executing trade:', error);
    return res.status(500).json({ error: error.message || 'Trade execution failed' });
  }
});

/**
 * GET /api/trades
 * List all trades or filter by user
 */
router.get('/trades', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const trades = await tradeService.getAllTrades(userId);
    return res.json({ trades });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/trades/:id
 * Detailed trade inspection with blockchain transaction proof
 */
router.get('/trades/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const trade = await tradeService.getTradeById(id);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    let blockchainTx = null;
    if (trade.blockchainTxHash) {
      blockchainTx = await blockchainService.getTransaction(trade.blockchainTxHash);
    }

    return res.json({ trade, blockchainTx });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transactions
 * Section 16 Transaction History table
 */
router.get('/transactions', async (_req: Request, res: Response) => {
  try {
    const trades = await tradeService.getAllTrades();
    const blockchainTxs = await blockchainService.getAllTransactions();

    // Map trades to transaction history format
    const transactions = trades.map((t) => {
      const btc = blockchainTxs.find((b) => b.tradeId === t.id);
      return {
        id: t.id,
        tradeId: t.id,
        producer: t.sellerName || 'House A (Producer)',
        consumer: t.buyerName || 'House B (Consumer)',
        energy: t.energyAmount,
        price: t.pricePerKwh,
        amount: t.totalAmount,
        timestamp: t.createdAt,
        status: t.status,
        txHash: t.blockchainTxHash || btc?.txHash || 'Pending confirmation',
        blockNumber: btc?.blockNumber || 18452100,
      };
    });

    return res.json({ transactions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
