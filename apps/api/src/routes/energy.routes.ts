import { Router, Request, Response } from 'express';
import { energyService } from '../services/energy.service';
import { environmentalService } from '../services/environmental.service';

const router = Router();

/**
 * GET /api/energy/live
 * Real-time telemetry feed from ESP32 or smart meter
 */
router.get('/live', async (req: Request, res: Response) => {
  try {
    const deviceId = req.query.deviceId as string | undefined;
    const data = await energyService.getLiveTelemetry(deviceId);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/energy/history
 * Historical telemetry readings for charts and analytics
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const deviceId = req.query.deviceId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const history = await energyService.getEnergyHistory(deviceId, limit);
    return res.json({ history });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/energy/offers
 * List active energy offers
 */
router.get('/offers', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const offers = await energyService.getOffers(status);
    return res.json({ offers });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/energy/offers
 * Producer creates a new renewable energy offer
 */
router.post('/offers', async (req: Request, res: Response) => {
  try {
    const { userId, energyAmount, pricePerKwh } = req.body;

    if (!userId || energyAmount === undefined || pricePerKwh === undefined) {
      return res.status(400).json({
        error: 'Missing required offer fields: userId, energyAmount, pricePerKwh',
      });
    }

    if (energyAmount <= 0 || pricePerKwh <= 0) {
      return res.status(400).json({
        error: 'Energy amount and price per kWh must be greater than 0',
      });
    }

    const offer = await energyService.createOffer(userId, Number(energyAmount), Number(pricePerKwh));
    return res.status(201).json({ success: true, offer });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/energy/offers/:id
 * Update an offer (e.g. cancel or modify price/remaining)
 */
router.patch('/offers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remainingEnergy, pricePerKwh } = req.body;

    const updated = await energyService.updateOffer(id, {
      status,
      remainingEnergy: remainingEnergy !== undefined ? Number(remainingEnergy) : undefined,
      pricePerKwh: pricePerKwh !== undefined ? Number(pricePerKwh) : undefined,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Energy offer not found' });
    }

    return res.json({ success: true, offer: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/energy/dashboard
 * Aggregated figures for main dashboard
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const aggregates = await energyService.getDashboardAggregates(userId);
    return res.json(aggregates);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/energy/impact
 * Environmental CO2 avoided calculation
 */
router.get('/impact', async (_req: Request, res: Response) => {
  try {
    const stats = await environmentalService.getTotalImpact();
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
