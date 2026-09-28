# VoltTrade Hackathon Live Demo & Judging Guide

Follow this quick 2-minute walkthrough to demonstrate VoltTrade to hackathon judges.

---

## ⚡ The 5-Second Pitch
> "VoltTrade is a peer-to-peer renewable energy trading platform that turns rooftop solar prosumers into autonomous clean energy providers. Using IoT smart meters with ESP32 and INA219, we capture real-time solar generation, calculate dynamic green tariffs via our AI pricing engine, execute instant P2P trades with cryptographic blockchain notarization, and physically actuate power delivery to the consumer via hardware relays."

---

## 🚀 Live Demo Walkthrough (Step-by-Step)

### Step 1: Open the Dashboard (`http://localhost:3000/dashboard`)
1. Point out the **Live Telemetry Cards**:
   - Voltage ($12.4\text{ V}$), Current ($0.85\text{ A}$), Power ($10.5\text{ W}$), Cumulative Energy ($0.05\text{ kWh}$).
2. Show the **Hardware Status Pill**:
   - `ESP32: ONLINE ●` (or `OFFLINE` if unplugged, highlighting transparent data integrity).
3. Highlight the **AI Price Recommendation Engine card**:
   - Shows dynamic supply/demand status (`Supply: HIGH`, `Demand: MEDIUM`), recommended rate ($\text{₹}10.50/\text{kWh}$), and transparent algorithmic justification.

### Step 2: Producer Creates Energy Listing
1. Switch to **Producer View** (House A) in top navbar.
2. Note surplus generation.
3. Click **"List Energy for Sale"**.
4. Offer $1.5\text{ kWh}$ at the recommended price ($\text{₹}10.50/\text{kWh}$).
5. The offer immediately populates on the decentralized order book.

### Step 3: Consumer Buys Renewable Energy (`/marketplace`)
1. Switch user to **House B (Green Consumer)**.
2. Navigate to **Marketplace** (`/marketplace`).
3. Point out House A's listing.
4. Click **[BUY ENERGY]** and request $1.0\text{ kWh}$.
5. Click **"Confirm Purchase"**.

### Step 4: The Core Physical + Software Delivery (THE "WOW" MOMENT)
1. Watch the UI immediately update:
   - **Wallet Accounting**: House B debited $\text{₹}10.50$, House A credited $\text{₹}10.50$.
   - **Blockchain Verification**: Generates immutable EVM hash (e.g., `0x7A93...E21F`) with block number and gas receipt.
   - **Hardware Delivery Notification**:
     ```
     ENERGY DELIVERY
     ✓ COMMAND SENT
     ✓ LOAD ACTIVATED (Relay Energized)
     ```
2. Look at the physical hardware:
   - ESP32 OLED screen switches to:
     `* ENERGY DELIVERY *` / `LOAD LED : [ON]`
   - The 5V Relay clicks, and the **Consumer Load LED turns ON** for 5 seconds!

### Step 5: Verify Audit Trail & Impact
1. Navigate to **Transactions** (`/transactions`) to inspect the notarized ledger.
2. Navigate to **Energy Analytics** (`/energy`):
   - View generation vs. consumption curves.
   - Show the **Environmental Impact Card**: Estimated $CO_2$ emissions avoided ($0.82\text{ kg } CO_2$ per kWh traded) and equivalent tree-absorption months.
