'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/context';
import { executeBuyTrade } from '../lib/api';
import { 
  Zap, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Power,
  Layers
} from 'lucide-react';

interface BuyEnergyModalProps {
  offer: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (purchasedKwh?: number) => void;
}

export default function BuyEnergyModal({ offer, isOpen, onClose, onSuccess }: BuyEnergyModalProps) {
  const { currentUser, triggerRelayVisual, refreshData } = useApp();
  const [requestedKwh, setRequestedKwh] = useState<number>(1.0);
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('INPUT');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [completedTrade, setCompletedTrade] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset state to INPUT every time the modal opens or offer changes
  useEffect(() => {
    if (isOpen) {
      setStep('INPUT');
      setErrorMsg(null);
      setCompletedTrade(null);
      const remaining = offer?.remainingEnergy ? Number(offer.remainingEnergy) : 1.0;
      setRequestedKwh(Math.min(1.0, remaining > 0 ? remaining : 1.0));
    }
  }, [isOpen, offer]);

  if (!isOpen || !offer) return null;

  const pricePerKwh = offer.pricePerKwh || 8.42;
  const totalAmount = Number((requestedKwh * pricePerKwh).toFixed(2));
  const hasSufficientFunds = currentUser.walletBalance >= totalAmount;

  const handleClose = () => {
    setStep('INPUT');
    setErrorMsg(null);
    setCompletedTrade(null);
    onClose();
  };

  const handleConfirmPurchase = async () => {
    if (!hasSufficientFunds) {
      setErrorMsg(`Insufficient wallet balance. You have ₹${currentUser.walletBalance.toFixed(2)}, but total is ₹${totalAmount.toFixed(2)}.`);
      return;
    }

    setStep('PROCESSING');
    setErrorMsg(null);

    try {
      setProgressMsg('1. Verifying virtual wallet funds & executing escrow debit...');
      await new Promise((r) => setTimeout(r, 600));

      setProgressMsg('2. Generating Mock Blockchain EVM Transaction Hash...');
      await new Promise((r) => setTimeout(r, 600));

      setProgressMsg('3. Dispatching ACTIVATE_LOAD command to ESP32 hardware relay...');
      
      let result: any;
      if (offer.isDemo) {
        result = {
          trade: {
            id: `trade-demo-${Date.now()}`,
            buyerId: currentUser.id,
            sellerId: offer.userId,
            energyAmount: requestedKwh,
            pricePerKwh: pricePerKwh,
            totalAmount,
            status: 'COMPLETED',
            blockchainTxHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            createdAt: new Date().toISOString(),
          },
        };
      } else {
        const isDummyId = !offer?.id || offer.id.startsWith('demo') || offer.id === 'offer-solar-live';
        result = await executeBuyTrade({
          buyerId: currentUser.id,
          offerId: isDummyId ? undefined : offer.id,
          energyAmount: requestedKwh,
        });
      }

      // Trigger hardware feedback visualization
      triggerRelayVisual(5000);
      setCompletedTrade(result.trade);

      setProgressMsg('4. Consumer Load LED Active! Energy Delivery in progress...');
      await new Promise((r) => setTimeout(r, 800));

      await refreshData();
      setStep('SUCCESS');
      onSuccess(requestedKwh);
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setErrorMsg(err.message || 'Trade execution failed');
      setStep('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* INPUT STEP */}
        {step === 'INPUT' && (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Purchase Renewable Energy</h3>
                <p className="text-xs text-slate-400">Direct Peer-to-Peer Settlement</p>
              </div>
            </div>

            {/* Offer Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Producer Name:</span>
                <span className="font-semibold text-slate-200">{offer.producerName || 'House A (Producer)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Renewable Source:</span>
                <span className="font-semibold text-emerald-400">{offer.renewableSource || 'Rooftop Solar PV'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Surplus:</span>
                <span className="font-mono text-emerald-400 font-semibold">{offer.remainingEnergy} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fixed Tariff:</span>
                <span className="font-mono text-white font-semibold">₹{offer.pricePerKwh.toFixed(2)} / kWh</span>
              </div>
            </div>

            {/* Quantity Slider / Input */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Select Desired Energy:</span>
                <span className="text-emerald-400 font-mono text-sm">{requestedKwh.toFixed(2)} kWh</span>
              </div>
              <input
                type="range"
                min="0.1"
                max={offer.remainingEnergy}
                step="0.1"
                value={requestedKwh}
                onChange={(e) => setRequestedKwh(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.1 kWh</span>
                <span>Max: {offer.remainingEnergy} kWh</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-300">Total Settlement:</span>
                <span className="text-2xl font-black text-white font-mono">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 pt-2 border-t border-emerald-500/20">
                <span>Your Wallet Balance:</span>
                <span className={hasSufficientFunds ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono font-bold'}>
                  ₹{currentUser.walletBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleConfirmPurchase}
              disabled={!hasSufficientFunds || requestedKwh <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Confirm Purchase & Deliver Energy
            </button>
          </div>
        )}

        {/* PROCESSING STEP */}
        {step === 'PROCESSING' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Executing P2P Trade</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{progressMsg}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Double-entry virtual wallet debit/credit</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mock Blockchain cryptographic notarization</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ESP32 Hardware Relay Command dispatch</span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'SUCCESS' && (
          <div className="py-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Trade Completed Successfully!</h3>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">Energy Delivery Active</p>
            </div>

            {/* Hardware Delivery Notice Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Power className="w-4 h-4" />
                <span>ENERGY DELIVERY STATUS</span>
              </div>
              <div className="text-slate-300 text-[11px] space-y-1">
                <p>✓ Relay command dispatched to ESP32 smart meter</p>
                <p>✓ Physical Consumer Load LED energized for 5 seconds</p>
                <p>✓ OLED display updated to "ENERGY DELIVERED"</p>
              </div>

              {completedTrade?.blockchainTxHash && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Blockchain Tx Hash</span>
                  <p className="font-mono text-[10px] text-emerald-400 truncate mt-0.5">
                    {completedTrade.blockchainTxHash}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

        {/* ERROR STEP */}
        {step === 'ERROR' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Trade Failed</h3>
              <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>
            </div>
            <button
              onClick={() => setStep('INPUT')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
