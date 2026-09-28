'use client';

import React from 'react';
import { useApp } from '../../lib/context';
import { Gauge, Cpu, Zap, Activity, Clock, Info } from 'lucide-react';

interface SmartMeterProps {
  role?: string;
  energyPurchased?: number;
}

export default function SmartMeter({ role, energyPurchased = 1.20 }: SmartMeterProps) {
  const { hardwareStatus, currentUser } = useApp();
  const effectiveRole = role || currentUser.role;
  const isConsumer = effectiveRole === 'CONSUMER';

  const tel = hardwareStatus.telemetry || {
    voltage: 12.03,
    current: 1.047,
    power: 12.59,
    energy: 0.0474,
  };

  const isRelayOn = hardwareStatus.isRelayActive;
  const consumerCurrent = isRelayOn ? 0.85 : 0.0;
  const consumerPower = isRelayOn ? (tel.voltage * consumerCurrent) : 0.0;

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
              {isConsumer ? 'SMART METER • CONSUMER LOAD RECEPTION (HOUSE B)' : 'SMART METER • PRODUCER INGESTION (HOUSE A)'}
              <span className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
                isConsumer 
                  ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' 
                  : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
              }`}>
                {isConsumer ? 'Relay Load Node' : 'IoT Node'}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              {isConsumer 
                ? 'ESP32 Relay Module • GPIO 19 Controlled • Consumer Load Circuit'
                : 'INA219 I2C Telemetry • Bus ID: ESP32-HOUSE-A'}
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

      {/* Prominent Consumer Relay & LED Status Card for House B */}
      {isConsumer && (
        <div className={`mb-4 p-4 rounded-xl border transition-all ${
          isRelayOn
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${
                isRelayOn
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                  : 'bg-slate-850 text-slate-500 border-slate-700'
              }`}>
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    isRelayOn ? 'text-emerald-300' : 'text-slate-300'
                  }`}>
                    {isRelayOn ? 'CONSUMER LOAD LED: ENERGIZED (ACTIVE)' : 'CONSUMER LOAD LED: STANDBY (IDLE)'}
                  </span>
                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    isRelayOn
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isRelayOn ? 'RELAY CLOSED (GPIO 19 HIGH)' : 'RELAY OPEN (GPIO 19 LOW)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isRelayOn
                    ? 'Smart contract executed! Power is actively flowing from House A to illuminate House B consumer LED.'
                    : 'Awaiting next clean energy purchase from House A to trigger relay actuation.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono self-start sm:self-auto">
              <span className="text-slate-500">Actuator:</span>
              <span className={isRelayOn ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {isRelayOn ? '5V RELAY ON' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: INSTANT VALUES vs CUMULATIVE VALUES */}
      <div className="space-y-4">
        {/* Section 1: Instantaneous Sensor Values */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isConsumer ? 'HOUSEHOLD CONSUMPTION TELEMETRY (Load Bus)' : 'INSTANT SENSOR VALUES (Live Solar Bus Telemetry)'}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {isConsumer ? 'Live Load Monitoring' : 'Real-time INA219'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Voltage */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  {isConsumer ? 'Grid Line Voltage' : 'Voltage'}
                </span>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  {tel.voltage.toFixed(2)} <span className="text-xs font-normal text-slate-400">V</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Bus DC</span>
            </div>

            {/* Current */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  {isConsumer ? 'Consumer Load Current' : 'Current'}
                </span>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  {(isConsumer ? consumerCurrent : tel.current).toFixed(3)}{' '}
                  <span className="text-xs font-normal text-slate-400">A</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {((isConsumer ? consumerCurrent : tel.current) * 1000).toFixed(0)} mA
              </span>
            </div>

            {/* Power */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  {isConsumer ? 'Consumer Load Power' : 'Instant Power'}
                </span>
                <div className={`text-xl font-black font-mono mt-0.5 ${isConsumer && !isRelayOn ? 'text-slate-400' : 'text-emerald-400'}`}>
                  {(isConsumer ? consumerPower : tel.power).toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">W</span>
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
              {isConsumer ? 'CUMULATIVE CLEAN ENERGY RECEIVED' : 'CUMULATIVE / INTEGRATED ENERGY'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Time-Integrated</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {isConsumer ? 'Total Solar Energy Received' : 'Metred Session Energy'}
                </span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {(isConsumer ? energyPurchased : tel.energy).toFixed(4)}{' '}
                  <span className="text-xs font-normal text-emerald-400">kWh</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block">
                {isConsumer ? 'Source Verification:' : 'Numerical Integration:'}
              </span>
              <p className="text-[11px] text-slate-500 font-mono">
                {isConsumer 
                  ? 'Smart meter verified delivery from House A Solar Array' 
                  : 'E = ∫ P(t) dt across active sampling loops'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distinction Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-slate-400 font-semibold">Physical Prototype Link:</strong>{' '}
          {isConsumer
            ? 'House B represents the Consumer Load terminal in the physical prototype. When you purchase energy from House A, the backend triggers the ESP32 relay module (GPIO 19), closing the circuit and illuminating the Consumer Load LED.'
            : 'House A represents the Solar Generation terminal in the physical prototype. Solar voltage and current are measured by the INA219 sensor and streamed via REST to the VoltTrade order book.'}
        </p>
      </div>
    </section>
  );
}
