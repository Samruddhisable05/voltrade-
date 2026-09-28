'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../lib/context';
import { getTrades } from '../../lib/api';
import { ArrowRightLeft, ShieldCheck, Zap, Layers, Clock, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';

export default function TradesListPage() {
  const { currentUser } = useApp();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTradesList = async () => {
    setLoading(true);
    try {
      const data = await getTrades();
      if (data?.trades) setTrades(data.trades);
    } catch (err) {
      console.error('Trades fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradesList();
    const interval = setInterval(fetchTradesList, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            P2P TRADE SETTLEMENTS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Energy Trade History & Lifecycle
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of all peer-to-peer matched transactions, blockchain records, and hardware activations.
          </p>
        </div>

        <button
          onClick={fetchTradesList}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Refresh trades"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Trades Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>Executed P2P Contracts ({trades.length})</span>
          <span className="text-emerald-400">Notarized & Audited</span>
        </div>

        {trades.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No trades executed yet. Visit the marketplace to buy or list energy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Trade ID</th>
                  <th className="py-3 px-4">Producer</th>
                  <th className="py-3 px-4">Consumer</th>
                  <th className="py-3 px-4">Energy (kWh)</th>
                  <th className="py-3 px-4">Price / Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Blockchain Proof</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-800/40 transition group">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                      #{trade.id.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {trade.sellerName || 'House A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {trade.buyerName || 'House B'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {trade.energyAmount} kWh
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">₹{trade.totalAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">₹{trade.pricePerKwh.toFixed(2)}/kWh</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {trade.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                      {trade.blockchainTxHash ? (
                        <span className="text-emerald-400">{trade.blockchainTxHash.substring(0, 14)}...</span>
                      ) : (
                        'Pending'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 text-[11px] font-medium transition"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
