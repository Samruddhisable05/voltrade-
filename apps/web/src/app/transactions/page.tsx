'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTransactions } from '../../lib/api';
import { Layers, ShieldCheck, ArrowRight, RefreshCw, ExternalLink, Hash } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTx = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      if (data?.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error('Transactions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTx();
    const interval = setInterval(fetchTx, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            AUDIT TRAIL
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Decentralized Transaction Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic ledger containing immutable records of energy volume, tariffs, and EVM block commitments.
          </p>
        </div>

        <button
          onClick={fetchTx}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Refresh ledger"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>Notarized Microgrid Ledger ({transactions.length} entries)</span>
          <span className="text-emerald-400 font-mono text-[11px]">EVM Consensus: FINAL</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tx ID / Hash</th>
                  <th className="py-3 px-4">Producer</th>
                  <th className="py-3 px-4">Consumer</th>
                  <th className="py-3 px-4">Energy (kWh)</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-slate-200">#{tx.id.substring(0, 8)}...</div>
                      <div className="text-[10px] text-emerald-400 font-mono truncate max-w-[130px]" title={tx.txHash}>
                        {tx.txHash}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {tx.producer}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {tx.consumer}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {tx.energy} kWh
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₹{tx.price.toFixed(2)}/kWh
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/trades/${tx.tradeId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 text-[11px] font-medium transition"
                      >
                        Details
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
