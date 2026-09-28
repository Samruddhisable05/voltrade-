import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting VoltTrade database seeding...');

  // Clean existing records if any
  await prisma.notification.deleteMany();
  await prisma.blockchainTransactionRecord.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.energyOffer.deleteMany();
  await prisma.telemetry.deleteMany();
  await prisma.deviceCommand.deleteMany();
  await prisma.device.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create User 1: House A (Producer)
  const producer = await prisma.user.create({
    data: {
      id: 'user-house-a',
      name: 'House A (Solar Producer)',
      email: 'house-a@volttrade.local',
      role: 'PRODUCER',
      wallet: {
        create: {
          balance: 350.0,
        },
      },
    },
    include: { wallet: true },
  });
  console.log('✅ Created Producer:', producer.name);

  // 2. Create User 2: House B (Consumer)
  const consumer = await prisma.user.create({
    data: {
      id: 'user-house-b',
      name: 'House B (Green Consumer)',
      email: 'house-b@volttrade.local',
      role: 'CONSUMER',
      wallet: {
        create: {
          balance: 500.0,
        },
      },
    },
    include: { wallet: true },
  });
  console.log('✅ Created Consumer:', consumer.name);

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      id: 'user-admin',
      name: 'Grid Admin Operator',
      email: 'admin@volttrade.local',
      role: 'ADMIN',
      wallet: {
        create: {
          balance: 1000.0,
        },
      },
    },
  });
  console.log('✅ Created Admin:', admin.name);

  // 4. Create ESP32 IoT Smart Meter Device for House A
  const now = new Date();
  const device = await prisma.device.create({
    data: {
      id: 'device-house-a',
      deviceId: 'ESP32-HOUSE-A',
      userId: producer.id,
      name: 'House A Rooftop Solar Smart Meter',
      status: 'ONLINE',
      lastSeen: now,
    },
  });
  console.log('✅ Created Device:', device.deviceId);

  // 5. Seed historical telemetry readings
  const telemetryData = [];
  let cumulativeEnergy = 0.045; // Start with baseline kWh

  for (let i = 25; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15000); // Every 15 seconds
    const angle = (25 - i) * 0.2;
    const voltage = Number((12.35 + 0.35 * Math.sin(angle)).toFixed(2));
    const current = Number((0.88 + 0.22 * Math.cos(angle * 0.8)).toFixed(4));
    const power = Number((voltage * current).toFixed(2));
    cumulativeEnergy += (power * (15 / 3600)) / 1000;

    telemetryData.push({
      deviceId: device.deviceId,
      voltage,
      current,
      power,
      energy: Number(cumulativeEnergy.toFixed(5)),
      timestamp,
    });
  }

  for (const t of telemetryData) {
    await prisma.telemetry.create({ data: t });
  }
  console.log(`✅ Seeded ${telemetryData.length} telemetry readings`);

  // 6. Create Active Energy Offer for House A
  const offer = await prisma.energyOffer.create({
    data: {
      id: 'offer-solar-pack-1',
      userId: producer.id,
      energyAmount: 2.5,
      remainingEnergy: 1.8,
      pricePerKwh: 10.50, // ₹10.50/kWh
      status: 'AVAILABLE',
    },
  });
  console.log('✅ Created Energy Offer: 1.8 kWh available @ ₹10.50/kWh');

  // 7. Seed completed historical trades & blockchain transaction records
  const trade1 = await prisma.trade.create({
    data: {
      id: 'trade-hist-01',
      buyerId: consumer.id,
      sellerId: producer.id,
      offerId: offer.id,
      energyAmount: 0.7,
      pricePerKwh: 10.20,
      totalAmount: 7.14,
      status: 'COMPLETED',
      blockchainTxHash: '0x8F3C7E294B1A0D6E8C2B5F4A392817263544AAEEFF8811223344556677889900',
      createdAt: new Date(now.getTime() - 3600000), // 1 hour ago
      completedAt: new Date(now.getTime() - 3590000),
      blockchainTx: {
        create: {
          txHash: '0x8F3C7E294B1A0D6E8C2B5F4A392817263544AAEEFF8811223344556677889900',
          energyAmount: 0.7,
          amount: 7.14,
          status: 'CONFIRMED',
          blockNumber: 18452101,
          gasUsed: 21540,
          timestamp: new Date(now.getTime() - 3590000),
        },
      },
    },
  });

  // Record wallet ledger transactions for trade 1
  if (consumer.wallet && producer.wallet) {
    await prisma.walletTransaction.create({
      data: {
        walletId: consumer.wallet.id,
        tradeId: trade1.id,
        type: 'DEBIT',
        amount: 7.14,
        description: 'P2P Energy Purchase: 0.70 kWh from House A',
        createdAt: new Date(now.getTime() - 3600000),
      },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: producer.wallet.id,
        tradeId: trade1.id,
        type: 'CREDIT',
        amount: 7.14,
        description: 'P2P Solar Energy Sale to House B',
        createdAt: new Date(now.getTime() - 3595000),
      },
    });
  }

  // 8. Seed initial in-app notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: producer.id,
        title: 'Smart Meter Connected',
        message: 'ESP32-HOUSE-A telemetry stream initialized and broadcasting live.',
        type: 'SUCCESS',
        read: true,
      },
      {
        userId: consumer.id,
        title: 'Green Tariff Alert',
        message: 'Midday solar generation surplus detected! Energy prices discounted to ₹10.50/kWh.',
        type: 'INFO',
        read: false,
      },
    ],
  });

  console.log('🎉 VoltTrade database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
