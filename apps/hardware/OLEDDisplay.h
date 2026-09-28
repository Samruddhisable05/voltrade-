#ifndef OLED_DISPLAY_H
#define OLED_DISPLAY_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "INA219Sensor.h"

class OLEDDisplay {
public:
  OLEDDisplay();
  bool begin();
  void showBootScreen();
  void showDashboard(const SensorReadings& data, bool isWifiConnected, bool isRelayActive, const String& tradeStatus = "");
  void showDeliveryScreen(unsigned long remainingMs);
  void showMessage(const String& line1, const String& line2, const String& line3);

private:
  Adafruit_SSD1306 display;
  bool isInitialized;
};

#endif // OLED_DISPLAY_H
