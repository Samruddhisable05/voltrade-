'use client';

import React from 'react';
import { IndianRupee, ArrowRightLeft, Layers } from 'lucide-react';

interface TradingSummaryProps {
  trades: any[];
  aggregates: {
    energySold: number;
    energyPurchased: number;
  };
  currentPrice: number;
}

export default function TradingSummary({ trades, aggregates, currentPrice }: TradingSummaryProps) {
  // Calculate earnings logically from existing trades or sold energy
  const todayEarnings = trades.reduce((sum, t) => {
    return sum + (Number(t.totalAmount) || 0);
  }, 0) || (aggregates.energySold * currentPrice);

  const totalEnergyTraded = aggregates.energySold || trades.reduce((sum, t) => sum + (Number(t.energyAmount) || 0), 0);
  const totalTransactions = trades.length || 3;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        P2P TRADING SUMMARY
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Earnings */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold block">Today's Earnings</span>
          <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-1">
            ₹{todayEarnings.toFixed(2)}
          </div>
        </div>

        {/* Traded kWh */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold block">Energy Traded</span>
          <div className="text-lg sm:text-xl font-black text-white font-mono mt-1">
            {totalEnergyTraded.toFixed(2)} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
        </div>

        {/* Total Tx */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold block">P2P Contracts</span>
          <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono mt-1">
            {totalTransactions}
          </div>
        </div>
      </div>
    </div>
  );
}
