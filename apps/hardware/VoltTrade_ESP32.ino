/*
 * VOLTTRADE ESP32 SMART METER FIRMWARE
 * Peer-to-Peer Renewable Energy Trading Platform Node
 * 
 * Hardware:
 * - ESP32 WROOM-32
 * - INA219 Voltage/Current/Power sensor (I2C: SDA=21, SCL=22)
 * - 0.96" SSD1306 OLED (I2C: SDA=21, SCL=22)
 * - 5V Relay module (IN=GPIO 19)
 * - LED / Load representing the consumer
 */

#include <Arduino.h>
#include "config.h"
#include "WiFiManager.h"
#include "INA219Sensor.h"
#include "OLEDDisplay.h"
#include "RelayController.h"
#include "ApiClient.h"

// Hardware and Service instances
WiFiManager wifiManager;
INA219Sensor sensor;
OLEDDisplay oled;
RelayController relay(PIN_RELAY, RELAY_ACTIVE_LOW);
ApiClient api(BACKEND_BASE_URL, DEVICE_ID);

// Scheduling timers
unsigned long lastTelemetryTime = 0;
unsigned long lastCommandPollTime = 0;
unsigned long lastOledRefreshTime = 0;

// State tracking
SensorReadings currentReadings;
String lastTradeStatus = "READY";

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=========================================");
  Serial.println("   VOLTTRADE ESP32 SMART METER NODE      ");
  Serial.println("=========================================");

  // 1. Initialize Relay & Status LED
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, LOW);
  relay.begin();

  // 2. Initialize OLED Display
  oled.begin();

  // 3. Initialize INA219 Sensor
  sensor.begin();

  // 4. Connect to Wi-Fi / Fallback AP
  bool wifiOk = wifiManager.begin();
  if (wifiOk) {
    digitalWrite(PIN_STATUS_LED, HIGH);
  }

  // Initial sensor read
  currentReadings = sensor.read();
  oled.showDashboard(currentReadings, wifiManager.isConnected(), relay.isLoadActive(), "READY");

  Serial.println("[SYSTEM] Setup complete. Entering operational loop...");
}

void loop() {
  unsigned long now = millis();

  // Keep relay timer active (auto shut-off when time expires)
  relay.update();

  // Check and reconnect Wi-Fi if dropped
  wifiManager.checkAndReconnect();

  // 1. Refresh OLED display
  if (now - lastOledRefreshTime >= OLED_REFRESH_INTERVAL_MS) {
    lastOledRefreshTime = now;
    currentReadings = sensor.read();
    oled.showDashboard(
      currentReadings,
      wifiManager.isConnected(),
      relay.isLoadActive(),
      lastTradeStatus
    );
  }

  // 2. Transmit Live Telemetry to Backend
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;
    bool sent = api.sendTelemetry(currentReadings);
    if (sent) {
      Serial.printf("[TELEMETRY] Sent -> V:%.2fV | I:%.3fA | P:%.2fW | E:%.4fkWh\n",
        currentReadings.voltage, currentReadings.current, currentReadings.power, currentReadings.energy_kWh);
    }
  }

  // 3. Poll Backend for Trade Execution Commands (Relay Load Trigger)
  if (now - lastCommandPollTime >= COMMAND_POLL_INTERVAL_MS) {
    lastCommandPollTime = now;
    PendingCommand cmd = api.pollPendingCommands();
    if (cmd.hasCommand) {
      if (cmd.command == "ACTIVATE_LOAD") {
        Serial.printf("[TRADE] ACTIVATING CONSUMER LOAD FOR %lu ms\n", cmd.durationMs);
        lastTradeStatus = "ENERGY DELIVERED";
        relay.activateLoad(cmd.durationMs);
        api.acknowledgeCommand(cmd.commandId, "EXECUTED");
      }
    }
  }

  delay(20);
}
