'use client';

import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { sendDeviceCommand } from '../../lib/api';
import { Cpu, Power, Clock, Zap, CheckCircle2, Wifi, Activity } from 'lucide-react';

export default function HardwareHealth() {
  const { hardwareStatus, triggerRelayVisual } = useApp();
  const [testingRelay, setTestingRelay] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTestRelay = async () => {
    setTestingRelay(true);
    setFeedback('Dispatching ACTIVATE_LOAD to ESP32...');
    try {
      await sendDeviceCommand('ESP32-HOUSE-A', 'ACTIVATE_LOAD', 5000);
      triggerRelayVisual(5000);
      setFeedback('✓ Command sent! Relay energized (Consumer LED ON)');
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      triggerRelayVisual(5000);
      setFeedback(`Notice: ${err.message}`);
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setTestingRelay(false);
    }
  };

  const isOnline = hardwareStatus.isOnline;
  const isRelayActive = hardwareStatus.isRelayActive;

  const hardwareNodes = [
    {
      name: 'ESP32 WROOM-32',
      status: isOnline ? 'ONLINE' : 'OFFLINE',
      active: isOnline,
      color: isOnline ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      name: 'INA219 SENSOR',
      status: isOnline ? 'ACTIVE' : 'OFFLINE',
      active: isOnline,
      color: isOnline ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      name: 'OLED DISPLAY',
      status: isOnline ? 'ACTIVE' : 'STANDBY',
      active: isOnline,
      color: isOnline ? 'text-emerald-400' : 'text-slate-400',
    },
    {
      name: 'RELAY',
      status: isRelayActive ? 'ENERGIZED' : 'READY',
      active: true,
      color: isRelayActive ? 'text-amber-400 font-bold animate-pulse' : 'text-emerald-400',
    },
    {
      name: 'Wi-Fi',
      status: isOnline ? 'CONNECTED' : 'DISCONNECTED',
      active: isOnline,
      color: isOnline ? 'text-cyan-400' : 'text-rose-400',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
      {/* Background glow when relay is actuated */}
      {isRelayActive && (
        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse border-2 border-emerald-500/50 rounded-2xl" />
      )}

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                HARDWARE HEALTH
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Node: ESP32-HOUSE-A</p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {isOnline ? 'HEALTHY' : 'CHECK HARDWARE'}
          </span>
        </div>

        {/* Status Item Rows */}
        <div className="mt-3.5 space-y-2">
          {hardwareNodes.map((node) => (
            <div
              key={node.name}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
            >
              <span className="font-semibold text-slate-300 text-[11px]">{node.name}</span>
              <span className={`font-mono text-[11px] font-bold flex items-center gap-1.5 ${node.color}`}>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    node.active ? 'bg-current shadow-[0_0_6px_currentColor]' : 'bg-slate-600'
                  }`}
                />
                {node.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Details: Last Telemetry + Test Relay Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Last telemetry:
          </span>
          <span className="font-mono text-emerald-400 font-medium text-[11px]">
            {isOnline ? `${hardwareStatus.lastSeenSecondsAgo} seconds ago` : 'Offline'}
          </span>
        </div>

        <button
          onClick={handleTestRelay}
          disabled={testingRelay || isRelayActive}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {testingRelay ? 'Dispatching...' : 'Test Relay (5s)'}
        </button>

        {feedback && (
          <p className="text-[10px] text-emerald-400 text-center font-mono">{feedback}</p>
        )}
      </div>
    </div>
  );
}
