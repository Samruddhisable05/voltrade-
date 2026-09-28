import { MarketLevel, PricingRecommendation } from '@volttrade/shared';

export interface PricingInput {
  basePrice?: number;         // Base tariff in ₹/kWh (default ₹10.00)
  supply?: number;            // Total solar/renewable available kWh
  demand?: number;            // Total requested consumer demand kWh
  availableEnergy?: number;   // Specific surplus pool
  timeOfDay?: number;         // Hour of day 0-23
}

export class PricingService {
  private defaultBasePrice = 10.0;

  /**
   * Deterministic dynamic pricing engine
   * Transparent formula based on local solar supply-to-demand ratio and solar peak hours
   */
  calculateRecommendation(input: PricingInput = {}): PricingRecommendation {
    const basePrice = input.basePrice ?? this.defaultBasePrice;
    const supply = input.supply ?? (input.availableEnergy ?? 15.0);
    const demand = input.demand ?? 10.0;
    const hour = input.timeOfDay ?? new Date().getHours();

    // 1. Supply & Demand Classification
    let supplyLevel: MarketLevel = 'MEDIUM';
    let demandLevel: MarketLevel = 'MEDIUM';

    if (supply > 18.0) {
      supplyLevel = 'HIGH';
    } else if (supply < 6.0) {
      supplyLevel = 'LOW';
    }

    if (demand > 14.0) {
      demandLevel = 'HIGH';
    } else if (demand < 6.0) {
      demandLevel = 'LOW';
    }

    // 2. Supply-to-Demand Ratio (SDR)
    const safeDemand = demand <= 0 ? 0.1 : demand;
    const sdr = supply / safeDemand;

    // 3. Time of day solar modifier
    // Hours 10:00 - 15:00: Peak solar irradiance (supply surplus factor)
    // Hours 18:00 - 22:00: Peak domestic demand (grid conservation factor)
    let timeModifier = 1.0;
    let timeNote = '';

    if (hour >= 10 && hour <= 15) {
      timeModifier = 0.95; // 5% discount during peak solar window
      timeNote = 'Midday peak solar generation window. ';
    } else if (hour >= 18 && hour <= 22) {
      timeModifier = 1.10; // 10% premium during evening peak demand
      timeNote = 'Evening peak grid consumption window. ';
    }

    // 4. Elasticity Calculation
    let priceMultiplier = 1.0;
    let reason = '';

    if (sdr >= 1.6) {
      priceMultiplier = 0.85; // 15% discount
      reason = `${timeNote}High local renewable generation with surplus capacity drives green price discounts.`;
    } else if (sdr >= 1.2) {
      priceMultiplier = 0.92; // 8% discount
      reason = `${timeNote}Healthy solar surplus available across microgrid producers.`;
    } else if (sdr <= 0.6) {
      priceMultiplier = 1.22; // 22% peak tariff
      reason = `${timeNote}High consumer demand exceeds local renewable generation; incentivizes feed-in.`;
    } else if (sdr <= 0.9) {
      priceMultiplier = 1.12; // 12% peak tariff
      reason = `${timeNote}Elevated consumer demand absorbs current solar generation.`;
    } else {
      priceMultiplier = 1.02;
      reason = `${timeNote}Balanced peer-to-peer equilibrium; fair value for both solar producers and consumers.`;
    }

    const calculatedPrice = Number((basePrice * priceMultiplier * timeModifier).toFixed(2));
    const priceChange = Number((calculatedPrice - basePrice).toFixed(2));

    return {
      basePrice,
      recommendedPrice: calculatedPrice,
      supplyLevel,
      demandLevel,
      priceChange,
      reason,
      calculatedAt: new Date().toISOString(),
    };
  }
}

export const pricingService = new PricingService();
