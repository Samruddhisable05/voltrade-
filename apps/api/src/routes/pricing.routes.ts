import { Router, Request, Response } from 'express';
import { pricingService } from '../services/pricing.service';
import { energyService } from '../services/energy.service';

const router = Router();

/**
 * GET /api/pricing/recommendation
 * Returns dynamic price recommendation based on current renewable market conditions
 */
router.get('/recommendation', async (req: Request, res: Response) => {
  try {
    const basePrice = req.query.basePrice ? parseFloat(req.query.basePrice as string) : undefined;
    const supply = req.query.supply ? parseFloat(req.query.supply as string) : undefined;
    const demand = req.query.demand ? parseFloat(req.query.demand as string) : undefined;

    // Fetch aggregate pool if not explicitly supplied
    let currentSupply = supply;
    let currentDemand = demand;

    if (currentSupply === undefined || currentDemand === undefined) {
      const aggregates = await energyService.getDashboardAggregates();
      if (currentSupply === undefined) currentSupply = aggregates.energyAvailable;
      if (currentDemand === undefined) currentDemand = aggregates.consumerDemandKwh;
    }

    const recommendation = pricingService.calculateRecommendation({
      basePrice,
      supply: currentSupply,
      demand: currentDemand,
    });

    return res.json(recommendation);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
