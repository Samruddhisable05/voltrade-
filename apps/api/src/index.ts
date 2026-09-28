import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import deviceRoutes from './routes/device.routes';
import energyRoutes from './routes/energy.routes';
import tradeRoutes from './routes/trade.routes';
import pricingRoutes from './routes/pricing.routes';
import walletRoutes from './routes/wallet.routes';
import adminRoutes from './routes/admin.routes';
import { energyService } from './services/energy.service';
import { deviceService } from './services/device.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logger for IoT and API tracking
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/devices/telemetry')) {
    // Keep telemetry logs compact
  } else {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Root & Health Check
app.get('/', (_req, expressRes) => {
  expressRes.json({
    name: 'VoltTrade API Server',
    version: '1.0.0',
    status: 'ACTIVE',
    hardwareTarget: 'ESP32 + INA219 + SSD1306 + Relay',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, expressRes) => {
  expressRes.json({ status: 'ok', uptime: process.uptime() });
});

// Route registration
app.use('/api/devices', deviceRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', tradeRoutes); // Exposes /api/marketplace, /api/trades, /api/transactions

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Server Error]:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Optional Demo Mode Background Simulator
// If enabled, generates natural solar curve readings if no physical ESP32 is sending data
let demoSimulationInterval: NodeJS.Timeout | null = null;
let simAngle = 0;

export function startDemoSimulator(enabled: boolean = false) {
  if (demoSimulationInterval) {
    clearInterval(demoSimulationInterval);
    demoSimulationInterval = null;
  }

  if (!enabled) return;

  console.log('[DemoMode] Hardware simulator active (yielding automatically to real ESP32 telemetry)');
  demoSimulationInterval = setInterval(async () => {
    try {
      const live = await energyService.getLiveTelemetry('ESP32-HOUSE-A');
      // If real hardware hasn't sent telemetry in over 15 seconds, simulate smooth solar fluctuation
      if (live.lastSeenSecondsAgo > 15) {
        simAngle += 0.1;
        const v = 12.3 + 0.3 * Math.sin(simAngle);
        const i = 0.85 + 0.2 * Math.cos(simAngle * 0.7);
        await energyService.recordTelemetry({
          deviceId: 'ESP32-HOUSE-A',
          voltage: v,
          current: i,
          power: Number((v * i).toFixed(2)),
        });
      }
    } catch {}
  }, 3000);
}

// Start server
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`  ⚡ VOLTTRADE API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`  ESP32 Telemetry Target: http://localhost:${PORT}/api/devices/telemetry`);
  console.log(`=================================================\n`);

  // Start background demo simulator if DEMO_MODE is true or default active for hackathon resilience
  const demoMode = process.env.DEMO_MODE !== 'false';
  startDemoSimulator(demoMode);
});

export default app;
