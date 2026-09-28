# VoltTrade REST API Documentation

Base URL: `http://localhost:4000/api` (or LAN IP for ESP32 hardware: `http://<SERVER_IP>:4000/api`)

---

## 1. IoT & Device Management

### `POST /api/devices/telemetry`
Transmits sensor readings from ESP32 IoT node or demo simulator.
- **Request Body**:
  ```json
  {
    "deviceId": "ESP32-HOUSE-A",
    "voltage": 12.45,
    "current": 0.852,
    "power": 10.61,
    "energy": 0.0482,
    "timestamp": "2026-09-28T10:30:00.000Z"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "telemetry": {
      "deviceId": "ESP32-HOUSE-A",
      "voltage": 12.45,
      "current": 0.852,
      "power": 10.61,
      "energy": 0.0482,
      "timestamp": "2026-09-28T10:30:00.000Z"
    }
  }
  ```

### `GET /api/devices`
Lists all registered microgrid devices with online/offline state.
- **Response `200 OK`**:
  ```json
  {
    "devices": [
      {
        "id": "device-house-a",
        "deviceId": "ESP32-HOUSE-A",
        "userId": "user-house-a",
        "name": "House A Rooftop Solar Smart Meter",
        "status": "ONLINE",
        "lastSeen": "2026-09-28T10:30:00.000Z",
        "createdAt": "2026-09-28T10:00:00.000Z"
      }
    ]
  }
  ```

### `GET /api/devices/:id`
Retrieves details and real-time status of a specific device.

### `POST /api/devices/:id/command`
Dispatches a hardware control command to the ESP32 (e.g., activates relay for consumer load LED).
- **Request Body**:
  ```json
  {
    "command": "ACTIVATE_LOAD",
    "duration": 5000
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "command": {
      "id": "cmd-abc-123",
      "deviceId": "ESP32-HOUSE-A",
      "command": "ACTIVATE_LOAD",
      "duration": 5000,
      "status": "PENDING"
    },
    "message": "Command ACTIVATE_LOAD sent to device ESP32-HOUSE-A"
  }
  ```

### `GET /api/devices/:deviceId/commands/pending`
Polled by ESP32 node fallback loop to fetch pending execution commands.

### `POST /api/devices/:deviceId/commands/:id/ack`
Acknowledges command completion from ESP32.

---

## 2. Energy Monitoring & Marketplace

### `GET /api/energy/live`
Fetches the latest live electrical telemetry, device status, and time since last heartbeat.
- **Query Params**: `deviceId` (optional)
- **Response `200 OK`**:
  ```json
  {
    "telemetry": {
      "deviceId": "ESP32-HOUSE-A",
      "voltage": 12.45,
      "current": 0.852,
      "power": 10.61,
      "energy": 0.0482,
      "timestamp": "2026-09-28T10:30:00.000Z"
    },
    "isDeviceOnline": true,
    "lastSeenSecondsAgo": 2
  }
  ```

### `GET /api/energy/history`
Returns time-series telemetry data for interactive charts.
- **Query Params**: `deviceId` (optional), `limit` (default: 30)

### `GET /api/energy/offers`
Lists current energy offers.
- **Query Params**: `status` (`AVAILABLE`, `PARTIALLY_SOLD`, `SOLD`, `CANCELLED`)

### `POST /api/energy/offers`
Solar producer publishes surplus renewable energy to the marketplace.
- **Request Body**:
  ```json
  {
    "userId": "user-house-a",
    "energyAmount": 2.5,
    "pricePerKwh": 10.50
  }
  ```

### `PATCH /api/energy/offers/:id`
Updates or cancels an existing energy offer.

### `GET /api/marketplace`
Aggregated marketplace overview with available offers and dynamic pricing engine recommendations.

---

## 3. Dynamic Pricing & AI Engine

### `GET /api/pricing/recommendation`
Deterministic dynamic pricing engine based on solar supply-to-demand ratio (SDR) and diurnal generation cycles.
- **Query Params**: `basePrice`, `supply`, `demand` (optional)
- **Response `200 OK`**:
  ```json
  {
    "basePrice": 10.0,
    "recommendedPrice": 9.20,
    "supplyLevel": "HIGH",
    "demandLevel": "MEDIUM",
    "priceChange": -0.80,
    "reason": "Midday peak solar generation window. High local renewable generation with surplus capacity drives green price discounts.",
    "calculatedAt": "2026-09-28T10:30:00.000Z"
  }
  ```

---

## 4. Trade Execution & Blockchain

### `POST /api/trades`
Consumer purchases energy directly or executes matching request.
- **Request Body**:
  ```json
  {
    "buyerId": "user-house-b",
    "offerId": "offer-solar-pack-1",
    "energyAmount": 1.2
  }
  ```
- **Lifecycle Executed**:
  1. Wallet debit from buyer (`user-house-b`)
  2. Trade record created (`MATCHED`)
  3. Wallet credit to seller (`user-house-a`)
  4. Mock Blockchain transaction notarized with realistic `0x...` EVM hash
  5. Relay command (`ACTIVATE_LOAD`) dispatched to ESP32 smart meter
  6. Status updated to `COMPLETED`

### `GET /api/trades`
Lists trades filtered by user or recent microgrid history.

### `GET /api/trades/:id`
Inspects trade details, step-by-step lifecycle verification, and blockchain confirmation data.

### `GET /api/transactions`
Section 16 full transaction ledger with transaction ID, producer, consumer, energy kWh, price, total ₹, timestamp, and blockchain hash.

---

## 5. Wallet & Environment

### `GET /api/wallet`
Returns virtual demo wallet balance and transaction ledger.

### `POST /api/wallet/topup`
Reloads virtual demo funds for testing.

### `GET /api/energy/impact`
Calculates estimated $CO_2$ avoided based on traded renewable energy ($0.82 \text{ kg } CO_2 / \text{kWh}$).
