import { Router, Request, Response } from 'express';
import { prisma } from '@volttrade/database';
import { energyService } from '../services/energy.service';
import { notificationService } from '../services/notification.service';
import { deviceService } from '../services/device.service';

const router = Router();

/**
 * GET /api/users
 * Returns list of demo users for easy switcher UI
 */
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        wallet: true,
        devices: true,
      },
    });
    return res.json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/simulate-telemetry
 * Generates an instantaneous or continuous simulated pulse from ESP32-HOUSE-A
 */
router.post('/simulate-telemetry', async (req: Request, res: Response) => {
  try {
    const { deviceId = 'ESP32-HOUSE-A', voltage = 12.4, current = 0.85 } = req.body;
    const power = Number((voltage * current).toFixed(2));

    const telemetry = await energyService.recordTelemetry({
      deviceId,
      voltage: Number(voltage),
      current: Number(current),
      power,
    });

    return res.json({ success: true, telemetry });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications
 */
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const items = await notificationService.getRecent(userId);
    return res.json({ notifications: items });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/read
 */
router.post('/notifications/read', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId as string | undefined;
    await notificationService.markAllRead(userId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
