'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../lib/context';
import { PlusCircle, ShoppingBag, Zap, ShieldCheck } from 'lucide-react';

interface DashboardHeroProps {
  onOpenOfferModal: () => void;
  onOpenBuyModal?: () => void;
}

export default function DashboardHero({ onOpenOfferModal, onOpenBuyModal }: DashboardHeroProps) {
  const { currentUser, hardwareStatus } = useApp();

  // Dynamic greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const isProducer = currentUser.role === 'PRODUCER';

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Greeting & Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
              isProducer 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            }`}>
              {isProducer ? 'SOLAR PRODUCER (HOUSE A)' : 'GREEN CONSUMER (HOUSE B)'}
            </span>

            {/* System Status Pill */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hardwareStatus.isOnline
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className={hardwareStatus.isOnline ? 'text-emerald-400' : 'text-rose-400'}>
                {hardwareStatus.isOnline ? 'MICROGRID ONLINE' : 'SYSTEM OFFLINE'}
              </span>
            </span>

            {/* Hardware Relay State Pill for House B */}
            {!isProducer && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                hardwareStatus.isRelayActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                <Zap className="w-3 h-3" />
                {hardwareStatus.isRelayActive ? 'LOAD LED: ACTIVE' : 'LOAD LED: STANDBY'}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {getGreeting()}, {currentUser.name.toUpperCase()}
          </h1>

          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {isProducer
              ? 'Your solar microgrid is currently generating renewable energy and connected to the P2P order book.'
              : 'Connected to local microgrid. Purchase certified solar power from House A with instant blockchain settlement and automatic load relay activation.'}
          </p>
        </div>

        {/* Right: Functional Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          {isProducer ? (
            <button
              onClick={onOpenOfferModal}
              className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              Sell Energy
            </button>
          ) : (
            <button
              onClick={onOpenBuyModal}
              className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Zap className="w-4 h-4 fill-current" />
              + Buy Clean Energy
            </button>
          )}

          <Link
            href="/marketplace"
            className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700/80 transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            View Marketplace
          </Link>
        </div>

      </div>
    </section>
  );
}
