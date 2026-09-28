'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { 
  telemetryService, 
  energyService, 
  aiPricingService, 
  transactionService, 
  tradeService,
  TelemetryData,
  TelemetryHistoryPoint,
  EnergyPoolDistribution,
  EnvironmentalImpactData,
  AiPricingInsight,
  BlockchainTransaction,
  P2PTradeItem
} from '../../lib/services';
import CreateOfferModal from '../../components/CreateOfferModal';
import { 
  TrendingUp, Leaf, Sun, Zap, Activity, BarChart3, TreePine, 
  RefreshCw, Cpu, ArrowRight, BrainCircuit, Link as LinkIcon, 
  CheckCircle2, Clock, Sparkles, BatteryCharging, Home, ArrowRightLeft,
  ShieldCheck, AlertCircle, Eye
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { useRouter } from 'next/navigation';

export default function EnergyAnalyticsPage() {
  const { currentUser, hardwareStatus, refreshData } = useApp();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isTradeActive, setIsTradeActive] = useState(true);
  const [activeTradeAmount, setActiveTradeAmount] = useState(0.10);

  // Data states from services
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    voltage: 5.21,
    current: 82,
    power: 12.8,
    energy: 0.018,
    isOnline: true,
    isInaConnected: true,
    lastSeenSecondsAgo: 2,
    isDemoMode: false
  });

  const [history, setHistory] = useState<TelemetryHistoryPoint[]>([]);
  const [historyIsDemo, setHistoryIsDemo] = useState(false);

  const [kpis, setKpis] = useState({
    currentGenerationW: 12.8,
    availableSurplusKwh: 0.42,
    todayTradingRevenue: 350.00,
    successfulTradesCount: 12
  });

  const [poolDist, setPoolDist] = useState<EnergyPoolDistribution>({
    generated: 3.70,
    available: 1.80,
    traded: 0.70,
    consumed: 1.20,
    demand: 4.10
  });

  const [environmental, setEnvironmental] = useState<EnvironmentalImpactData>({
    co2AvoidedKg: 0.574,
    treesEquivalent: 0.32,
    renewableEnergyTradedKwh: 0.700
  });

  const [aiInsight, setAiInsight] = useState<AiPricingInsight>({
    status: "High solar generation detected.",
    recommendation: "Sell 0.42 kWh surplus energy",
    pricePerKwh: 10.50,
    potentialRevenue: 4.41,
    surplusKwh: 0.42
  });

  const [latestTx, setLatestTx] = useState<BlockchainTransaction>({
    hash: "0x7A93...E21F",
    energyAmount: 0.10,
    value: 1.05,
    status: "VERIFIED",
    timestamp: "2 min ago"
  });

  const [recentTrades, setRecentTrades] = useState<P2PTradeItem[]>([]);

  // Main data loader consuming isolated service layer
  const loadAllAnalyticsData = async () => {
    setLoading(true);
    try {
      // 1. Telemetry
      const telData = await telemetryService.getLiveTelemetry('ESP32-HOUSE-A');
      // Sync with global hardware context status if available
      const liveOnline = hardwareStatus ? hardwareStatus.isOnline : telData.isOnline;
      const lastSeen = hardwareStatus ? hardwareStatus.lastSeenSecondsAgo : telData.lastSeenSecondsAgo;

      setTelemetry({
        ...telData,
        isOnline: liveOnline,
        lastSeenSecondsAgo: lastSeen,
        // If hardware context shows device online with telemetry, use hardware telemetry power
        power: hardwareStatus?.telemetry?.power ? Number(hardwareStatus.telemetry.power.toFixed(1)) : telData.power,
        voltage: hardwareStatus?.telemetry?.voltage ? Number(hardwareStatus.telemetry.voltage.toFixed(2)) : telData.voltage,
        current: hardwareStatus?.telemetry?.current ? Math.round(hardwareStatus.telemetry.current * 1000) : telData.current,
        energy: hardwareStatus?.telemetry?.energy ? Number(hardwareStatus.telemetry.energy.toFixed(3)) : telData.energy,
        isDemoMode: !liveOnline || telData.isDemoMode
      });

      // 2. History
      const histData = await telemetryService.getHistory('ESP32-HOUSE-A', 15);
      setHistory(histData.history);
      setHistoryIsDemo(histData.isDemoMode);

      // 3. KPIs & Energy Pool
      const kpiRes = await energyService.getDashboardKpis(currentUser?.id);
      setKpis(kpiRes);

      const poolRes = await energyService.getPoolDistribution(currentUser?.id);
      setPoolDist(poolRes);

      // 4. Environmental Impact
      const envRes = await energyService.getEnvironmentalImpact();
      setEnvironmental(envRes);

      // 5. AI Pricing
      const aiRes = await aiPricingService.getRecommendation();
      setAiInsight(aiRes);

      // 6. Latest Blockchain Tx
      const txRes = await transactionService.getLatestBlockchainTransaction();
      setLatestTx(txRes);

      // 7. Recent P2P Trades
      const tradesRes = await tradeService.getRecentTrades(currentUser?.id);
      setRecentTrades(tradesRes);

    } catch (err) {
      console.error('Failed to load Energy Analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalyticsData();
    const interval = setInterval(loadAllAnalyticsData, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.id, hardwareStatus?.isOnline, hardwareStatus?.lastSeenSecondsAgo]);

  const handleSellSurplus = () => {
    setIsOfferModalOpen(true);
  };

  const handleOfferSuccess = async () => {
    await loadAllAnalyticsData();
    await refreshData();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* Dynamic Keyframe Animation Styles for Energy Flow */}
      <style>{`
        @keyframes energy-flow-particle {
          0% { left: 0%; opacity: 0; transform: scale(0.8); }
          15% { opacity: 1; transform: scale(1.2); }
          85% { opacity: 1; transform: scale(1.2); }
          100% { left: 98%; opacity: 0; transform: scale(0.8); }
        }
        .flow-particle-1 {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 12px #10b981, 0 0 24px #34d399;
          animation: energy-flow-particle 3s infinite linear;
        }
        .flow-particle-2 {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #06b6d4;
          box-shadow: 0 0 10px #06b6d4, 0 0 20px #22d3ee;
          animation: energy-flow-particle 3s infinite linear;
          animation-delay: 1.5s;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              MICROGRID CONTROL CENTER
            </span>
            {telemetry.isDemoMode ? (
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                DEMO MODE
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ESP32 ONLINE
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Energy Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time IoT telemetry, AI pricing recommendations, and P2P trade intelligence.
          </p>
        </div>

        <button
          onClick={loadAllAnalyticsData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-2 text-xs font-semibold"
          title="Refresh analytics data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ==================================================
          ROW 1: TOP KPI SECTION
          ================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: CURRENT GENERATION */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 hover:border-emerald-500/30 shadow-xl relative overflow-hidden transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              CURRENT GENERATION
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {telemetry.power.toFixed(1)}
            </span>
            <span className="text-base font-bold text-emerald-400">W</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            ESP32 + INA219 Live
          </p>
        </div>

        {/* CARD 2: AVAILABLE SURPLUS */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 hover:border-teal-500/30 shadow-xl transition">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            AVAILABLE SURPLUS
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-teal-400 font-mono tracking-tight">
              {kpis.availableSurplusKwh.toFixed(2)}
            </span>
            <span className="text-base font-bold text-teal-400">kWh</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-teal-400" />
            Available for P2P trading
          </p>
        </div>

        {/* CARD 3: TODAY'S TRADING REVENUE */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 hover:border-amber-500/30 shadow-xl transition">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            TODAY'S TRADING REVENUE
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
              ₹{kpis.todayTradingRevenue.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-400" />
            {kpis.successfulTradesCount} successful trades
          </p>
        </div>

      </div>

      {/* ==================================================
          ROW 2: ENERGY FLOW VISUALIZATION & LIVE TELEMETRY
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ENERGY FLOW VISUALIZATION (Col-span 2) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                ENERGY FLOW
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                P2P renewable energy moving from solar producer to grid consumer
              </p>
            </div>
            
            <button
              onClick={() => setIsTradeActive(!isTradeActive)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Toggle trade animation demo state"
            >
              Simulate: {isTradeActive ? 'Active Trade' : 'Idle Grid'}
            </button>
          </div>

          {/* 6 STAGES FLOW DIAGRAM:
              SOLAR PRODUCER -> GENERATION -> SURPLUS -> AI PRICING -> P2P TRADE -> CONSUMER */}
          <div className="relative py-4 my-2">
            {/* Horizontal Connecting Pipeline */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800/80 -translate-y-1/2 rounded-full overflow-hidden">
              {isTradeActive && (
                <>
                  <div className="flow-particle-1" />
                  <div className="flow-particle-2" />
                </>
              )}
            </div>

            {/* Stages Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-0 relative z-10">
              
              {/* STAGE 1: SOLAR PRODUCER */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-105 transition">
                  <Sun className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider mt-2.5 flex items-center gap-1">
                  <span>☀</span> SOLAR PRODUCER
                </span>
              </div>

              {/* STAGE 2: GENERATION */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 transition">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider mt-2.5 flex items-center gap-1">
                  <span>⚡</span> GENERATION
                </span>
              </div>

              {/* STAGE 3: SURPLUS */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-950 border border-teal-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.15)] group-hover:scale-105 transition">
                  <BatteryCharging className="w-6 h-6 text-teal-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider mt-2.5 flex items-center gap-1">
                  <span>🔋</span> SURPLUS
                </span>
              </div>

              {/* STAGE 4: AI PRICING */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-950 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:scale-105 transition">
                  <BrainCircuit className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider mt-2.5 flex items-center gap-1">
                  <span>🤖</span> AI PRICING
                </span>
              </div>

              {/* STAGE 5: P2P TRADE */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:scale-105 transition">
                  <ArrowRightLeft className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider mt-2.5 flex items-center gap-1">
                  <span>🤝</span> P2P TRADE
                </span>
              </div>

              {/* STAGE 6: CONSUMER */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:scale-105 transition">
                  <Home className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider mt-2.5 flex items-center gap-1">
                  <span>🏠</span> CONSUMER
                </span>
              </div>

            </div>
          </div>

          {/* Flow Status Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            {isTradeActive ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {activeTradeAmount.toFixed(2)} kWh currently being traded
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                No active energy trade
              </span>
            )}
          </div>
        </div>

        {/* LIVE ESP32 TELEMETRY CARD */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                LIVE ESP32 TELEMETRY
              </h3>
              {telemetry.isDemoMode && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 tracking-wider">
                  DEMO MODE
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* ESP32 Status */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">ESP32 STATUS</span>
                <div className="flex items-center gap-2">
                  {telemetry.isOnline ? (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                      <span className="text-xs font-bold text-emerald-400">ONLINE</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <span className="text-xs font-bold text-rose-400">OFFLINE</span>
                    </>
                  )}
                </div>
              </div>

              {/* INA219 Status */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">INA219 STATUS</span>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-emerald-400">CONNECTED</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Voltage</div>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    {telemetry.voltage.toFixed(2)} <span className="text-xs font-normal text-slate-400">V</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Current</div>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    {telemetry.current.toFixed(0)} <span className="text-xs font-normal text-slate-400">mA</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Power</div>
                  <div className="text-lg font-mono font-black text-cyan-400 mt-0.5">
                    {telemetry.power.toFixed(2)} <span className="text-xs font-normal text-slate-400">W</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Energy</div>
                  <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
                    {telemetry.energy.toFixed(3)} <span className="text-xs font-normal text-slate-400">kWh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 text-center font-mono">
            Last updated: {telemetry.lastSeenSecondsAgo} sec ago
          </div>
        </div>

      </div>

      {/* ==================================================
          ROW 3: ENERGY POOL DISTRIBUTION & REAL-TIME GENERATION
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ENERGY POOL DISTRIBUTION */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  ENERGY POOL DISTRIBUTION (kWh)
                </h3>
                <p className="text-[11px] text-slate-400">Microgrid supply, trade balance, and consumer demand breakdown</p>
              </div>
            </div>

            {/* Quick Metrics Header */}
            <div className="grid grid-cols-5 gap-1.5 mb-4 text-center">
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Generated</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{poolDist.generated.toFixed(2)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Available</span>
                <span className="text-xs font-bold font-mono text-teal-400">{poolDist.available.toFixed(2)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Traded</span>
                <span className="text-xs font-bold font-mono text-cyan-400">{poolDist.traded.toFixed(2)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Consumed</span>
                <span className="text-xs font-bold font-mono text-indigo-400">{poolDist.consumed.toFixed(2)}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Demand</span>
                <span className="text-xs font-bold font-mono text-amber-400">{poolDist.demand.toFixed(2)}</span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-60 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: 'Generated', kwh: poolDist.generated, fill: '#10b981' },
                    { name: 'Available', kwh: poolDist.available, fill: '#14b8a6' },
                    { name: 'Traded', kwh: poolDist.traded, fill: '#06b6d4' },
                    { name: 'Consumed', kwh: poolDist.consumed, fill: '#6366f1' },
                    { name: 'Demand', kwh: poolDist.demand, fill: '#f59e0b' },
                  ]} 
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#f8fafc' }}
                    formatter={(value: any) => [`${Number(value).toFixed(2)} kWh`, 'Energy']}
                  />
                  <Bar dataKey="kwh" radius={[6, 6, 0, 0]}>
                    {[
                      { fill: '#10b981' },
                      { fill: '#14b8a6' },
                      { fill: '#06b6d4' },
                      { fill: '#6366f1' },
                      { fill: '#f59e0b' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* REAL-TIME GENERATION PROFILE */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  REAL-TIME GENERATION
                  {historyIsDemo && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      DEMO DATA
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">ESP32 + INA219 Telemetry Stream</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-mono font-black text-cyan-400 flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  {telemetry.power.toFixed(1)} W
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Live Ingestion</span>
              </div>
            </div>

            {/* Recharts Live Generation Stream */}
            <div className="h-60 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="powerStreamGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#06b6d4' }}
                    formatter={(val: any) => [`${Number(val).toFixed(1)} W`, 'Power Generation']}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#powerStreamGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================
          ROW 4: AI ENERGY INSIGHT & LATEST BLOCKCHAIN TX
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI ENERGY INSIGHT */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none">
            <BrainCircuit className="w-36 h-36 text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-indigo-300 tracking-wider uppercase flex items-center gap-2">
                🤖 AI ENERGY INSIGHT
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                DYNAMIC PRICING
              </span>
            </div>

            <p className="text-sm text-white font-semibold mt-4 mb-4">
              {aiInsight.status}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400">Recommended Action:</span>
                <span className="text-xs font-bold text-emerald-400">{aiInsight.recommendation}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400">Current Market Price:</span>
                <span className="text-xs font-bold text-amber-400 font-mono">₹{aiInsight.pricePerKwh.toFixed(2)} / kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Potential Revenue:</span>
                <span className="text-sm font-bold text-white font-mono">₹{aiInsight.potentialRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Sell Surplus Button */}
          <button
            onClick={handleSellSurplus}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-500/20 active:scale-98 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            SELL SURPLUS
          </button>
        </div>

        {/* LATEST BLOCKCHAIN TRANSACTION */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
                ⛓ LATEST BLOCKCHAIN TRANSACTION
              </h3>
              <span className="text-[10px] font-mono text-slate-400">CRYPTOGRAPHIC SETTLEMENT</span>
            </div>

            <div className="space-y-3.5 mt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30 shrink-0">
                  <LinkIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Transaction</div>
                  <div className="text-xs font-mono text-blue-400 font-bold truncate">{latestTx.hash}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Energy</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{latestTx.energyAmount.toFixed(2)} kWh</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Value</div>
                  <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">₹{latestTx.value.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">✓ {latestTx.status}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono">{latestTx.timestamp}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/transactions')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Transaction Details
          </button>
        </div>

      </div>

      {/* ==================================================
          ROW 5: RECENT P2P TRADES
          ================================================== */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              RECENT P2P TRADES
            </h3>
            <p className="text-[11px] text-slate-400">Direct microgrid peer energy exchanges</p>
          </div>
          
          <button 
            onClick={() => router.push('/trades')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
          >
            View All Trades <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40">
                <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">Producer</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">Consumer</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">Energy</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">Price</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTrades.map((trade, idx) => (
                <tr key={trade.id || idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-200 whitespace-nowrap">{trade.producer}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-200 whitespace-nowrap">{trade.consumer}</td>
                  <td className="py-3.5 px-4 text-xs font-mono font-bold text-teal-400 whitespace-nowrap">{trade.energy.toFixed(2)} kWh</td>
                  <td className="py-3.5 px-4 text-xs font-mono font-bold text-amber-400 whitespace-nowrap">₹{trade.price.toFixed(2)}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      ✓ {trade.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] font-mono text-slate-400 whitespace-nowrap">{trade.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================
          ROW 6: ENVIRONMENTAL IMPACT
          ================================================== */}
      <div>
        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-teal-400" />
          ENVIRONMENTAL IMPACT
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">CO₂ Avoided</div>
              <div className="text-xl font-mono font-black text-teal-400">{environmental.co2AvoidedKg.toFixed(3)} kg</div>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Equivalent Tree-Months</div>
              <div className="text-xl font-mono font-black text-emerald-400">{environmental.treesEquivalent.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TreePine className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Renewable Energy Traded</div>
              <div className="text-xl font-mono font-black text-yellow-400">{environmental.renewableEnergyTradedKwh.toFixed(3)} kWh</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sun className="w-6 h-6" />
            </div>
          </div>

        </div>
      </div>

      {/* Sell Surplus Modal Integration */}
      <CreateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={handleOfferSuccess}
      />

    </div>
  );
}
