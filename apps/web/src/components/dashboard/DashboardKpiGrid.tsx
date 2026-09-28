'use client';

import React from 'react';
import { Sun, BatteryCharging, Zap, ArrowRightLeft, Sparkles, Activity, IndianRupee, Leaf } from 'lucide-react';

interface DashboardKpiGridProps {
  role?: string;
  energyGenerated: number;
  energyAvailable: number;
  currentPrice: number;
  energyTraded: number;
  energyPurchased?: number;
  consumerDemandKwh?: number;
  totalSpent?: number;
}

export default function DashboardKpiGrid({
  role = 'PRODUCER',
  energyGenerated,
  energyAvailable,
  currentPrice,
  energyTraded,
  energyPurchased = 1.20,
  consumerDemandKwh = 4.20,
  totalSpent = 12.48,
}: DashboardKpiGridProps) {
  const isConsumer = role === 'CONSUMER';

  const producerKpis = [
    {
      title: 'ENERGY GENERATED',
      value: `${energyGenerated.toFixed(2)} kWh`,
      subtitle: 'Solar generation today',
      icon: Sun,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      accentColor: 'border-l-emerald-500',
    },
    {
      title: 'AVAILABLE TO SELL',
      value: `${energyAvailable.toFixed(2)} kWh`,
      subtitle: 'Surplus ready for P2P trading',
      icon: BatteryCharging,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      accentColor: 'border-l-cyan-500',
    },
    {
      title: 'CURRENT ENERGY PRICE',
      value: `₹${currentPrice.toFixed(2)}`,
      unit: '/ kWh',
      subtitle: 'AI Dynamic Price',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      accentColor: 'border-l-purple-500',
    },
    {
      title: 'ENERGY SOLD / TRADED',
      value: `${energyTraded.toFixed(2)} kWh`,
      subtitle: 'P2P export activity',
      icon: ArrowRightLeft,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      accentColor: 'border-l-teal-500',
    },
  ];

  const consumerKpis = [
    {
      title: 'CLEAN ENERGY PURCHASED',
      value: `${energyPurchased.toFixed(2)} kWh`,
      subtitle: 'Solar electricity bought from House A',
      icon: BatteryCharging,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      accentColor: 'border-l-emerald-500',
    },
    {
      title: 'HOUSEHOLD GRID DEMAND',
      value: `${consumerDemandKwh.toFixed(2)} kWh`,
      subtitle: 'Consumer home appliance load',
      icon: Activity,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      accentColor: 'border-l-cyan-500',
    },
    {
      title: 'CURRENT BUYING TARIFF',
      value: `₹${currentPrice.toFixed(2)}`,
      unit: '/ kWh',
      subtitle: 'AI Dynamic P2P Rate',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      accentColor: 'border-l-purple-500',
    },
    {
      title: 'TOTAL PURCHASE SETTLEMENT',
      value: `₹${totalSpent.toFixed(2)}`,
      subtitle: 'Virtual escrow debited for power',
      icon: IndianRupee,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      accentColor: 'border-l-teal-500',
    },
  ];

  const kpis = isConsumer ? consumerKpis : producerKpis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.title}
            className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl border-l-4 ${kpi.accentColor} flex flex-col justify-between transition hover:border-slate-700/80 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-xl border ${kpi.iconBg} ${kpi.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    {kpi.unit}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {kpi.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
