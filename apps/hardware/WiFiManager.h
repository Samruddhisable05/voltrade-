#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>

class WiFiManager {
public:
  WiFiManager();
  bool begin();
  bool isConnected() const;
  String getIPAddress() const;
  bool checkAndReconnect();

private:
  bool inApMode;
  unsigned long lastReconnectAttempt;
};

#endif // WIFI_MANAGER_H
