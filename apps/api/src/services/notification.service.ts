import { prisma } from '@volttrade/database';
import { NotificationItem } from '@volttrade/shared';

export class NotificationService {
  private inMemoryNotifications: NotificationItem[] = [];

  async notify(title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO', userId?: string): Promise<NotificationItem> {
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    };

    this.inMemoryNotifications.unshift(item);
    if (this.inMemoryNotifications.length > 50) {
      this.inMemoryNotifications.pop();
    }

    try {
      const dbNotif = await prisma.notification.create({
        data: {
          title,
          message,
          type,
          userId,
        },
      });
      item.id = dbNotif.id;
    } catch {
      // Fallback to in-memory
    }

    return item;
  }

  async getRecent(userId?: string): Promise<NotificationItem[]> {
    try {
      const records = await prisma.notification.findMany({
        where: userId ? { OR: [{ userId }, { userId: null }] } : {},
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      if (records.length > 0) {
        return records.map((r) => ({
          id: r.id,
          userId: r.userId || undefined,
          title: r.title,
          message: r.message,
          type: r.type as any,
          read: r.read,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch {}

    return this.inMemoryNotifications;
  }

  async markAllRead(userId?: string) {
    this.inMemoryNotifications.forEach((n) => (n.read = true));
    try {
      await prisma.notification.updateMany({
        where: userId ? { userId } : {},
        data: { read: true },
      });
    } catch {}
  }
}

export const notificationService = new NotificationService();
