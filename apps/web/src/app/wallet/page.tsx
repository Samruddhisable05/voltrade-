'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../lib/context';
import { getWalletData, topUpWallet } from '../../lib/api';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle, 
  RefreshCw, 
  CreditCard, 
  Clock, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function WalletPage() {
  const { currentUser, refreshData } = useApp();
  const [wallet, setWallet] = useState<any>({ balance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const data = await getWalletData(currentUser.id);
      if (data?.wallet) setWallet(data.wallet);
      if (data?.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [currentUser.id]);

  const handleTopUp = async (amount: number) => {
    try {
      await topUpWallet(currentUser.id, amount);
      await fetchWallet();
      await refreshData();
      setFeedback(`✓ Added ₹${amount} virtual demo funds to wallet`);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback(`Top up failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            FINANCIAL ESCROW
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Virtual Microgrid Wallet
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal double-entry demo ledger for instant peer-to-peer energy trades.
          </p>
        </div>

        <button
          onClick={fetchWallet}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Balance Card & Quick Top-Up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Display */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Available Demo Balance</span>
              <div className="text-4xl font-black text-white font-mono mt-2">
                ₹{wallet.balance.toFixed(2)}
              </div>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                Account: {currentUser.name} ({currentUser.role})
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Wallet className="w-8 h-8" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Settlement Currency: Indian Rupee (₹ Demo)</span>
            <span className="text-emerald-400 font-mono font-medium">Instant Escrow Clearing</span>
          </div>
        </div>

        {/* Demo Top Up Actions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Demo Balance Reload
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Instantly reload demo balance to test P2P purchases in judge walkthrough.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => handleTopUp(100)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                +₹100
              </button>
              <button
                onClick={() => handleTopUp(500)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                +₹500
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-mono">
              {feedback}
            </div>
          )}
        </div>

      </div>

      {/* Ledger Transaction History */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>Wallet Ledger Transactions ({transactions.length})</span>
          <span className="text-slate-500">Double-Entry Accounting</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT' || tx.type === 'TOPUP';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
