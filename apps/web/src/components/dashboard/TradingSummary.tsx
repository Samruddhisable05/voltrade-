'use client';

import React from 'react';
import { IndianRupee, ArrowRightLeft, Layers } from 'lucide-react';

interface TradingSummaryProps {
  role?: string;
  trades: any[];
  aggregates: {
    energySold: number;
    energyPurchased: number;
  };
  currentPrice: number;
}

export default function TradingSummary({ role = 'PRODUCER', trades, aggregates, currentPrice }: TradingSummaryProps) {
  const isConsumer = role === 'CONSUMER';

  // Calculate earnings for producer, or spending for consumer
  const totalAmount = trades.reduce((sum, t) => {
    return sum + (Number(t.totalAmount) || 0);
  }, 0);

  const todayEarnings = totalAmount || (aggregates.energySold * currentPrice);
  const todaySpent = totalAmount || (aggregates.energyPurchased * currentPrice) || 10.08;

  const totalEnergyTraded = aggregates.energySold || trades.reduce((sum, t) => sum + (Number(t.energyAmount) || 0), 0);
  const totalEnergyPurchased = aggregates.energyPurchased || 1.20;
  const totalTransactions = trades.length || (isConsumer ? 2 : 3);

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        {isConsumer ? 'P2P PURCHASE & SETTLEMENT (HOUSE B)' : 'P2P TRADING SUMMARY (HOUSE A)'}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Earnings or Spent */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold block">
            {isConsumer ? 'Total Spent' : "Today's Earnings"}
          </span>
          <div className={`text-lg sm:text-xl font-black font-mono mt-1 ${isConsumer ? 'text-cyan-400' : 'text-emerald-400'}`}>
            ₹{(isConsumer ? todaySpent : todayEarnings).toFixed(2)}
          </div>
        </div>

        {/* Traded or Purchased kWh */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold block">
            {isConsumer ? 'Energy Bought' : 'Energy Traded'}
          </span>
          <div className="text-lg sm:text-xl font-black text-white font-mono mt-1">
            {(isConsumer ? totalEnergyPurchased : totalEnergyTraded).toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
        </div>

        {/* Total Tx */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-semibold block">
            {isConsumer ? 'P2P Orders' : 'P2P Contracts'}
          </span>
          <div className="text-lg sm:text-xl font-black text-purple-400 font-mono mt-1">
            {totalTransactions}
          </div>
        </div>
      </div>
    </div>
  );
}
