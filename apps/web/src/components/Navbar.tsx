'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../lib/context';
import { 
  Zap, 
  Activity, 
  ShoppingBag, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Bell, 
  Cpu, 
  ChevronDown, 
  Settings,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  // On the dashboard, the dedicated DashboardHeader with hamburger drawer controls navigation
  if (pathname === '/dashboard') {
    return null;
  }

  const { currentUser, availableUsers, switchUser, hardwareStatus, notifications, unreadNotifsCount } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Energy Analytics', href: '/energy', icon: TrendingUp },
    { name: 'P2P Trades', href: '/trades', icon: ArrowRightLeft },
    { name: 'Transactions', href: '/transactions', icon: Layers },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Admin', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-950/40 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              <Zap className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                VOLT<span className="text-emerald-400">TRADE</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MVP
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">P2P Microgrid Renewable Trading</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Hardware Status, Notifications, and User Switcher */}
        <div className="flex items-center space-x-3">
          
          {/* Hardware Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-mono text-[11px]">ESP32</span>
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
              <span className="text-[10px] text-slate-500">({hardwareStatus.lastSeenSecondsAgo}s ago)</span>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Notifications"
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
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  <span>Microgrid Notifications</span>
                  <span className="text-[10px] text-emerald-400">{notifications.length} events</span>
                </div>
                <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No recent alerts</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-medium text-emerald-400">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-slate-500">Live</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Switcher Dropdown (Demo Feature for Judges) */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {currentUser.role === 'PRODUCER' ? '⚡' : currentUser.role === 'CONSUMER' ? '🔋' : '🛠️'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono">₹{currentUser.walletBalance.toFixed(2)}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Switch Demo Persona
                </div>
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between ${
                      currentUser.id === user.id
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p>{user.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{user.role}</p>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs">₹{user.walletBalance.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
