export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR';

export interface Device {
  id: string;
  deviceId: string;
  userId: string;
  name: string;
  status: DeviceStatus;
  lastSeen: string;
  createdAt: string;
}

export interface TelemetryData {
  id?: string;
  deviceId: string;
  voltage: number;   // Volts
  current: number;   // Amperes (or converted to A)
  power: number;     // Watts (V * A)
  energy: number;    // Cumulative kWh
  timestamp: string;
}

export type OfferStatus = 'AVAILABLE' | 'PARTIALLY_SOLD' | 'SOLD' | 'CANCELLED';

export interface EnergyOffer {
  id: string;
  userId: string;
  producerName?: string;
  energyAmount: number;     // Total kWh
  remainingEnergy: number;  // Available kWh left
  pricePerKwh: number;      // ₹ / kWh
  status: OfferStatus;
  createdAt: string;
  updatedAt?: string;
}

export type TradeStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'PAYMENT_CONFIRMED'
  | 'BLOCKCHAIN_CONFIRMED'
  | 'ENERGY_DELIVERED'
  | 'COMPLETED'
  | 'FAILED';

export interface Trade {
  id: string;
  buyerId: string;
  sellerId: string;
  offerId?: string | null;
  energyAmount: number;     // kWh
  pricePerKwh: number;      // ₹ / kWh
  totalAmount: number;      // ₹
  status: TradeStatus;
  blockchainTxHash?: string | null;
  buyerName?: string;
  sellerName?: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;          // ₹
  currency?: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  tradeId?: string | null;
  type: 'CREDIT' | 'DEBIT' | 'TOPUP';
  amount: number;
  description: string;
  createdAt: string;
}

export interface BlockchainTransaction {
  txHash: string;
  tradeId: string;
  buyerId?: string;
  sellerId?: string;
  energyAmount: number;
  amount: number;
  timestamp: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  blockNumber: number;
}

export type MarketLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PricingRecommendation {
  recommendedPrice: number;
  supplyLevel: MarketLevel;
  demandLevel: MarketLevel;
  priceChange: number;
  reason: string;
  basePrice: number;
  calculatedAt: string;
}

export interface DeviceCommand {
  id: string;
  deviceId: string;
  command: 'ACTIVATE_LOAD' | 'DEACTIVATE_LOAD' | 'STATUS_PING';
  duration?: number; // Duration in ms for relay activation
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  createdAt: string;
  executedAt?: string | null;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  createdAt: string;
  read: boolean;
}

export interface EnvironmentalStats {
  renewableEnergyTradedKwh: number;
  co2AvoidedKg: number;
  emissionsFactorKgPerKwh: number; // e.g. 0.82 kg CO2 / kWh
  treesEquivalent: number;
}
