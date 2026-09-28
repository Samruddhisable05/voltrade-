'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../lib/context';
import { 
  getEnergyHistory, 
  getDashboardAggregates, 
  getTrades, 
  getPricingRecommendation 
} from '../../lib/api';

// Dashboard-specific isolated components
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardHero from '../../components/dashboard/DashboardHero';
import DashboardKpiGrid from '../../components/dashboard/DashboardKpiGrid';
import EnergyFlow from '../../components/dashboard/EnergyFlow';
import EnergyProductionChart from '../../components/dashboard/EnergyProductionChart';
import AIPriceEngine from '../../components/dashboard/AIPriceEngine';
import HardwareHealth from '../../components/dashboard/HardwareHealth';
import RecentTrades from '../../components/dashboard/RecentTrades';
import TradingSummary from '../../components/dashboard/TradingSummary';
import SmartMeter from '../../components/dashboard/SmartMeter';
import CreateOfferModal from '../../components/CreateOfferModal';

export default function DashboardPage() {
  const { currentUser, hardwareStatus } = useApp();

  const [aggregates, setAggregates] = useState<any>({
    energyGenerated: 5.70,
    energyAvailable: 2.30,
    energySold: 12.40,
    energyPurchased: 0.50,
    consumerDemandKwh: 4.20,
    producerStatus: 'ACTIVE_EXPORT',
  });

  const [pricingRec, setPricingRec] = useState<any>({
    basePrice: 10.0,
    recommendedPrice: 8.42,
    supplyLevel: 'HIGH',
    demandLevel: 'MEDIUM',
    priceChange: -1.58,
    reason: 'High solar generation + moderate local demand drives discounted green tariffs.',
    calculatedAt: new Date().toISOString(),
  });

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [agg, hist, trd, pricing] = await Promise.all([
        getDashboardAggregates(currentUser.id).catch(() => null),
        getEnergyHistory('ESP32-HOUSE-A', 30).catch(() => ({ history: [] })),
        getTrades().catch(() => ({ trades: [] })),
        getPricingRecommendation().catch(() => null),
      ]);

      if (agg) {
        setAggregates((prev: any) => ({
          ...prev,
          ...agg,
          // Guarantee realistic VoltTrade presentation numbers if demo initial
          energyGenerated: agg.energyGenerated || 5.70,
          energyAvailable: agg.energyAvailable || 2.30,
          energySold: agg.energySold || 12.40,
        }));
      }

      if (pricing) {
        setPricingRec(pricing);
      }

      if (hist?.history && hist.history.length > 0) {
        setHistoryData(
          hist.history.map((h: any) => ({
            time: new Date(h.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            power: h.power,
            voltage: h.voltage,
            current: h.current,
            energy: h.energy,
          }))
        );
      }

      if (trd?.trades) {
        setRecentTrades(trd.trades.slice(0, 5));
      }
    } catch (err) {
      console.error('[Dashboard] Data fetch error:', err);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleRefreshPricing = async () => {
    setLoadingPricing(true);
    try {
      const data = await getPricingRecommendation();
      if (data) setPricingRec(data);
    } catch {}
    setLoadingPricing(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* 1. COMPACT DASHBOARD TOP HEADER WITH HAMBURGER DRAWER */}
      <DashboardHeader />

      {/* 2. DASHBOARD HERO SECTION */}
      <DashboardHero
        onOpenOfferModal={() => setIsOfferModalOpen(true)}
      />

      {/* 3. PRIMARY 4-CARD ENERGY KPI GRID */}
      <DashboardKpiGrid
        energyGenerated={aggregates.energyGenerated}
        energyAvailable={aggregates.energyAvailable}
        currentPrice={pricingRec.recommendedPrice}
        energyTraded={aggregates.energySold}
      />

      {/* 4. REAL-TIME ENERGY FLOW PIPELINE */}
      <EnergyFlow />

      {/* 5 & 6. PRODUCTION CHART & AI PRICE ENGINE (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <EnergyProductionChart historyData={historyData} />
        </div>
        <div className="flex flex-col">
          <AIPriceEngine
            recommendation={pricingRec}
            onRefresh={handleRefreshPricing}
            loading={loadingPricing}
          />
        </div>
      </div>

      {/* 7, 8 & 9. HARDWARE HEALTH & RECENT TRADES + TRADING SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="flex flex-col">
          <HardwareHealth />
        </div>
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <RecentTrades trades={recentTrades} />
          <TradingSummary
            trades={recentTrades}
            aggregates={aggregates}
            currentPrice={pricingRec.recommendedPrice}
          />
        </div>
      </div>

      {/* 10. SECONDARY HARDWARE SENSOR DETAILS (SMART METER) */}
      <SmartMeter />

      {/* MODAL: CREATE ENERGY OFFER */}
      <CreateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

    </div>
  );
}
