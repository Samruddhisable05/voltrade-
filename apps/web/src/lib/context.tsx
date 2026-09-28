'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getLiveEnergy, getWalletData, getNotifications, getUsers } from './api';

export interface UserProfile {
  id: string;
  name: string;
  role: 'PRODUCER' | 'CONSUMER' | 'ADMIN';
  email: string;
  walletBalance: number;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-house-a',
    name: 'House A (Solar Producer)',
    role: 'PRODUCER',
    email: 'house-a@volttrade.local',
    walletBalance: 350.0,
  },
  {
    id: 'user-house-b',
    name: 'House B (Green Consumer)',
    role: 'CONSUMER',
    email: 'house-b@volttrade.local',
    walletBalance: 500.0,
  },
  {
    id: 'user-admin',
    name: 'Grid Admin Operator',
    role: 'ADMIN',
    email: 'admin@volttrade.local',
    walletBalance: 1000.0,
  },
];

interface AppContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  hardwareStatus: {
    isOnline: boolean;
    lastSeenSecondsAgo: number;
    telemetry: any;
    isRelayActive: boolean;
  };
  notifications: any[];
  unreadNotifsCount: number;
  refreshData: () => Promise<void>;
  triggerRelayVisual: (durationMs?: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS[0]);
  const [hardwareStatus, setHardwareStatus] = useState<{
    isOnline: boolean;
    lastSeenSecondsAgo: number;
    telemetry: any;
    isRelayActive: boolean;
  }>({
    isOnline: true,
    lastSeenSecondsAgo: 2,
    telemetry: {
      deviceId: 'ESP32-HOUSE-A',
      voltage: 12.45,
      current: 0.852,
      power: 10.61,
      energy: 0.0482,
      timestamp: new Date().toISOString(),
    },
    isRelayActive: false,
  });
  const [notifications, setNotifications] = useState<any[]>([]);

  // Trigger visual relay feedback on dashboard when load activated
  const triggerRelayVisual = useCallback((durationMs: number = 5000) => {
    setHardwareStatus((prev) => ({ ...prev, isRelayActive: true }));
    setTimeout(() => {
      setHardwareStatus((prev) => ({ ...prev, isRelayActive: false }));
    }, durationMs);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch live telemetry
      const live = await getLiveEnergy('ESP32-HOUSE-A').catch(() => null);
      if (live) {
        setHardwareStatus((prev) => ({
          ...prev,
          isOnline: live.isDeviceOnline,
          lastSeenSecondsAgo: live.lastSeenSecondsAgo,
          telemetry: live.telemetry || prev.telemetry,
        }));
      }

      // 2. Fetch current wallet
      const walletRes = await getWalletData(currentUser.id).catch(() => null);
      if (walletRes?.wallet) {
        setCurrentUser((prev) => ({
          ...prev,
          walletBalance: walletRes.wallet.balance,
        }));
      }

      // 3. Fetch notifications
      const notifs = await getNotifications(currentUser.id).catch(() => null);
      if (notifs?.notifications) {
        setNotifications(notifs.notifications);
      }
    } catch {}
  }, [currentUser.id]);

  // Initial load
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, [refreshData]);

  const switchUser = (userId: string) => {
    const found = availableUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        availableUsers,
        switchUser,
        hardwareStatus,
        notifications,
        unreadNotifsCount,
        refreshData,
        triggerRelayVisual,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
