#include "WiFiManager.h"
#include "config.h"

WiFiManager::WiFiManager()
  : inApMode(false),
    lastReconnectAttempt(0) {}

bool WiFiManager::begin() {
  WiFi.mode(WIFI_STA);
  Serial.printf("[WiFi] Connecting to %s ...\n", WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Wait up to 10 seconds for Wi-Fi connection
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    inApMode = false;
    Serial.printf("[WiFi] Connected! IP Address: %s\n", WiFi.localIP().toString().c_str());
    return true;
  }

  // Fallback to Access Point mode if local router is unreachable
  Serial.println("[WiFi] Connection failed. Starting fallback Access Point mode...");
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  inApMode = true;
  Serial.printf("[WiFi] AP Mode Active: %s (IP: %s)\n", AP_SSID, WiFi.softAPIP().toString().c_str());
  return false;
}

bool WiFiManager::isConnected() const {
  return (WiFi.status() == WL_CONNECTED) || inApMode;
}

String WiFiManager::getIPAddress() const {
  if (inApMode) {
    return WiFi.softAPIP().toString();
  }
  return WiFi.localIP().toString();
}

bool WiFiManager::checkAndReconnect() {
  if (inApMode) return false;
  if (WiFi.status() == WL_CONNECTED) return true;

  unsigned long now = millis();
  if (now - lastReconnectAttempt > 10000) {
    lastReconnectAttempt = now;
    Serial.println("[WiFi] Reconnecting...");
    WiFi.reconnect();
  }
  return false;
}
