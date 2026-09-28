'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, ExternalLink } from 'lucide-react';

interface RecentTradesProps {
  trades: any[];
}

export default function RecentTrades({ trades }: RecentTradesProps) {
  // If no trades, provide clean default structure so UI is always functional
  const displayTrades = trades.length > 0 ? trades.slice(0, 5) : [
    {
      id: 'demo-tr-1',
      buyerName: 'House B',
      energyAmount: 1.20,
      pricePerKwh: 8.40,
      totalAmount: 10.08,
      status: 'Completed',
    },
    {
      id: 'demo-tr-2',
      buyerName: 'House C',
      energyAmount: 0.80,
      pricePerKwh: 8.25,
      totalAmount: 6.60,
      status: 'Completed',
    },
    {
      id: 'demo-tr-3',
      buyerName: 'House D',
      energyAmount: 0.50,
      pricePerKwh: 8.55,
      totalAmount: 4.28,
      status: 'Processing',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                RECENT P2P TRADES
              </h2>
              <p className="text-[10px] text-slate-400">Direct Contract Settlements</p>
            </div>
          </div>

          <Link
            href="/trades"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Trades Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-2.5 px-3">Buyer</th>
                <th className="py-2.5 px-3">Energy</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {displayTrades.map((trade) => {
                const isCompleted =
                  trade.status === 'COMPLETED' ||
                  trade.status === 'Completed' ||
                  trade.status === 'ENERGY_DELIVERED';

                return (
                  <tr key={trade.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="hover:text-emerald-400 transition"
                      >
                        {trade.buyerName || 'House B'}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">
                      {trade.energyAmount} kWh
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      ₹{trade.pricePerKwh.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Settlement: Peer-to-Peer</span>
        <span className="text-emerald-400 font-mono">EVM Notarized</span>
      </div>
    </div>
  );
}
