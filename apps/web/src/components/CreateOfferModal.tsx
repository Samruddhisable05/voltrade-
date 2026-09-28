'use client';

import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { createEnergyOffer, getPricingRecommendation } from '../lib/api';
import { PlusCircle, X, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Sun } from 'lucide-react';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOfferModal({ isOpen, onClose, onSuccess }: CreateOfferModalProps) {
  const { currentUser, refreshData } = useApp();
  const [energyAmount, setEnergyAmount] = useState<number>(2.0);
  const [pricePerKwh, setPricePerKwh] = useState<number>(10.50);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyAiPrice = async () => {
    try {
      const rec = await getPricingRecommendation();
      if (rec?.recommendedPrice) {
        setPricePerKwh(rec.recommendedPrice);
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (energyAmount <= 0 || pricePerKwh <= 0) {
      setErrorMsg('Energy amount and price per kWh must be greater than 0.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await createEnergyOffer(currentUser.id, energyAmount, pricePerKwh);
      await refreshData();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to list energy offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">List Renewable Surplus</h3>
            <p className="text-xs text-slate-400">Publish your solar generation to the microgrid</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Energy Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Energy Quantity for Sale (kWh)
            </label>
            <input
              type="number"
              min="0.1"
              max="50"
              step="0.1"
              value={energyAmount}
              onChange={(e) => setEnergyAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Price per kWh with AI recommendation button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Tariff Rate (₹ / kWh)
              </label>
              <button
                type="button"
                onClick={handleApplyAiPrice}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
              >
                <Sparkles className="w-3 h-3" />
                Use AI Recommended Tariff
              </button>
            </div>
            <input
              type="number"
              min="1.0"
              max="50"
              step="0.1"
              value={pricePerKwh}
              onChange={(e) => setPricePerKwh(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Revenue Estimation */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex justify-between items-center">
            <span className="text-slate-400">Projected Producer Revenue:</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              ₹{(energyAmount * pricePerKwh).toFixed(2)}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || energyAmount <= 0 || pricePerKwh <= 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {submitting ? 'Publishing Offer...' : 'Publish to Marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
}
