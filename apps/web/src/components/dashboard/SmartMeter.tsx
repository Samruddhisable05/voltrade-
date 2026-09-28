'use client';

import React from 'react';
import { useApp } from '../../lib/context';
import { Gauge, Cpu, Zap, Activity, Clock, Info } from 'lucide-react';

export default function SmartMeter() {
  const { hardwareStatus } = useApp();
  const tel = hardwareStatus.telemetry || {
    voltage: 12.03,
    current: 1.047,
    power: 12.59,
    energy: 0.0474,
  };

  return (
    <section id="smart-meter" className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              SMART METER
              <span className="text-[9px] uppercase font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                IoT Node
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              INA219 I2C Telemetry • Bus ID: ESP32-HOUSE-A
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last update:</span>
          <span className="font-mono text-emerald-400 font-semibold text-[11px]">
            {hardwareStatus.isOnline ? `${hardwareStatus.lastSeenSecondsAgo} seconds ago` : 'Offline'}
          </span>
        </div>
      </div>

      {/* Grid: INSTANT VALUES vs CUMULATIVE VALUES */}
      <div className="space-y-4">
        {/* Section 1: Instantaneous Sensor Values */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              INSTANT SENSOR VALUES (Live Bus Telemetry)
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Real-time INA219</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Voltage */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Voltage</span>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  {tel.voltage.toFixed(2)} <span className="text-xs font-normal text-slate-400">V</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Bus DC</span>
            </div>

            {/* Current */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current</span>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  {tel.current.toFixed(3)} <span className="text-xs font-normal text-slate-400">A</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{(tel.current * 1000).toFixed(0)} mA</span>
            </div>

            {/* Power */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Instant Power</span>
                <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  {tel.power.toFixed(2)} <span className="text-xs font-normal text-slate-400">W</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">P = V × I</span>
            </div>
          </div>
        </div>

        {/* Section 2: Cumulative Energy */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              CUMULATIVE / INTEGRATED ENERGY
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Time-Integrated</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Metred Session Energy</span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {tel.energy.toFixed(4)} <span className="text-xs font-normal text-emerald-400">kWh</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block">Numerical Integration:</span>
              <p className="text-[11px] text-slate-500 font-mono">E = ∫ P(t) dt across active sampling loops</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distinction Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-slate-400 font-semibold">Distinction:</strong> Instant sensor values (V, A, W) reflect immediate bus load on the solar panel circuit, whereas cumulative energy (kWh) is the time-integrated value available for peer-to-peer smart contract trading.
        </p>
      </div>
    </section>
  );
}
