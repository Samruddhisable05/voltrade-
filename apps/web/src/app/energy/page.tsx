'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getEnvironmentalImpact, getEnergyHistory, getDashboardAggregates } from '../../lib/api';
import { 
  TrendingUp, 
  Leaf, 
  Sun, 
  Zap, 
  Activity, 
  BarChart3, 
  TreePine, 
  Info,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function EnergyAnalyticsPage() {
  const { currentUser } = useApp();
  const [impact, setImpact] = useState<any>({
    renewableEnergyTradedKwh: 1.20,
    co2AvoidedKg: 0.984,
    emissionsFactorKgPerKwh: 0.82,
    treesEquivalent: 0.54,
  });
  const [aggregates, setAggregates] = useState<any>({
    energyGenerated: 3.85,
    energyAvailable: 1.80,
    energySold: 2.05,
    energyPurchased: 0.50,
    consumerDemandKwh: 4.20,
  });
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [imp, agg, hist] = await Promise.all([
        getEnvironmentalImpact().catch(() => null),
        getDashboardAggregates(currentUser.id).catch(() => null),
        getEnergyHistory('ESP32-HOUSE-A', 30).catch(() => ({ history: [] })),
      ]);

      if (imp) setImpact(imp);
      if (agg) setAggregates(agg);
      if (hist?.history) {
        setHistoryData(
          hist.history.map((h: any) => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            voltage: h.voltage,
            current: h.current,
            power: h.power,
            energy: h.energy,
          }))
        );
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const balanceData = [
    { name: 'Generated', kwh: aggregates.energyGenerated, fill: '#10b981' },
    { name: 'Available', kwh: aggregates.energyAvailable, fill: '#34d399' },
    { name: 'Sold', kwh: aggregates.energySold, fill: '#06b6d4' },
    { name: 'Purchased', kwh: aggregates.energyPurchased, fill: '#6366f1' },
    { name: 'Demand', kwh: aggregates.consumerDemandKwh, fill: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            MICROGRID INTELLIGENCE
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Energy Analytics & Environmental Impact
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generation metrics, local microgrid consumption balances, and quantified carbon emissions offset.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Refresh analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* SECTION 21: ENVIRONMENTAL IMPACT METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Renewable Traded */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Renewable Energy Traded</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">{impact.renewableEnergyTradedKwh.toFixed(3)}</span>
            <span className="text-sm font-bold text-emerald-400">kWh</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Solar power peer-settled</p>
        </div>

        {/* CO2 Avoided */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/30 to-slate-900 border border-teal-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Estimated CO₂ Avoided</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-teal-300 font-mono">{impact.co2AvoidedKg.toFixed(3)}</span>
            <span className="text-sm font-bold text-teal-400">kg CO₂</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-400/80">
            <Info className="w-3 h-3" />
            <span>Estimated via {impact.emissionsFactorKgPerKwh} kg/kWh baseline</span>
          </div>
        </div>

        {/* Trees Equivalent */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Equivalent Tree-Months</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-400 font-mono">{impact.treesEquivalent.toFixed(2)}</span>
            <span className="text-sm font-bold text-emerald-400">Tree-mo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Carbon absorption offset equivalent</p>
        </div>

      </div>

      {/* SECTION 20: ENERGY FLOW BALANCE BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Microgrid Balance Breakdown */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Energy Pool Distribution (kWh)
              </h3>
              <p className="text-[11px] text-slate-400">Generated vs Available vs Traded vs Demand</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="kwh" fill="#10b981" radius={[6, 6, 0, 0]} name="Energy (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time INA219 Power Output Curve */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Real-Time Generation Profile (Watts)
              </h3>
              <p className="text-[11px] text-slate-400">ESP32 + INA219 Telemetry Stream</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#06b6d4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#powerGrad2)"
                    name="Power (W)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Waiting for telemetry stream...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
