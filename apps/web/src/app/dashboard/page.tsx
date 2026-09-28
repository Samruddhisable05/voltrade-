'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../lib/context';
import { 
  getEnergyHistory, 
  getDashboardAggregates, 
  getTrades 
} from '../../lib/api';
import DeviceStatusCard from '../../components/DeviceStatusCard';
import AIPriceCard from '../../components/AIPriceCard';
import CreateOfferModal from '../../components/CreateOfferModal';
import { 
  Zap, 
  Sun, 
  BatteryCharging, 
  Gauge, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  ShoppingBag, 
  Layers, 
  ShieldCheck, 
  Activity,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export default function DashboardPage() {
  const { currentUser, hardwareStatus } = useApp();
  const [aggregates, setAggregates] = useState<any>({
    energyGenerated: 3.85,
    energyAvailable: 1.80,
    energySold: 2.05,
    energyPurchased: 0.50,
    consumerDemandKwh: 4.20,
    producerStatus: 'ACTIVE_EXPORT',
  });
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [agg, hist, trd] = await Promise.all([
        getDashboardAggregates(currentUser.id).catch(() => null),
        getEnergyHistory('ESP32-HOUSE-A', 20).catch(() => ({ history: [] })),
        getTrades().catch(() => ({ trades: [] })),
      ]);

      if (agg) setAggregates(agg);
      if (hist?.history && hist.history.length > 0) {
        setHistoryData(
          hist.history.map((h: any, i: number) => ({
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const tel = hardwareStatus.telemetry || {
    voltage: 12.4,
    current: 0.85,
    power: 10.54,
    energy: 0.048,
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner: User Persona and Action Shortcut */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {currentUser.role} CONSOLE
            </span>
            <span className="text-xs text-slate-400 font-mono">Microgrid ID: GRID-IN-BLR-01</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentUser.role === 'PRODUCER'
              ? 'Real-time rooftop solar generation stream linked to ESP32 smart meter.'
              : 'Decentralized clean energy marketplace consumer terminal.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {currentUser.role === 'PRODUCER' && (
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              List Energy for Sale
            </button>
          )}

          <Link
            href="/marketplace"
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Open Marketplace
          </Link>
        </div>
      </div>

      {/* 4 PRIMARY TELEMETRY SENSOR CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Voltage Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Bus Voltage</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono">{tel.voltage.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">V</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${hardwareStatus.isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
            <span>{hardwareStatus.isOnline ? 'Sensor Live (INA219)' : 'Sensor Offline'}</span>
          </div>
        </div>

        {/* Current Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">DC Current</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono">{tel.current.toFixed(3)}</span>
            <span className="text-xs font-semibold text-slate-400">A</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            <span>{(tel.current * 1000).toFixed(0)} mA load draw</span>
          </div>
        </div>

        {/* Power Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Instant Power (V×I)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-400 font-mono">{tel.power.toFixed(2)}</span>
            <span className="text-xs font-semibold text-slate-400">Watts</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80 font-medium">
            <span>Active Solar Generation</span>
          </div>
        </div>

        {/* Cumulative Energy Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Cumulative Energy</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono">{tel.energy.toFixed(4)}</span>
            <span className="text-xs font-semibold text-slate-400">kWh</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Integrated Total Metred</span>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: DEVICE STATUS, AI PRICING, & MICROGRID METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Device Status Card with ESP32 & Relay State */}
        <DeviceStatusCard />

        {/* 2. AI Price Recommendation Engine Card */}
        <AIPriceCard />

        {/* 3. Microgrid Pool & Balance Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">MICROGRID BALANCE</h3>
                  <p className="text-[11px] text-slate-400">Supply Liquidity vs Demand</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                P2P ACTIVE
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Energy Generated:</span>
                <span className="font-mono text-white font-bold">{aggregates.energyGenerated.toFixed(3)} kWh</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Surplus Available for Sale:</span>
                <span className="font-mono text-emerald-400 font-bold">{aggregates.energyAvailable.toFixed(3)} kWh</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Energy Traded / Sold:</span>
                <span className="font-mono text-teal-300 font-bold">{aggregates.energySold.toFixed(3)} kWh</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Aggregated Consumer Demand:</span>
                <span className="font-mono text-amber-400 font-bold">{aggregates.consumerDemandKwh.toFixed(2)} kWh</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Producer Export Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE / EXPORTING
            </span>
          </div>
        </div>

      </div>

      {/* LOWER SECTION: REAL-TIME CHART & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Telemetry Power Output Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Solar Power Curve (Watts)
              </h3>
              <p className="text-[11px] text-slate-400">Continuous sampling from INA219 sensor</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#powerGrad)"
                    name="Power (W)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Waiting for incoming telemetry stream...
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Recent P2P Trades
                </h3>
                <p className="text-[11px] text-slate-400">Cryptographically Notarized</p>
              </div>
              <Link href="/transactions" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                View All
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {recentTrades.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No recent trades yet</p>
              ) : (
                recentTrades.map((t) => (
                  <Link
                    key={t.id}
                    href={`/trades/${t.id}`}
                    className="block p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/30 transition group"
                  >
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition">
                          {t.energyAmount} kWh Traded
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t.sellerName || 'House A'} ➔ {t.buyerName || 'House B'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold">₹{t.totalAmount.toFixed(2)}</span>
                        <span className="block text-[9px] uppercase font-bold text-emerald-400/90">
                          {t.status}
                        </span>
                      </div>
                    </div>
                    {t.blockchainTxHash && (
                      <p className="font-mono text-[9px] text-slate-500 truncate mt-1.5">
                        {t.blockchainTxHash}
                      </p>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <Link
              href="/marketplace"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              Browse Active Energy Offers ➔
            </Link>
          </div>
        </div>

      </div>

      {/* Producer Create Offer Modal */}
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
