'use client';

import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { simulateTelemetryPulse, sendDeviceCommand } from '../../lib/api';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Power, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Users
} from 'lucide-react';

export default function AdminPage() {
  const { hardwareStatus, triggerRelayVisual, availableUsers, refreshData } = useApp();
  const [simVoltage, setSimVoltage] = useState<number>(12.6);
  const [simCurrent, setSimCurrent] = useState<number>(0.92);
  const [injecting, setInjecting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleInjectTelemetry = async () => {
    setInjecting(true);
    setFeedback('Transmitting telemetry pulse to API...');
    try {
      await simulateTelemetryPulse({
        deviceId: 'ESP32-HOUSE-A',
        voltage: simVoltage,
        current: simCurrent,
      });
      await refreshData();
      setFeedback(`✓ Telemetry pulse injected: ${simVoltage}V, ${simCurrent}A (${(simVoltage * simCurrent).toFixed(2)}W)`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`Injection notice: ${err.message}`);
    } finally {
      setInjecting(false);
    }
  };

  const handleTriggerRelay = async (durationMs: number = 5000) => {
    setFeedback(`Dispatching ACTIVATE_LOAD (${durationMs}ms) to ESP32...`);
    try {
      await sendDeviceCommand('ESP32-HOUSE-A', 'ACTIVATE_LOAD', durationMs);
      triggerRelayVisual(durationMs);
      setFeedback(`✓ Relay command sent! ESP32 load energized for ${durationMs / 1000}s`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      triggerRelayVisual(durationMs);
      setFeedback(`Command notice: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          GRID OPERATOR CONSOLE
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
          Admin & Hardware Diagnostic Control
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Live device diagnostics, sensor simulation overrides, and direct relay actuation tests.
        </p>
      </div>

      {/* HARDWARE DIAGNOSTICS & TELEMETRY SIMULATOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sensor Injection Override */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Manual Telemetry Override</h3>
              <p className="text-xs text-slate-400">Simulate solar pulse without hardware</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Bus Voltage (V):</span>
                <span className="font-mono text-emerald-400">{simVoltage.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="18.0"
                step="0.1"
                value={simVoltage}
                onChange={(e) => setSimVoltage(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-300 mb-1">
                <span>Current Draw (A):</span>
                <span className="font-mono text-emerald-400">{simCurrent.toFixed(2)} A</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={simCurrent}
                onChange={(e) => setSimCurrent(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center font-mono">
              <span className="text-slate-400">Calculated Power:</span>
              <span className="text-base font-bold text-white">
                {(simVoltage * simCurrent).toFixed(2)} Watts
              </span>
            </div>

            <button
              onClick={handleInjectTelemetry}
              disabled={injecting}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              {injecting ? 'Injecting...' : 'Inject Telemetry Pulse'}
            </button>
          </div>
        </div>

        {/* Relay Actuation Testing */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Power className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ESP32 Relay Command Test</h3>
                <p className="text-xs text-slate-400">Actuate Consumer Load LED via GPIO 19</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <p className="text-slate-400 text-[11px]">
                Sends direct HTTP command to <span className="font-mono text-emerald-400">POST /api/devices/ESP32-HOUSE-A/command</span>.
                The ESP32 polls the pending queue, energizes the 5V relay module, and illuminates the LED.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => handleTriggerRelay(3000)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
                >
                  3 Seconds
                </button>
                <button
                  onClick={() => handleTriggerRelay(5000)}
                  className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition"
                >
                  5 Seconds
                </button>
                <button
                  onClick={() => handleTriggerRelay(10000)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
                >
                  10 Seconds
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Current Relay State:</span>
            <span className={`ml-2 font-bold ${hardwareStatus.isRelayActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
              {hardwareStatus.isRelayActive ? 'ENERGIZED (LOAD ON)' : 'DE-ENERGIZED (OFF)'}
            </span>
          </div>
        </div>

      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-mono">{feedback}</span>
        </div>
      )}

      {/* Microgrid User Profiles */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm pb-2 border-b border-slate-800">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Registered Microgrid Accounts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {availableUsers.map((u) => (
            <div key={u.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">{u.role}</span>
              <p className="font-bold text-white mt-0.5">{u.name}</p>
              <p className="font-mono text-emerald-400 mt-1">Balance: ₹{u.walletBalance.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
