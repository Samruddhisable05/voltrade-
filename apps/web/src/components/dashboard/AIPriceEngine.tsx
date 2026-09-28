'use client';

import React from 'react';
import { Sparkles, TrendingDown, TrendingUp, Info, RefreshCw } from 'lucide-react';

interface AIPriceEngineProps {
  role?: string;
  recommendation: {
    basePrice: number;
    recommendedPrice: number;
    supplyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    demandLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    priceChange: number;
    reason: string;
    calculatedAt: string;
  } | null;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function AIPriceEngine({
  role = 'PRODUCER',
  recommendation,
  onRefresh,
  loading = false,
}: AIPriceEngineProps) {
  const isConsumer = role === 'CONSUMER';

  const rec = recommendation || {
    basePrice: 10.0,
    recommendedPrice: 8.42,
    supplyLevel: 'HIGH' as const,
    demandLevel: 'MEDIUM' as const,
    priceChange: -1.58,
    reason: isConsumer 
      ? 'High solar generation at House A offers a discounted green buying tariff for your home.'
      : 'High solar generation + moderate local microgrid demand drives green discount.',
    calculatedAt: new Date().toISOString(),
  };

  const isDiscount = rec.priceChange <= 0;

  // Compute supply and demand bar percentages
  const supplyPercent = rec.supplyLevel === 'HIGH' ? 88 : rec.supplyLevel === 'MEDIUM' ? 55 : 28;
  const demandPercent = rec.demandLevel === 'HIGH' ? 82 : rec.demandLevel === 'MEDIUM' ? 50 : 25;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20 border border-purple-500/25 shadow-xl backdrop-blur-sm flex flex-col justify-between">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                {isConsumer ? 'AI BUYING TARIFF' : 'AI ENERGY PRICE'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {isConsumer ? 'Dynamic P2P Rate vs Utility Grid' : 'P2P Tariff Optimization Model'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {isConsumer ? 'SPOT BUY TARIFF' : 'DYNAMIC PRICE'}
            </span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                title="Recalculate dynamic tariff"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Big Price Display */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider">
              {isConsumer ? 'Optimal Buying Tariff' : 'Recommended Tariff'}
            </span>
            <div className="text-3xl font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
              ₹{rec.recommendedPrice.toFixed(2)}
              <span className="text-xs font-normal text-slate-400">/ kWh</span>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                isDiscount
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isDiscount ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span>{rec.priceChange <= 0 ? '' : '+'}{rec.priceChange.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {isConsumer ? 'Grid Baseline: ₹10.80' : `Base: ₹${rec.basePrice.toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Visual Supply & Demand Meters */}
        <div className="mt-4 space-y-3">
          {/* Supply Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>{isConsumer ? 'Local Solar Supply (House A)' : 'Local Renewable Supply'}</span>
              <span className="text-emerald-400 font-mono font-bold">{rec.supplyLevel} ({supplyPercent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${supplyPercent}%` }}
              />
            </div>
          </div>

          {/* Demand Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span>{isConsumer ? 'Household Demand (House B)' : 'Consumer Grid Demand'}</span>
              <span className="text-amber-400 font-mono font-bold">{rec.demandLevel} ({demandPercent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${demandPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Details: Confidence, Age, and Justification */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>AI Model Confidence:</span>
          <span className="font-mono text-purple-300 font-bold">87% Accuracy</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
          <div className="flex items-start gap-2 text-slate-300">
            <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "{rec.reason}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
