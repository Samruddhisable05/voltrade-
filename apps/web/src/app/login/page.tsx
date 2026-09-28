'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../lib/context';
import { Zap, Sun, BatteryCharging, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { availableUsers, switchUser } = useApp();

  const handleSelectRole = (userId: string) => {
    switchUser(userId);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
          <Zap className="w-8 h-8 text-slate-950 fill-current" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">VoltTrade Access Console</h1>
        <p className="text-sm text-slate-400 mt-1">Select a demo role to enter the decentralized microgrid</p>
      </div>

      <div className="space-y-4">
        {availableUsers.map((user) => {
          const isProducer = user.role === 'PRODUCER';
          const isConsumer = user.role === 'CONSUMER';

          return (
            <div
              key={user.id}
              onClick={() => handleSelectRole(user.id)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isProducer ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  isConsumer ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {isProducer && <Sun className="w-6 h-6" />}
                  {isConsumer && <BatteryCharging className="w-6 h-6" />}
                  {!isProducer && !isConsumer && <Shield className="w-6 h-6" />}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isProducer && 'Rooftop Solar Producer • ESP32 Smart Meter linked • Exports surplus'}
                    {isConsumer && 'Green Energy Consumer • Buys local solar • Activates load LED'}
                    {!isProducer && !isConsumer && 'Microgrid Operator • Telemetry & System Oversight'}
                  </p>
                  <span className="inline-block mt-2 font-mono text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Wallet Balance: ₹{user.walletBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
