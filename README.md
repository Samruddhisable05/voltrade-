# ⚡ VoltTrade — Peer-to-Peer Renewable Energy Trading Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-indigo.svg)](https://www.prisma.io/)
[![Hardware](https://img.shields.io/badge/Hardware-ESP32%20%2B%20INA219%20%2B%20Relay-orange.svg)]()

**VoltTrade** is an end-to-end, production-structured IoT microgrid energy trading platform built for hackathon demonstrations and real-world microgrids. It connects physical renewable generation (ESP32 + INA219 current/voltage sensor + 0.96" OLED + 5V Relay + Consumer Load LED) to a decentralized web marketplace, AI dynamic pricing engine, virtual double-entry wallet, and cryptographic blockchain transaction recording.

---

## 🏗️ Architecture & Data Flow

```text
ESP32 + INA219 (Solar Telemetry)
         │
         ▼  (HTTP POST /api/devices/telemetry)
VoltTrade REST API (Node.js + Express + Prisma)
         │
         ├─► Device Management (Heartbeat monitoring, ONLINE/OFFLINE status)
         ├─► Energy Monitoring & Surplus Pool
         ├─► AI Dynamic Pricing Engine (Supply-Demand Ratio & Solar Peak Diurnal Model)
         ├─► P2P Matching Engine & Decentralized Order Book
         ├─► Virtual Double-Entry Escrow Wallet (Buyer Debit / Seller Credit)
         ├─► Blockchain Service Abstraction (Mock EVM 0x... Notarization)
         │
         ▼  (HTTP POST /api/devices/:id/command -> "ACTIVATE_LOAD")
Physical ESP32 Relay Module Closes
         │
         ▼
Consumer Load LED Illuminates (Physical Energy Delivery)
```

---

## 📁 Monorepo Structure

```text
volttrade/
├── apps/
│   ├── web/               # Next.js 16 (App Router), TypeScript, Tailwind CSS, Recharts
│   ├── api/               # Express backend, TypeScript, Modular Services
│   └── hardware/          # Modular ESP32 Arduino firmware (INA219, OLED, Relay, WiFi)
├── packages/
│   ├── database/          # Prisma schema, SQLite database, Seed script
│   ├── shared/            # Shared TypeScript interfaces (Trade, Offer, Device, Telemetry)
│   └── blockchain/        # BlockchainService interface & MockBlockchainService
├── docs/
│   ├── api.md             # Complete REST API reference
│   ├── architecture.md    # Architecture diagrams and sequence flows
│   └── demo-guide.md      # Step-by-step hackathon judging script
├── tests/
│   └── trade-flow.test.ts # End-to-end acceptance integration test suite
└── package.json           # Workspace manager
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
# Push database schema to SQLite (dev.db)
npm run db:push

# Populate realistic demo records (House A Producer, House B Consumer, ESP32 device, historical trades)
npm run seed
```

### 3. Run Automated Acceptance Test Suite
```bash
npm run test:flow
```
*Validates 18/18 integration assertions: Pricing engine, device heartbeat timeout, mock blockchain hashes, power formulas, wallet accounting, and hardware relay queue.*

### 4. Start the Application
```bash
# In Terminal 1: Start Express API server (Port 4000)
npm run dev:api

# In Terminal 2: Start Next.js Web Dashboard (Port 3000)
npm run dev:web
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## ⚡ 5-Minute Hackathon Demo Flow

1. **Live Dashboard (`/dashboard`)**:
   - View real-time INA219 sensor telemetry: Voltage ($12.4\text{ V}$), Current ($0.85\text{ A}$), Power ($10.5\text{ W}$), Cumulative Energy ($0.05\text{ kWh}$).
   - Observe the **Device Status Card**: shows `ESP32: ONLINE ●` with seconds since last heartbeat.
   - Inspect the **AI Price Recommendation Engine**: Recommended green tariff ($\text{₹}10.50/\text{kWh}$) based on local supply vs. demand.
2. **List Energy for Sale (`/marketplace`)**:
   - Switch persona to **House A (Producer)** via the top navigation switcher.
   - Click **"List Energy for Sale"** and offer $1.5\text{ kWh}$.
3. **Consumer Buys Solar Power**:
   - Switch persona to **House B (Consumer)**.
   - Click **[BUY ENERGY]** on House A's listing.
   - Confirm purchase.
4. **Physical & Cryptographic Delivery**:
   - **Wallet Accounting**: Buyer debited $\text{₹}10.50$, Producer credited $\text{₹}10.50$.
   - **Blockchain Verification**: Notarized with EVM transaction hash (e.g. `0x74FB8F...E708`).
   - **ESP32 Relay Command**: Backend dispatches `ACTIVATE_LOAD` for 5000ms.
   - Physical relay energizes -> **Consumer Load LED turns ON**!
   - Dashboard renders: `ENERGY DELIVERY: ✓ COMMAND SENT ✓ LOAD ACTIVATED`.
5. **Auditing & Impact**:
   - View the immutable ledger on `/transactions`.
   - View estimated $CO_2$ emissions avoided on `/energy`.

---

## 🔌 Hardware Setup (ESP32 + INA219 + Relay)

Detailed hardware pinouts and wiring schematics are provided in [apps/hardware/README.md](apps/hardware/README.md).

- **ESP32 GPIO 21**: INA219 SDA & OLED SDA
- **ESP32 GPIO 22**: INA219 SCL & OLED SCL
- **ESP32 GPIO 19**: 5V Relay Module IN pin
- **Relay COM & NO**: Connected in series with Consumer Load LED & resistor.
