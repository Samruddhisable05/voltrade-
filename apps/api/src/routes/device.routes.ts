import { Router, Request, Response } from 'express';
import { deviceService } from '../services/device.service';
import { energyService } from '../services/energy.service';

const router = Router();

/**
 * POST /api/devices/telemetry
 * Telemetry endpoint called by ESP32 IoT node or demo simulator
 */
router.post('/telemetry', async (req: Request, res: Response) => {
  try {
    const { deviceId, voltage, current, power, energy, timestamp } = req.body;

    if (!deviceId || voltage === undefined || current === undefined) {
      return res.status(400).json({
        error: 'Missing required telemetry fields: deviceId, voltage, current',
      });
    }

    const recorded = await energyService.recordTelemetry({
      deviceId,
      voltage: Number(voltage),
      current: Number(current),
      power: power !== undefined ? Number(power) : undefined,
      energy: energy !== undefined ? Number(energy) : undefined,
      timestamp,
    });

    return res.status(201).json({
      success: true,
      telemetry: recorded,
    });
  } catch (error: any) {
    console.error('[DeviceRoutes] Error recording telemetry:', error);
    return res.status(500).json({ error: error.message || 'Failed to record telemetry' });
  }
});

/**
 * GET /api/devices
 * List all registered smart meter devices and status
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const devices = await deviceService.getAllDevices();
    return res.json({ devices });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/devices/:id
 * Retrieve details of a specific device
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const device = await deviceService.getDevice(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    return res.json({ device });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/devices/:id/command
 * Dispatch a hardware command to ESP32 (e.g. ACTIVATE_LOAD)
 */
router.post('/:id/command', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { command, duration } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command string is required (e.g. ACTIVATE_LOAD)' });
    }

    const dispatched = await deviceService.createCommand(id, command, duration || 5000);
    return res.status(200).json({
      success: true,
      command: dispatched,
      message: `Command ${command} sent to device ${id}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/devices/:deviceId/commands/pending
 * Polled by ESP32 node to fetch next queued command
 */
router.get('/:deviceId/commands/pending', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const pendingCmd = await deviceService.getNextPendingCommand(deviceId);
    if (!pendingCmd) {
      return res.status(204).send(); // No content
    }
    return res.json(pendingCmd);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/devices/:deviceId/commands/:cmdId/ack
 * Called by ESP32 to acknowledge command execution
 */
router.post('/:deviceId/commands/:cmdId/ack', async (req: Request, res: Response) => {
  try {
    const { cmdId } = req.params;
    const { status } = req.body;
    await deviceService.acknowledgeCommand(cmdId, status || 'EXECUTED');
    return res.json({ success: true, acknowledgedId: cmdId });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
