'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../lib/context';
import DashboardNavigation from './DashboardNavigation';
import { 
  Menu, 
  Zap, 
  Bell, 
  Cpu, 
  ChevronDown, 
  ShieldCheck, 
  Sun, 
  BatteryCharging 
} from 'lucide-react';

export default function DashboardHeader() {
  const { currentUser, availableUsers, switchUser, hardwareStatus, notifications, unreadNotifsCount } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-6 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          
          {/* LEFT: Hamburger Button + Logo & Branding */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850 active:scale-95 transition flex items-center justify-center group"
              aria-label="Open navigation menu"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
            </button>

            {/* Logo & Brand */}
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white flex items-center">
                  VOLT<span className="text-emerald-400">TRADE</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                  CONTROL CENTER
                </span>
              </div>
            </Link>
          </div>

          {/* RIGHT: ESP32 Status + Notifications + User Profile */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            
            {/* ESP32 Connection Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">ESP32</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    hardwareStatus.isOnline
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className={hardwareStatus.isOnline ? 'text-emerald-400' : 'text-rose-400'}>
                  {hardwareStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </span>
              {hardwareStatus.isOnline && (
                <span className="text-[10px] text-slate-500 hidden md:inline">
                  ({hardwareStatus.lastSeenSecondsAgo}s ago)
                </span>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                    <span>Microgrid Alerts & Events</span>
                    <span className="text-[10px] text-emerald-400">{notifications.length} events</span>
                  </div>
                  <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">No alerts recorded</p>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-slate-500">Live</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                aria-label="User account menu"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.role === 'PRODUCER' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : currentUser.role === 'CONSUMER' ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-emerald-400 font-mono font-medium">₹{currentUser.walletBalance.toFixed(2)}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Switch Active Persona
                  </div>
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                        currentUser.id === user.id
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-200">{user.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-mono">{user.role}</p>
                      </div>
                      <span className="font-mono text-emerald-400 text-xs font-semibold">₹{user.walletBalance.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Drawer Sidebar */}
      <DashboardNavigation
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
