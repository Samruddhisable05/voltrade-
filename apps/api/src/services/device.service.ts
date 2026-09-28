import { prisma } from '@volttrade/database';
import { Device, DeviceCommand, DeviceStatus } from '@volttrade/shared';

// Heartbeat timeout threshold in milliseconds (e.g., 15s)
const HEARTBEAT_TIMEOUT_MS = 15000;

export class DeviceService {
  // In-memory queue for immediate fallback polling if needed
  private pendingCommands: Map<string, DeviceCommand[]> = new Map();

  /**
   * Determine device status based on last seen timestamp
   */
  computeStatus(lastSeen: Date | string): DeviceStatus {
    const lastSeenTime = new Date(lastSeen).getTime();
    const now = Date.now();
    return now - lastSeenTime <= HEARTBEAT_TIMEOUT_MS ? 'ONLINE' : 'OFFLINE';
  }

  async registerOrUpdateDevice(deviceId: string, userId: string, name?: string) {
    return prisma.device.upsert({
      where: { deviceId },
      update: {
        lastSeen: new Date(),
        status: 'ONLINE',
        ...(name ? { name } : {}),
      },
      create: {
        deviceId,
        userId,
        name: name || `Smart Meter (${deviceId})`,
        status: 'ONLINE',
        lastSeen: new Date(),
      },
    });
  }

  async updateHeartbeat(deviceId: string) {
    return prisma.device.update({
      where: { deviceId },
      data: {
        lastSeen: new Date(),
        status: 'ONLINE',
      },
    }).catch(() => null);
  }

  async getDevice(deviceId: string): Promise<Device | null> {
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) return null;

    const dynamicStatus = this.computeStatus(device.lastSeen);
    if (device.status !== dynamicStatus) {
      await prisma.device.update({
        where: { id: device.id },
        data: { status: dynamicStatus },
      }).catch(() => {});
    }

    return {
      id: device.id,
      deviceId: device.deviceId,
      userId: device.userId,
      name: device.name,
      status: dynamicStatus,
      lastSeen: device.lastSeen.toISOString(),
      createdAt: device.createdAt.toISOString(),
    };
  }

  async getAllDevices(): Promise<Device[]> {
    const devices = await prisma.device.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return devices.map((d) => {
      const status = this.computeStatus(d.lastSeen);
      return {
        id: d.id,
        deviceId: d.deviceId,
        userId: d.userId,
        name: d.name,
        status,
        lastSeen: d.lastSeen.toISOString(),
        createdAt: d.createdAt.toISOString(),
      };
    });
  }

  /**
   * Dispatches a command to the ESP32 (e.g. ACTIVATE_LOAD)
   */
  async createCommand(deviceId: string, command: 'ACTIVATE_LOAD' | 'DEACTIVATE_LOAD' | 'STATUS_PING', durationMs: number = 5000): Promise<DeviceCommand> {
    // Ensure device exists or create default
    let device = await prisma.device.findUnique({ where: { deviceId } });
    if (!device) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        device = await prisma.device.create({
          data: {
            deviceId,
            userId: defaultUser.id,
            name: `ESP32 Smart Meter (${deviceId})`,
            status: 'ONLINE',
          },
        });
      }
    }

    const dbRecord = await prisma.deviceCommand.create({
      data: {
        deviceId,
        command,
        duration: durationMs,
        status: 'PENDING',
      },
    });

    const commandObj: DeviceCommand = {
      id: dbRecord.id,
      deviceId: dbRecord.deviceId,
      command: dbRecord.command as any,
      duration: dbRecord.duration || 5000,
      status: 'PENDING',
      createdAt: dbRecord.createdAt.toISOString(),
    };

    const existing = this.pendingCommands.get(deviceId) || [];
    existing.push(commandObj);
    this.pendingCommands.set(deviceId, existing);

    return commandObj;
  }

  /**
   * Fetches pending commands for an ESP32 polling GET /api/devices/:deviceId/commands/pending
   */
  async getNextPendingCommand(deviceId: string): Promise<DeviceCommand | null> {
    // Check in-memory first for fast latency
    const queue = this.pendingCommands.get(deviceId) || [];
    if (queue.length > 0) {
      const cmd = queue.shift()!;
      this.pendingCommands.set(deviceId, queue);
      return cmd;
    }

    // Check database
    const pendingDb = await prisma.deviceCommand.findFirst({
      where: {
        deviceId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!pendingDb) return null;

    return {
      id: pendingDb.id,
      deviceId: pendingDb.deviceId,
      command: pendingDb.command as any,
      duration: pendingDb.duration || 5000,
      status: 'PENDING',
      createdAt: pendingDb.createdAt.toISOString(),
    };
  }

  async acknowledgeCommand(commandId: string, status: 'EXECUTED' | 'FAILED' = 'EXECUTED') {
    return prisma.deviceCommand.update({
      where: { id: commandId },
      data: {
        status,
        executedAt: new Date(),
      },
    }).catch(() => null);
  }
}

export const deviceService = new DeviceService();
