'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../../lib/context';
import { 
  Zap, 
  X, 
  Activity, 
  ShoppingBag, 
  TrendingUp, 
  ArrowRightLeft, 
  Layers, 
  Wallet, 
  ShieldCheck, 
  Cpu, 
  Sun, 
  ChevronRight,
  Gauge
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  exact?: boolean;
  isAnchor?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface DashboardNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardNavigation({ isOpen, onClose }: DashboardNavigationProps) {
  const pathname = usePathname();
  const { currentUser, hardwareStatus } = useApp();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const navSections: NavSection[] = [
    {
      label: 'MAIN',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: Activity, exact: true },
      ],
    },
    {
      label: 'ENERGY',
      items: [
        { name: 'Energy Analytics', href: '/energy', icon: TrendingUp },
        { name: 'Smart Meter', href: '/dashboard#smart-meter', icon: Gauge, isAnchor: true },
      ],
    },
    {
      label: 'TRADING',
      items: [
        { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
        { name: 'P2P Trades', href: '/trades', icon: ArrowRightLeft },
      ],
    },
    {
      label: 'FINANCE',
      items: [
        { name: 'Transactions', href: '/transactions', icon: Layers },
        { name: 'Wallet', href: '/wallet', icon: Wallet },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Admin', href: '/admin', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-slate-950 border-r border-slate-800/80 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Dashboard Navigation Sidebar"
      >
        {/* Drawer Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" onClick={onClose} className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                VOLT<span className="text-emerald-400">TRADE</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Control Center</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && !item.isAnchor;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        onClose();
                        if (item.isAnchor) {
                          const el = document.getElementById('smart-meter');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-emerald-400'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer: Active Hardware & Profile status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Microgrid Node</span>
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hardwareStatus.isOnline
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                      : 'bg-rose-500'
                  }`}
                />
                <span className={hardwareStatus.isOnline ? 'text-emerald-400' : 'text-rose-400'}>
                  {hardwareStatus.isOnline ? 'ESP32 ONLINE' : 'OFFLINE'}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase">{currentUser.role}</p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                ₹{currentUser.walletBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
