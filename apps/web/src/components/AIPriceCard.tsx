'use client';

import React, { useEffect, useState } from 'react';
import { getPricingRecommendation } from '../lib/api';
import { Sparkles, TrendingDown, TrendingUp, Info, Sun, RefreshCw } from 'lucide-react';

export default function AIPriceCard() {
  const [recommendation, setRecommendation] = useState<any>({
    basePrice: 10.0,
    recommendedPrice: 10.50,
    supplyLevel: 'HIGH',
    demandLevel: 'MEDIUM',
    priceChange: 0.50,
    reason: 'High renewable availability with moderate consumer microgrid demand.',
    calculatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const data = await getPricingRecommendation();
      if (data) setRecommendation(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchPricing();
    const interval = setInterval(fetchPricing, 8000);
    return () => clearInterval(interval);
  }, []);

  const isDiscount = recommendation.priceChange <= 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/30 border border-emerald-500/20 p-5 shadow-xl relative backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              AI PRICE ENGINE
              <span className="text-[9px] font-semibold uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Dynamic
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Microgrid Supply & Demand Balancing</p>
          </div>
        </div>

        <button
          onClick={fetchPricing}
          disabled={loading}
          className="text-slate-400 hover:text-white p-1 rounded-md transition"
          title="Recalculate dynamic tariff"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Market Supply & Demand Levels */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Local Solar Supply</span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Renewable Pool</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                recommendation.supplyLevel === 'HIGH'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : recommendation.supplyLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {recommendation.supplyLevel}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Consumer Demand</span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Grid Load</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                recommendation.demandLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : recommendation.demandLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {recommendation.demandLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Tariff Price Display */}
      <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-400/80 tracking-wider">Recommended Tariff</span>
          <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
            ₹{recommendation.recommendedPrice.toFixed(2)}
            <span className="text-xs font-normal text-slate-400">/ kWh</span>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
              isDiscount
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isDiscount ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            <span>
              {isDiscount ? '' : '+'}
              {recommendation.priceChange.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Base: ₹{recommendation.basePrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Transparent Algorithmic Justification */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex items-start gap-2 text-slate-300">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Algorithmic Justification:</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{recommendation.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
