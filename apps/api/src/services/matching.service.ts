import { prisma } from '@volttrade/database';
import { EnergyOffer, Trade } from '@volttrade/shared';
import { tradeService } from './trade.service';

export interface MatchingCriteria {
  consumerId: string;
  requestedEnergyKwh: number;
  maxPricePerKwh?: number;
  // Future extensibility parameters
  maxDistanceKm?: number;
  minSellerReputation?: number;
  preferredSource?: 'SOLAR' | 'WIND' | 'HYDRO' | 'ANY';
  urgency?: 'LOW' | 'NORMAL' | 'CRITICAL';
}

export interface MatchResult {
  matched: boolean;
  selectedOffer?: EnergyOffer;
  energyToTrade?: number;
  pricePerKwh?: number;
  totalAmount?: number;
  trade?: Trade;
  reason?: string;
}

export class MatchingEngine {
  /**
   * Evaluates available offers and selects optimal producer for consumer request
   * MVP prioritizes:
   * 1. Status AVAILABLE or PARTIALLY_SOLD
   * 2. Lowest price per kWh
   * 3. Sufficient available quantity
   */
  async matchConsumerRequest(criteria: MatchingCriteria): Promise<MatchResult> {
    const { consumerId, requestedEnergyKwh, maxPricePerKwh } = criteria;

    if (requestedEnergyKwh <= 0) {
      return {
        matched: false,
        reason: 'Requested energy quantity must be greater than 0 kWh.',
      };
    }

    // 1. Fetch eligible offers (excluding consumer's own offers)
    const eligibleOffers = await prisma.energyOffer.findMany({
      where: {
        status: { in: ['AVAILABLE', 'PARTIALLY_SOLD'] },
        remainingEnergy: { gt: 0 },
        userId: { not: consumerId }, // Peer cannot buy from self
        ...(maxPricePerKwh ? { pricePerKwh: { lte: maxPricePerKwh } } : {}),
      },
      include: { user: true },
      orderBy: [
        { pricePerKwh: 'asc' }, // Best price first
        { remainingEnergy: 'desc' }, // Higher liquidity first
      ],
    });

    if (eligibleOffers.length === 0) {
      return {
        matched: false,
        reason: 'No available renewable energy offers found matching your criteria.',
      };
    }

    // 2. Select the top ranked offer
    const bestOffer = eligibleOffers[0];
    const tradeKwh = Math.min(requestedEnergyKwh, bestOffer.remainingEnergy);
    const pricePerKwh = bestOffer.pricePerKwh;
    const totalAmount = Number((tradeKwh * pricePerKwh).toFixed(2));

    // 3. Initiate Trade through TradeService
    const trade = await tradeService.executeTrade({
      buyerId: consumerId,
      sellerId: bestOffer.userId,
      offerId: bestOffer.id,
      energyAmount: tradeKwh,
      pricePerKwh,
      totalAmount,
    });

    // 4. Update the energy offer remaining balance
    const newRemaining = Number((bestOffer.remainingEnergy - tradeKwh).toFixed(4));
    const newStatus = newRemaining <= 0.0001 ? 'SOLD' : 'PARTIALLY_SOLD';

    await prisma.energyOffer.update({
      where: { id: bestOffer.id },
      data: {
        remainingEnergy: newRemaining <= 0.0001 ? 0 : newRemaining,
        status: newStatus,
      },
    });

    return {
      matched: true,
      selectedOffer: {
        id: bestOffer.id,
        userId: bestOffer.userId,
        producerName: bestOffer.user.name,
        energyAmount: bestOffer.energyAmount,
        remainingEnergy: newRemaining,
        pricePerKwh: bestOffer.pricePerKwh,
        status: newStatus as any,
        createdAt: bestOffer.createdAt.toISOString(),
      },
      energyToTrade: tradeKwh,
      pricePerKwh,
      totalAmount,
      trade,
    };
  }
}

export const matchingEngine = new MatchingEngine();
