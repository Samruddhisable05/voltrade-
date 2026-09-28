# VoltTrade ESP32 Hardware Integration Guide

This directory contains the modular Arduino C++ firmware for the **VoltTrade Smart Meter IoT Node**.

---

## 1. Hardware Bill of Materials (BOM)

| Component | Description | Connection / Pin |
|---|---|---|
| **ESP32 NodeMCU** | 30-pin or 38-pin DevKit (ESP-WROOM-32) | Controller |
| **INA219 High-Side DC Sensor** | I2C Voltage, Current & Power monitor | SDA: GPIO 21, SCL: GPIO 22 |
| **0.96" SSD1306 OLED** | 128x64 I2C Graphic Display | SDA: GPIO 21, SCL: GPIO 22 |
| **1-Channel 5V Relay Module** | Electromechanical or Solid State Relay | IN: GPIO 19, VCC: 5V (VIN), GND: GND |
| **Consumer Load LED** | High-brightness LED with 220Ω resistor | Connected across Relay COM & NO contacts |
| **Simulated Renewable Source** | Mini Solar Cell (0.5V-6V) or 3.3V/5V DC source | Connected to INA219 Vin+ and Vin- |

---

## 2. Wiring Diagram & Pinouts

```text
       +-----------------------------------------------------------+
       |                       ESP32 DevKit                        |
       |                                                           |
       |  VIN (5V) ---------> INA219 VCC, OLED VCC, Relay VCC      |
       |  GND --------------> INA219 GND, OLED GND, Relay GND      |
       |  GPIO 21 (SDA) ----> INA219 SDA & OLED SDA                |
       |  GPIO 22 (SCL) ----> INA219 SCL & OLED SCL                |
       |  GPIO 19 ----------> Relay Module IN pin                  |
       +-----------------------------------------------------------+

                      SOLAR PANEL / RENEWABLE SOURCE
                                    │
                                    ▼
                         [ INA219 Vin+ pin ]
                         [ INA219 Vin- pin ]
                                    │
                                    ▼
                             PRODUCER BATTERY / BUS

                       CONSUMER LOAD CIRCUIT
         5V / DC Supply ───> [ Relay COM ]
                             [ Relay NO  ] ───> [ 220Ω Resistor ] ───> [ LED (+) ]
                                                                       [ LED (-) ] ───> GND
```

---

## 3. Arduino IDE / PlatformIO Setup

### Required Libraries (Install via Arduino Library Manager):
1. **Adafruit INA219** by Adafruit
2. **Adafruit SSD1306** by Adafruit
3. **Adafruit GFX Library** by Adafruit
4. **ArduinoJson** (Optional, used standard formatting)

### Configuration:
Edit `config.h`:
- `WIFI_SSID`: Your local Wi-Fi network SSID
- `WIFI_PASSWORD`: Your Wi-Fi password
- `BACKEND_BASE_URL`: IP address of the machine running VoltTrade backend API, e.g.:
  `http://192.168.1.50:4000/api`

---

## 4. Operational Flow & Demo Behavior

1. **Power Up**: OLED displays the VoltTrade boot screen and connects to WiFi.
2. **Real-time Telemetry**: Every 2 seconds, readings ($V$, $I$, $P$, $E_{cum}$) are measured via INA219 and sent to `POST /api/devices/telemetry`.
3. **P2P Trade Confirmation**: When a consumer purchases energy on the marketplace:
   - Backend registers confirmed trade and creates mock blockchain transaction.
   - ESP32 polls `GET /api/devices/:id/commands/pending` or receives command.
   - Relay activates GPIO 19, turning **ON** the Consumer Load LED for 5000ms.
   - OLED displays `ENERGY DELIVERY: LOAD LED [ON]`.
   - Command acknowledges back to backend as `EXECUTED`.
