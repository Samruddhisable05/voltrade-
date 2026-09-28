#include "OLEDDisplay.h"
#include "config.h"

OLEDDisplay::OLEDDisplay()
  : display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET),
    isInitialized(false) {}

bool OLEDDisplay::begin() {
  if (display.begin(SSD1306_SWITCHCAPVCC, SCREEN_I2C_ADDRESS)) {
    isInitialized = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    showBootScreen();
    return true;
  }
  Serial.println("[OLED] Warning: SSD1306 OLED screen not detected on I2C address.");
  return false;
}

void OLEDDisplay::showBootScreen() {
  if (!isInitialized) return;
  display.clearDisplay();
  
  display.setTextSize(1);
  display.setCursor(18, 10);
  display.println(">> VOLTTRADE <<");
  
  display.drawFastHLine(10, 22, 108, SSD1306_WHITE);
  
  display.setCursor(20, 28);
  display.println("P2P Energy Node");
  
  display.setCursor(15, 42);
  display.println("ESP32 Smart Meter");

  display.setCursor(30, 54);
  display.println("Connecting...");
  
  display.display();
}

void OLEDDisplay::showDashboard(const SensorReadings& data, bool isWifiConnected, bool isRelayActive, const String& tradeStatus) {
  if (!isInitialized) return;
  display.clearDisplay();

  // Header Bar
  display.fillRect(0, 0, 128, 12, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(2, 2);
  display.print("VOLTTRADE");
  
  display.setCursor(76, 2);
  display.print(isWifiConnected ? "WiFi:OK" : "AP-MODE");
  
  display.setTextColor(SSD1306_WHITE);

  // Energy & Telemetry Grid
  display.setCursor(0, 16);
  display.printf("V: %4.1fV", data.voltage);
  display.setCursor(68, 16);
  display.printf("I: %4.0fmA", data.current_mA);

  display.setCursor(0, 28);
  display.printf("P: %4.1fW", data.power);
  display.setCursor(68, 28);
  display.printf("E:%5.3fkWh", data.energy_kWh);

  display.drawFastHLine(0, 39, 128, SSD1306_WHITE);

  // Status / Delivery Banner
  if (isRelayActive) {
    display.fillRect(0, 42, 128, 22, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
    display.setCursor(6, 45);
    display.print("* ENERGY DELIVERY *");
    display.setCursor(14, 54);
    display.print("LOAD LED : [ON]");
  } else {
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 43);
    display.printf("Src: %s", data.isHardwareLive ? "LIVE SOLAR" : "SIMULATED");
    
    display.setCursor(0, 54);
    if (tradeStatus.length() > 0) {
      display.printf("Trd: %s", tradeStatus.c_str());
    } else {
      display.print("Status: READY / MKT");
    }
  }

  display.display();
}

void OLEDDisplay::showDeliveryScreen(unsigned long remainingMs) {
  if (!isInitialized) return;
  display.clearDisplay();

  display.fillRect(0, 0, 128, 14, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK);
  display.setCursor(10, 3);
  display.print("TRADE FULFILLMENT");

  display.setTextColor(SSD1306_WHITE);
  display.setCursor(8, 22);
  display.print("RELAY: ENERGIZED");
  
  display.setCursor(8, 36);
  display.print("CONSUMER LOAD: ON");

  display.setCursor(8, 50);
  display.printf("Delivering... %1.1fs", remainingMs / 1000.0f);

  display.display();
}

void OLEDDisplay::showMessage(const String& line1, const String& line2, const String& line3) {
  if (!isInitialized) return;
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println(line1);
  display.setCursor(0, 26);
  display.println(line2);
  display.setCursor(0, 42);
  display.println(line3);
  display.display();
}
