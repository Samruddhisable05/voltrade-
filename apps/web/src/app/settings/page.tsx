'use client';

import React, { useState } from 'react';
import { Settings, Cpu, Globe, Sliders, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function SettingsPage() {
  const [emissionsFactor, setEmissionsFactor] = useState(0.82);
  const [backendUrl, setBackendUrl] = useState('http://localhost:4000/api');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          SYSTEM CONFIGURATION
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
          Hardware & Platform Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure IoT endpoints, hardware pinouts, and microgrid emissions calculations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Hardware & IoT Configuration Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ESP32 IoT Node Parameters</h3>
              <p className="text-xs text-slate-400">Firmware target: ESP-WROOM-32 + INA219 + SSD1306 + Relay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Device Identifier</label>
              <input
                type="text"
                disabled
                value="ESP32-HOUSE-A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Bound to House A Rooftop Solar Meter</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Backend Ingestion Endpoint</label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">ESP32 config.h target</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="font-semibold text-slate-300 block mb-1">Default GPIO Pinout Map</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-400">
              <div>I2C SDA: <span className="text-emerald-400">GPIO 21</span></div>
              <div>I2C SCL: <span className="text-emerald-400">GPIO 22</span></div>
              <div>Relay Pin: <span className="text-emerald-400">GPIO 19</span></div>
              <div>Status LED: <span className="text-emerald-400">GPIO 2</span></div>
            </div>
          </div>
        </div>

        {/* Environmental Factor Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Environmental Emissions Model</h3>
              <p className="text-xs text-slate-400">Grid carbon intensity calculation formula</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Grid Emissions Factor (kg CO₂ / kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={emissionsFactor}
              onChange={(e) => setEmissionsFactor(parseFloat(e.target.value) || 0.82)}
              className="w-full max-w-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-emerald-500 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Standard central grid baseline: ~0.82 kg CO₂ avoided per 1.0 kWh solar microgrid trade.
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <button
          type="submit"
          className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          Save Configuration
        </button>

      </form>
    </div>
  );
}
