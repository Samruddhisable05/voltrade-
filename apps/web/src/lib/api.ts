// Base URL for VoltTrade API
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMsg = `API request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

// Telemetry & Device APIs
export const getLiveEnergy = (deviceId?: string) =>
  fetchJson<{ telemetry: any; isDeviceOnline: boolean; lastSeenSecondsAgo: number }>(`/energy/live${deviceId ? `?deviceId=${deviceId}` : ''}`);

export const getEnergyHistory = (deviceId?: string, limit: number = 30) =>
  fetchJson<{ history: any[] }>(`/energy/history?limit=${limit}${deviceId ? `&deviceId=${deviceId}` : ''}`);

export const getDevices = () =>
  fetchJson<{ devices: any[] }>('/devices');

export const sendDeviceCommand = (deviceId: string, command: string, duration: number = 5000) =>
  fetchJson<{ success: boolean; command: any }>(`/devices/${deviceId}/command`, {
    method: 'POST',
    body: JSON.stringify({ command, duration }),
  });

// Marketplace & Offers APIs
export const getMarketplace = () =>
  fetchJson<{ offers: any[]; pricingRecommendation: any }>('/marketplace');

export const getEnergyOffers = (status?: string) =>
  fetchJson<{ offers: any[] }>(`/energy/offers${status ? `?status=${status}` : ''}`);

export const createEnergyOffer = (userId: string, energyAmount: number, pricePerKwh: number) =>
  fetchJson<{ success: boolean; offer: any }>('/energy/offers', {
    method: 'POST',
    body: JSON.stringify({ userId, energyAmount, pricePerKwh }),
  });

// Trade APIs
export const executeBuyTrade = (params: { buyerId: string; offerId?: string; energyAmount: number }) =>
  fetchJson<{ success: boolean; trade: any; message?: string }>('/trades', {
    method: 'POST',
    body: JSON.stringify(params),
  });

export const getTrades = (userId?: string) =>
  fetchJson<{ trades: any[] }>(`/trades${userId ? `?userId=${userId}` : ''}`);

export const getTradeById = (id: string) =>
  fetchJson<{ trade: any; blockchainTx: any }>(`/trades/${id}`);

export const getTransactions = () =>
  fetchJson<{ transactions: any[] }>('/transactions');

// Dynamic Pricing
export const getPricingRecommendation = () =>
  fetchJson<any>('/pricing/recommendation');

// Wallet APIs
export const getWalletData = (userId?: string) =>
  fetchJson<{ wallet: any; transactions: any[] }>(`/wallet${userId ? `?userId=${userId}` : ''}`);

export const topUpWallet = (userId: string, amount: number) =>
  fetchJson<{ success: boolean; wallet: any }>('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  });

// Analytics & Impact
export const getDashboardAggregates = (userId?: string) =>
  fetchJson<any>(`/energy/dashboard${userId ? `?userId=${userId}` : ''}`);

export const getEnvironmentalImpact = () =>
  fetchJson<any>('/energy/impact');

// Admin & Notifications
export const getUsers = () =>
  fetchJson<{ users: any[] }>('/admin/users');

export const getNotifications = (userId?: string) =>
  fetchJson<{ notifications: any[] }>(`/admin/notifications${userId ? `?userId=${userId}` : ''}`);

export const markNotificationsRead = (userId?: string) =>
  fetchJson<{ success: boolean }>('/admin/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });

export const simulateTelemetryPulse = (data: { deviceId?: string; voltage?: number; current?: number }) =>
  fetchJson<{ success: boolean; telemetry: any }>('/admin/simulate-telemetry', {
    method: 'POST',
    body: JSON.stringify(data),
  });
