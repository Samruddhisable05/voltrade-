import { EnvironmentalStats } from '@volttrade/shared';
import { prisma } from '@volttrade/database';

export class EnvironmentalService {
  // Average grid carbon intensity in India / global average: ~0.82 kg CO2 per kWh
  private emissionsFactorKgPerKwh = 0.82;
  // Approximately 1 mature tree absorbs ~21.77 kg CO2 per year
  private treeAbsorptionFactor = 21.77;

  setEmissionsFactor(factor: number) {
    if (factor > 0) {
      this.emissionsFactorKgPerKwh = factor;
    }
  }

  getEmissionsFactor(): number {
    return this.emissionsFactorKgPerKwh;
  }

  calculateImpact(renewableKwhTraded: number): EnvironmentalStats {
    const co2AvoidedKg = Number((renewableKwhTraded * this.emissionsFactorKgPerKwh).toFixed(3));
    const treesEquivalent = Number((co2AvoidedKg / (this.treeAbsorptionFactor / 12)).toFixed(2)); // Tree-months

    return {
      renewableEnergyTradedKwh: Number(renewableKwhTraded.toFixed(3)),
      co2AvoidedKg,
      emissionsFactorKgPerKwh: this.emissionsFactorKgPerKwh,
      treesEquivalent,
    };
  }

  async getTotalImpact(): Promise<EnvironmentalStats> {
    try {
      // Sum all completed or confirmed trades
      const trades = await prisma.trade.findMany({
        where: {
          status: {
            in: ['COMPLETED', 'ENERGY_DELIVERED', 'BLOCKCHAIN_CONFIRMED', 'PAYMENT_CONFIRMED'],
          },
        },
      });

      const totalKwh = trades.reduce((sum, t) => sum + t.energyAmount, 0);
      return this.calculateImpact(totalKwh);
    } catch {
      return this.calculateImpact(0);
    }
  }
}

export const environmentalService = new EnvironmentalService();
