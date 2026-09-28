'use client';

import React from 'react';
import { Sun, BatteryCharging, Zap, ArrowRightLeft, Sparkles } from 'lucide-react';

interface DashboardKpiGridProps {
  energyGenerated: number;
  energyAvailable: number;
  currentPrice: number;
  energyTraded: number;
}

export default function DashboardKpiGrid({
  energyGenerated,
  energyAvailable,
  currentPrice,
  energyTraded,
}: DashboardKpiGridProps) {
  const kpis = [
    {
      title: 'ENERGY GENERATED',
      value: `${energyGenerated.toFixed(2)} kWh`,
      subtitle: 'Today',
      icon: Sun,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      accentColor: 'border-l-emerald-500',
    },
    {
      title: 'AVAILABLE TO SELL',
      value: `${energyAvailable.toFixed(2)} kWh`,
      subtitle: 'Ready for P2P trading',
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
      title: 'ENERGY TRADED',
      value: `${energyTraded.toFixed(2)} kWh`,
      subtitle: 'P2P trading activity',
      icon: ArrowRightLeft,
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      accentColor: 'border-l-teal-500',
    },
  ];

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
