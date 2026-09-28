'use client';

import React from 'react';
import { 
  Sun, 
  Activity, 
  Cpu, 
  Home, 
  Layers, 
  BatteryCharging, 
  ArrowRight, 
  ChevronRight,
  Zap
} from 'lucide-react';

export default function EnergyFlow() {
  const flowNodes = [
    {
      id: 'solar',
      title: 'Solar Panel',
      subtitle: 'Solar Generation',
      detail: '~12.4V DC Input',
      icon: Sun,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    },
    {
      id: 'ina219',
      title: 'INA219 Sensor',
      subtitle: 'Measurement',
      detail: 'V, I, P Sensing',
      icon: Activity,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
    },
    {
      id: 'esp32',
      title: 'ESP32 Smart Meter',
      subtitle: 'IoT Transmission',
      detail: 'REST Telemetry',
      icon: Cpu,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'producer',
      title: 'House A',
      subtitle: 'Producer Grid',
      detail: 'Surplus Export',
      icon: Home,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    {
      id: 'marketplace',
      title: 'P2P Marketplace',
      subtitle: 'Order Settlement',
      detail: 'AI Dynamic Price',
      icon: Layers,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
    },
    {
      id: 'consumer',
      title: 'Consumer / House B',
      subtitle: 'Load Delivery',
      detail: 'Relay & LED Active',
      icon: BatteryCharging,
      color: 'text-teal-400',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10',
    },
  ];

  return (
    <section className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            REAL-TIME ENERGY FLOW
          </h2>
          <p className="text-[11px] text-slate-400">
            Physical Solar Ingestion ➔ IoT Telemetry ➔ P2P Marketplace ➔ Consumer Load Relay
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>AUTONOMOUS GRID ACTIVE</span>
        </div>
      </div>

      {/* Visual Energy Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {flowNodes.map((node, index) => {
          const Icon = node.icon;
          const isLast = index === flowNodes.length - 1;

          return (
            <div key={node.id} className="relative flex flex-col justify-between">
              <div
                className={`p-3.5 rounded-xl bg-slate-950/70 border ${node.border} hover:bg-slate-950 transition flex flex-col justify-between h-full group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${node.bg} ${node.color} border ${node.border}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 font-mono">0{index + 1}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-tight group-hover:text-emerald-300 transition">
                    {node.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{node.subtitle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400/90 font-medium">
                    {node.detail}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                </div>
              </div>

              {/* Connecting arrow indicator for desktop (hidden on last item) */}
              {!isLast && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 items-center justify-center shadow-md">
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
